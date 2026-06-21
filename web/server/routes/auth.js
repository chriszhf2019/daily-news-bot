import { Router } from 'express'
import crypto from 'crypto'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'point-news-secret-change-in-production'

// 密码哈希 (scrypt + salt)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return salt + ':' + derivedKey.toString('hex')
}

function verifyPassword(password, hash) {
  const [salt, key] = hash.split(':')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return key === derivedKey.toString('hex')
}

// JWT (HMAC-SHA256)
function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 7 * 86400 })).toString('base64url')
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + body).digest('base64url')
  return header + '.' + body + '.' + signature
}

function verifyToken(token) {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(parts[0] + '.' + parts[1]).digest('base64url')
  if (expectedSig !== parts[2]) return null
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}

// 注册
router.post('/register', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: '该邮箱已注册' })
    }

    const passwordHash = hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash,
        settings: { create: {} }
      },
      include: { settings: true }
    })

    const token = signToken({ userId: user.id, email: user.email })

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, settings: user.settings }
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({ error: '注册失败' })
  }
})

// 登录
router.post('/login', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { settings: true }
    })

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }

    const token = signToken({ userId: user.id, email: user.email })

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, settings: user.settings }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ error: '登录失败' })
  }
})

// 获取当前用户
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未登录' })
    }
    const decoded = verifyToken(auth.split(' ')[1])
    if (!decoded) {
      return res.status(401).json({ error: '登录已失效' })
    }

    const prisma = req.app.get('prisma')
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { settings: true }
    })

    if (!user) return res.status(404).json({ error: '用户不存在' })

    res.json({ id: user.id, email: user.email, name: user.name, avatar: user.avatar, settings: user.settings })
  } catch (error) {
    console.error('获取用户失败:', error)
    res.status(500).json({ error: '获取用户失败' })
  }
})

// 更新资料
router.put('/profile', async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: '未登录' })

    const decoded = verifyToken(auth.split(' ')[1])
    if (!decoded) return res.status(401).json({ error: '登录已失效' })

    const prisma = req.app.get('prisma')
    const { name, avatar } = req.body
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { ...(name && { name }), ...(avatar && { avatar }) }
    })

    res.json({ id: user.id, email: user.email, name: user.name, avatar: user.avatar })
  } catch (error) {
    console.error('更新失败:', error)
    res.status(500).json({ error: '更新失败' })
  }
})

export default router
