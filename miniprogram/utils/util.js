// utils/util.js
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 格式化日期为中文显示
const formatDateCN = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  
  return `${year}年${month}月${day}日 ${weekday}`
}

// 获取相对时间
const getRelativeTime = date => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

// 字符串截取
const truncateText = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 防抖函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 验证手机号
const validatePhone = (phone) => {
  const phoneReg = /^1[3-9]\d{9}$/
  return phoneReg.test(phone)
}

// 验证邮箱
const validateEmail = (email) => {
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailReg.test(email)
}

// 复制到剪贴板
const copyToClipboard = (text) => {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: resolve,
      fail: reject
    })
  })
}

// 显示加载提示
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title: title,
    mask: true
  })
}

// 隐藏加载提示
const hideLoading = () => {
  wx.hideLoading()
}

// 显示成功提示
const showSuccess = (title = '操作成功', duration = 1500) => {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: duration
  })
}

// 显示错误提示
const showError = (title = '操作失败', duration = 1500) => {
  wx.showToast({
    title: title,
    icon: 'error',
    duration: duration
  })
}

// 显示警告提示
const showWarning = (title, duration = 1500) => {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: duration
  })
}

// 预览图片
const previewImage = (current, urls) => {
  wx.previewImage({
    current: current,
    urls: urls
  })
}

// 获取系统信息
const getSystemInfo = () => {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: resolve,
      fail: reject
    })
  })
}

// 获取位置信息
const getLocation = () => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: resolve,
      fail: reject
    })
  })
}

// 保存图片到相册
const saveImageToPhotosAlbum = (imagePath) => {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: resolve,
      fail: reject
    })
  })
}

// 选择图片
const chooseImage = (count = 1, sizeType = ['original', 'compressed'], sourceType = ['album', 'camera']) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: count,
      sizeType: sizeType,
      sourceType: sourceType,
      success: resolve,
      fail: reject
    })
  })
}

// 预览PDF
const previewPDF = (filePath) => {
  wx.openDocument({
    filePath: filePath,
    fileType: 'pdf'
  })
}

// 设置导航栏颜色
const setNavigationBarColor = (frontColor, backgroundColor) => {
  wx.setNavigationBarColor({
    frontColor: frontColor,
    backgroundColor: backgroundColor,
    animation: {
      duration: 300,
      timingFunc: 'easeIn'
    }
  })
}

// 设置导航栏标题
const setNavigationBarTitle = (title) => {
  wx.setNavigationBarTitle({
    title: title
  })
}

// 震动反馈
const vibrateShort = () => {
  wx.vibrateShort()
}

const vibrateLong = () => {
  wx.vibrateLong()
}

// 播放声音
const playSound = (src) => {
  const audio = wx.createInnerAudioContext()
  audio.src = src
  audio.play()
}

// 网络状态检查
const checkNetwork = () => {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType)
      },
      fail: () => {
        resolve('unknown')
      }
    })
  })
}

module.exports = {
  formatTime,
  formatDateCN,
  getRelativeTime,
  truncateText,
  generateId,
  debounce,
  throttle,
  validatePhone,
  validateEmail,
  copyToClipboard,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showWarning,
  previewImage,
  getSystemInfo,
  getLocation,
  saveImageToPhotosAlbum,
  chooseImage,
  previewPDF,
  setNavigationBarColor,
  setNavigationBarTitle,
  vibrateShort,
  vibrateLong,
  playSound,
  checkNetwork
}