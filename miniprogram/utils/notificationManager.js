// utils/notificationManager.js
/**
 * 通知管理器 - 统一管理小程序中的各种通知
 */
class NotificationManager {
  constructor() {
    // 通知队列
    this.notificationQueue = []
    // 当前显示的通知
    this.currentNotifications = new Map()
    // 最大并发通知数
    this.maxConcurrentNotifications = 3
    // 默认配置
    this.defaultConfig = {
      duration: 3000,
      position: 'top',
      autoClose: true,
      showClose: true,
      clickable: false
    }
  }

  /**
   * 显示成功通知
   * @param {string} title 标题
   * @param {string} content 内容
   * @param {object} options 额外选项
   * @returns {string} 通知ID
   */
  showSuccess(title, content = '', options = {}) {
    return this.showNotification({
      type: 'success',
      title,
      content,
      icon: '✅',
      ...options
    })
  }

  /**
   * 显示错误通知
   * @param {string} title 标题
   * @param {string} content 内容
   * @param {object} options 额外选项
   * @returns {string} 通知ID
   */
  showError(title, content = '', options = {}) {
    return this.showNotification({
      type: 'error',
      title,
      content,
      icon: '❌',
      duration: 5000,
      ...options
    })
  }

  /**
   * 显示警告通知
   * @param {string} title 标题
   * @param {string} content 内容
   * @param {object} options 额外选项
   * @returns {string} 通知ID
   */
  showWarning(title, content = '', options = {}) {
    return this.showNotification({
      type: 'warning',
      title,
      content,
      icon: '⚠️',
      duration: 4000,
      ...options
    })
  }

  /**
   * 显示信息通知
   * @param {string} title 标题
   * @param {string} content 内容
   * @param {object} options 额外选项
   * @returns {string} 通知ID
   */
  showInfo(title, content = '', options = {}) {
    return this.showNotification({
      type: 'info',
      title,
      content,
      icon: 'ℹ️',
      ...options
    })
  }

  /**
   * 显示加载通知
   * @param {string} title 标题
   * @param {string} content 内容
   * @param {object} options 额外选项
   * @returns {string} 通知ID
   */
  showLoading(title = '加载中', content = '请稍候...', options = {}) {
    return this.showNotification({
      type: 'loading',
      title,
      content,
      icon: '⏳',
      duration: 0,
      autoClose: false,
      ...options
    })
  }

  /**
   * 显示进度通知
   * @param {string} title 标题
   * @param {number} progress 进度百分比
   * @param {object} options 额外选项
   * @returns {string} 通知ID
   */
  showProgress(title = '处理中...', progress = 0, options = {}) {
    const notificationId = this.showNotification({
      type: 'loading',
      title,
      content: `${Math.round(progress)}%`,
      icon: '⏳',
      duration: 0,
      autoClose: false,
      ...options
    })
    
    return {
      id: notificationId,
      update: (newProgress) => this.updateProgress(notificationId, newProgress),
      complete: (successTitle = '完成', successContent = '处理完成') => this.completeProgress(notificationId, successTitle, successContent),
      error: (errorTitle = '失败', errorContent = '处理失败') => this.errorProgress(notificationId, errorTitle, errorContent)
    }
  }

  /**
   * 显示自定义通知
   * @param {object} options 通知选项
   * @returns {string} 通知ID
   */
  showNotification(options = {}) {
    const config = { ...this.defaultConfig, ...options }
    const notificationId = this.generateId()
    
    // 创建通知对象
    const notification = {
      id: notificationId,
      ...config,
      timestamp: Date.now(),
      status: 'pending' // pending, showing, shown, hiding, hidden
    }
    
    // 检查是否需要队列
    if (this.currentNotifications.size >= this.maxConcurrentNotifications) {
      this.addToQueue(notification)
    } else {
      this.displayNotification(notification)
    }
    
    return notificationId
  }

  /**
   * 添加到队列
   * @param {object} notification 通知对象
   */
  addToQueue(notification) {
    // 按优先级排序
    const priority = notification.priority || 0
    const insertIndex = this.notificationQueue.findIndex(item => (item.priority || 0) < priority)
    
    if (insertIndex === -1) {
      this.notificationQueue.push(notification)
    } else {
      this.notificationQueue.splice(insertIndex, 0, notification)
    }
    
    // 触发队列事件
    this.triggerEvent('queuechange', {
      queueLength: this.notificationQueue.length,
      currentCount: this.currentNotifications.size
    })
  }

  /**
   * 显示通知
   * @param {object} notification 通知对象
   */
  displayNotification(notification) {
    notification.status = 'showing'
    this.currentNotifications.set(notification.id, notification)
    
    // 触发显示事件
    this.triggerEvent('show', notification)
    
    // 设置自动关闭
    if (notification.autoClose && notification.duration > 0) {
      notification.timeout = setTimeout(() => {
        this.hideNotification(notification.id)
      }, notification.duration)
    }
    
    // 模拟动画完成
    setTimeout(() => {
      if (notification.status === 'showing') {
        notification.status = 'shown'
        this.currentNotifications.set(notification.id, notification)
        this.triggerEvent('shown', notification)
      }
    }, 300)
    
    // 检查队列
    this.processQueue()
  }

  /**
   * 隐藏通知
   * @param {string} notificationId 通知ID
   */
  hideNotification(notificationId) {
    const notification = this.currentNotifications.get(notificationId)
    if (!notification) return
    
    notification.status = 'hiding'
    
    // 清除定时器
    if (notification.timeout) {
      clearTimeout(notification.timeout)
      notification.timeout = null
    }
    
    // 触发隐藏事件
    this.triggerEvent('hide', notification)
    
    // 模拟动画完成
    setTimeout(() => {
      notification.status = 'hidden'
      this.currentNotifications.delete(notificationId)
      this.triggerEvent('hidden', notification)
      
      // 处理队列
      this.processQueue()
    }, 300)
  }

  /**
   * 隐藏所有通知
   */
  hideAll() {
    const ids = Array.from(this.currentNotifications.keys())
    ids.forEach(id => this.hideNotification(id))
  }

  /**
   * 清除队列
   */
  clearQueue() {
    this.notificationQueue = []
    this.triggerEvent('queuechange', {
      queueLength: 0,
      currentCount: this.currentNotifications.size
    })
  }

  /**
   * 处理队列
   */
  processQueue() {
    while (
      this.notificationQueue.length > 0 && 
      this.currentNotifications.size < this.maxConcurrentNotifications
    ) {
      const nextNotification = this.notificationQueue.shift()
      this.displayNotification(nextNotification)
    }
    
    this.triggerEvent('queuechange', {
      queueLength: this.notificationQueue.length,
      currentCount: this.currentNotifications.size
    })
  }

  /**
   * 更新进度
   * @param {string} notificationId 通知ID
   * @param {number} progress 进度百分比
   */
  updateProgress(notificationId, progress) {
    const notification = this.currentNotifications.get(notificationId)
    if (notification && notification.type === 'loading') {
      notification.content = `${Math.round(progress)}%`
      this.triggerEvent('progress', {
        id: notificationId,
        progress: Math.round(progress)
      })
    }
  }

  /**
   * 完成进度
   * @param {string} notificationId 通知ID
   * @param {string} title 成功标题
   * @param {string} content 成功内容
   */
  completeProgress(notificationId, title = '完成', content = '处理完成') {
    const notification = this.currentNotifications.get(notificationId)
    if (notification) {
      notification.type = 'success'
      notification.title = title
      notification.content = content
      notification.icon = '✅'
      notification.duration = 2000
      notification.autoClose = true
      
      this.triggerEvent('complete', {
        id: notificationId,
        progress: 100
      })
    }
  }

  /**
   * 进度错误
   * @param {string} notificationId 通知ID
   * @param {string} title 错误标题
   * @param {string} content 错误内容
   */
  errorProgress(notificationId, title = '失败', content = '处理失败') {
    const notification = this.currentNotifications.get(notificationId)
    if (notification) {
      notification.type = 'error'
      notification.title = title
      notification.content = content
      notification.icon = '❌'
      notification.duration = 5000
      notification.autoClose = true
      
      this.triggerEvent('error', {
        id: notificationId,
        progress: 0
      })
    }
  }

  /**
   * 获取通知状态
   * @param {string} notificationId 通知ID
   * @returns {object|null} 通知状态
   */
  getNotificationStatus(notificationId) {
    const notification = this.currentNotifications.get(notificationId)
    return notification ? { ...notification } : null
  }

  /**
   * 获取所有活动通知
   * @returns {Array} 活动通知列表
   */
  getActiveNotifications() {
    return Array.from(this.currentNotifications.values()).map(notification => ({
      ...notification
    }))
  }

  /**
   * 获取队列状态
   * @returns {object} 队列状态
   */
  getQueueStatus() {
    return {
      queueLength: this.notificationQueue.length,
      currentCount: this.currentNotifications.size,
      maxConcurrent: this.maxConcurrentNotifications
    }
  }

  /**
   * 设置最大并发数
   * @param {number} maxCount 最大并发数
   */
  setMaxConcurrent(maxCount) {
    this.maxConcurrentNotifications = Math.max(1, Math.min(maxCount, 5))
    this.processQueue()
  }

  /**
   * 设置默认配置
   * @param {object} config 默认配置
   */
  setDefaultConfig(config) {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  /**
   * 批量显示通知
   * @param {Array} notifications 通知列表
   * @returns {Array} 通知ID列表
   */
  showBatch(notifications) {
    return notifications.map(notification => this.showNotification(notification))
  }

  /**
   * 优先级通知（高优先级会插队显示）
   * @param {object} options 通知选项
   * @returns {string} 通知ID
   */
  showPriority(options = {}) {
    return this.showNotification({
      ...options,
      priority: 10
    })
  }

  /**
   * 持久通知（不会自动关闭，需要手动隐藏）
   * @param {object} options 通知选项
   * @returns {string} 通知ID
   */
  showPersistent(options = {}) {
    return this.showNotification({
      ...options,
      autoClose: false,
      duration: 0
    })
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 触发事件
   * @param {string} eventName 事件名
   * @param {object} data 事件数据
   */
  triggerEvent(eventName, data) {
    // 可以通过小程序事件系统触发
    if (this.eventCallbacks && this.eventCallbacks[eventName]) {
      this.eventCallbacks[eventName].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Notification event callback error:', error)
        }
      })
    }
  }

  /**
   * 监听事件
   * @param {string} eventName 事件名
   * @param {function} callback 回调函数
   */
  on(eventName, callback) {
    if (!this.eventCallbacks) {
      this.eventCallbacks = {}
    }
    
    if (!this.eventCallbacks[eventName]) {
      this.eventCallbacks[eventName] = []
    }
    
    this.eventCallbacks[eventName].push(callback)
    
    // 返回取消监听的函数
    return () => {
      const index = this.eventCallbacks[eventName].indexOf(callback)
      if (index > -1) {
        this.eventCallbacks[eventName].splice(index, 1)
      }
    }
  }

  /**
   * 清除所有监听
   */
  clearListeners() {
    this.eventCallbacks = {}
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.hideAll()
    this.clearQueue()
    this.clearListeners()
    this.notificationQueue = []
    this.currentNotifications.clear()
  }
}

// 创建全局实例
const notificationManager = new NotificationManager()

// 导出单例
export default notificationManager

// 也导出类供需要创建新实例时使用
export { NotificationManager }