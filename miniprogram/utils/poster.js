/**
 * 通用分享海报生成器
 * 用法: const poster = require('../../utils/poster.js')
 *       poster.generate(newsData, callback)
 *       → callback(tempFilePath) 或保存到相册
 */

function generate(news, pageInstance) {
  return new Promise((resolve, reject) => {
    if (!news || !news.title) {
      reject(new Error('新闻数据无效'))
      return
    }

    wx.showLoading({ title: '生成海报...' })

    // 如果有 ai_analysis 数据直接用，否则先调用 DeepSeek 生成
    const doGenerate = () => {
      setTimeout(() => {
        const query = wx.createSelectorQuery()
        query.select('#posterCanvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (!res || !res[0]) {
              wx.hideLoading()
              reject(new Error('Canvas 未就绪'))
              return
            }

            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            const dpr = wx.getSystemInfoSync().pixelRatio || 2
            const sw = wx.getSystemInfoSync().screenWidth
            const rpx = sw / 750
            const w = 600 * rpx
            const h = 850 * rpx
            canvas.width = w * dpr
            canvas.height = h * dpr
            ctx.scale(dpr, dpr)

            // 背景
            const bg = ctx.createLinearGradient(0, 0, w, h)
            bg.addColorStop(0, '#0f172a')
            bg.addColorStop(0.5, '#1e293b')
            bg.addColorStop(1, '#0f172a')
            ctx.fillStyle = bg
            ctx.fillRect(0, 0, w, h)

            // 装饰
            ctx.fillStyle = 'rgba(99,102,241,0.08)'
            ctx.beginPath(); ctx.arc(w * 0.85, h * 0.1, w * 0.25, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = 'rgba(16,185,129,0.06)'
            ctx.beginPath(); ctx.arc(w * 0.15, h * 0.88, w * 0.2, 0, Math.PI * 2); ctx.fill()

            // 品牌
            ctx.fillStyle = '#818cf8'
            ctx.font = `bold ${w * 0.045}px sans-serif`
            ctx.fillText('NewsBrief', w * 0.06, h * 0.07)

            // 日期
            const now = new Date()
            const dateStr = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`
            ctx.fillStyle = 'rgba(255,255,255,0.35)'
            ctx.font = `${w * 0.03}px sans-serif`
            ctx.fillText(dateStr, w * 0.06, h * 0.105)

            // 来源标签
            const source = news.source || 'NewsBrief'
            ctx.fillStyle = 'rgba(99,102,241,0.2)'
            roundRect(ctx, w * 0.06, h * 0.13, w * 0.35, h * 0.045, w * 0.012)
            ctx.fill()
            ctx.fillStyle = '#a5b4fc'
            ctx.font = `${w * 0.028}px sans-serif`
            ctx.fillText(`📌 ${source}`, w * 0.08, h * 0.16)

            // 标题
            ctx.fillStyle = '#f1f5f9'
            ctx.font = `bold ${w * 0.048}px sans-serif`
            wrapText(ctx, news.title.substring(0, 80), w * 0.06, h * 0.24, w * 0.88, h * 0.055)

            // AI 解读区域
            ctx.fillStyle = 'rgba(255,255,255,0.05)'
            roundRect(ctx, w * 0.06, h * 0.42, w * 0.88, h * 0.35, w * 0.02)
            ctx.fill()

            const interp = (news.ai_analysis?.interpretation) || 'AI 深度解读生成中...'
            ctx.fillStyle = '#fbbf24'
            ctx.font = `bold ${w * 0.035}px sans-serif`
            ctx.fillText('✨ AI 深度解读', w * 0.09, h * 0.46)
            ctx.fillStyle = 'rgba(255,255,255,0.85)'
            ctx.font = `${w * 0.033}px sans-serif`
            wrapText(ctx, interp.substring(0, 100), w * 0.09, h * 0.50, w * 0.82, h * 0.04)

            const pred = (news.ai_analysis?.prediction) || '趋势分析中...'
            ctx.fillStyle = '#a78bfa'
            ctx.font = `bold ${w * 0.032}px sans-serif`
            ctx.fillText('🔮 趋势预测', w * 0.09, h * 0.64)
            ctx.fillStyle = 'rgba(255,255,255,0.75)'
            ctx.font = `${w * 0.03}px sans-serif`
            wrapText(ctx, pred.substring(0, 60), w * 0.09, h * 0.67, w * 0.82, h * 0.035)

            // 标签
            const tags = (news.tags || []).slice(0, 4)
            if (tags.length) {
              ctx.fillStyle = 'rgba(255,255,255,0.5)'
              ctx.font = `${w * 0.026}px sans-serif`
              ctx.fillText(tags.map(t => `#${t}`).join('  '), w * 0.06, h * 0.82)
            }

            // 底部
            ctx.fillStyle = 'rgba(255,255,255,0.25)'
            ctx.font = `${w * 0.026}px sans-serif`
            ctx.fillText('扫一扫查看详情 · NewsBrief 智能情报', w * 0.2, h * 0.95)

            wx.canvasToTempFilePath({
              canvas, success: (r) => {
                wx.hideLoading()
                resolve(r.tempFilePath)
              },
              fail: (e) => {
                wx.hideLoading()
                reject(e)
              }
            })
          })
      }, 300)
    }

    // 如果缺少 AI 分析，先快速生成
    if (!news.ai_analysis?.interpretation && pageInstance) {
      const apiKey = wx.getStorageSync('deepseek_api_key') || 'sk-70dae237a40e444385e0856079829d35'
      wx.request({
        url: 'https://api.deepseek.com/chat/completions',
        method: 'POST',
        header: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        data: {
          model: 'deepseek-chat', temperature: 0.5, max_tokens: 500,
          messages: [{ role: 'user', content: `分析这条新闻，返回JSON：{"interpretation":"30字解读","prediction":"20字预测"}\n\n${news.title}` }]
        },
        success: (resp) => {
          try {
            let t = resp.data.choices[0].message.content
            if (t.startsWith('```')) t = t.split('```')[1].replace('json', '')
            const r = JSON.parse(t)
            news.ai_analysis = { ...news.ai_analysis, interpretation: r.interpretation, prediction: r.prediction }
          } catch (e) {}
          doGenerate()
        },
        fail: doGenerate
      })
    } else {
      doGenerate()
    }
  })
}

function saveToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => { wx.showToast({ title: '已保存到相册', icon: 'success' }); resolve() },
      fail: (e) => {
        if (e.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '需要相册权限', content: '请在设置中允许小程序保存到相册',
            success: (r) => { if (r.confirm) wx.openSetting() }
          })
        }
        reject(e)
      }
    })
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  let line = '', lines = []
  for (let i = 0; i < text.length; i++) {
    const test = line + text[i]
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line); line = text[i]
    } else { line = test }
  }
  if (line) lines.push(line)
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH))
}

module.exports = { generate, saveToAlbum }
