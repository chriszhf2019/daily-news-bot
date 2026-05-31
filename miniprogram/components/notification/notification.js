// components/notification/notification.js
Component({
  properties: {
    // 通知类型
    type: {
      type: String,
      value: 'info' // info, success, warning, error
    },
    // 通知标题
    title: {
      type: String,
      value: ''
    },
    // 通知内容
    content: {
      type: String,
      value: ''
    },
    // 通知图标
    icon: {
      type: String,
      value: ''
    },
    // 显示时长
    duration: {
      type: Number,
      value: 3000
    },
    // 是否显示关闭按钮
    showClose: {
      type: Boolean,
      value: true
    },
    // 是否可点击
    clickable: {
      type: Boolean,
      value: false
    },
    // 是否自动关闭
    autoClose: {
      type: Boolean,
      value: true
    },
    // 位置
    position: {
      type: String,
      value: 'top' // top, center, bottom
    },
    // 背景色
    backgroundColor: {
      type: String,
      value: ''
    },
    // 文字颜色
    textColor: {
      type: String,
      value: ''
    },
    // 优先级（用于排序）
    priority: {
      type: Number,
      value: 0
    }
  },

  data: {
    // 是否显示通知
    visible: false,
    // 动画状态
    animationState: 'hidden', // hidden, showing, shown, hiding
    // 通知ID
    notificationId: '',
    // 定时器
    timeout: null
  },

  lifetimes: {
    attached() {
      this.generateNotificationId()
      this.setupEventListeners()
    },
    
    detached() {
      this.clearTimeout()
    }
  },

  methods: {
    // 生成通知ID
    generateNotificationId() {
      const id = 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      this.setData({ notificationId: id })
    },

    // 设置事件监听
    setupEventListeners() {
      // 监听应用级通知事件
      wx.onAppShow(() => {
        if (this.data.visible) {
          this.hideNotification()
        }
      })
    },

    // 显示通知
    showNotification(options = {}) {
      // 合并选项
      const notificationData = {
        ...this.properties,
        ...options,
        visible: true,
        animationState: 'showing'
      }

      this.setData(notificationData)

      // 触发动画
      this.triggerAnimation('showing', () => {
        this.setData({ animationState: 'shown' })
        
        // 自动关闭
        if (this.properties.autoClose && this.properties.duration > 0) {
          this.startAutoClose()
        }
      })

      // 触发显示事件
      this.triggerEvent('show', {
        id: this.data.notificationId,
        type: this.properties.type,
        title: this.properties.title,
        content: this.properties.content
      })

      return this.data.notificationId
    },

    // 隐藏通知
    hideNotification() {
      this.clearTimeout()
      
      this.setData({ animationState: 'hiding' })
      
      this.triggerAnimation('hiding', () => {
        this.setData({
          visible: false,
          animationState: 'hidden'
        })
        
        // 触发隐藏事件
        this.triggerEvent('hide', {
          id: this.data.notificationId,
          type: this.properties.type
        })
      })
    },

    // 开始自动关闭计时
    startAutoClose() {
      this.clearTimeout()
      
      this.setData({
        timeout: setTimeout(() => {
          this.hideNotification()
        }, this.properties.duration)
      })
    },

    // 清除定时器
    clearTimeout() {
      if (this.data.timeout) {
        clearTimeout(this.data.timeout)
        this.setData({ timeout: null })
      }
    },

    // 触发动画
    triggerAnimation(state, callback) {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: state === 'showing' ? 'ease-out' : 'ease-in'
      })

      let transform = 'translateY(-100%)'
      let opacity = 0

      if (state === 'showing') {
        transform = 'translateY(0)'
        opacity = 1
      } else if (state === 'hiding') {
        transform = 'translateY(-100%)'
        opacity = 0
      }

      animation.opacity(opacity).translateY(0).step()
      
      this.setData({
        animationData: animation.export()
      })

      setTimeout(callback, 300)
    },

    // 点击通知
    onNotificationTap() {
      if (this.properties.clickable) {
        this.triggerEvent('tap', {
          id: this.data.notificationId,
          type: this.properties.type,
          title: this.properties.title,
          content: this.properties.content
        })
        
        // 如果是可点击的通知，点击后自动关闭
        if (this.properties.autoClose) {
          this.hideNotification()
        }
      }
    },

    // 关闭通知
    onCloseTap() {
      this.hideNotification()
    },

    // 获取通知图标
    getNotificationIcon() {
      if (this.properties.icon) {
        return this.properties.icon
      }

      const iconMap = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        loading: '⏳'
      }

      return iconMap[this.properties.type] || iconMap.info
    },

    // 获取通知样式
    getNotificationStyle() {
      const styleMap = {
        info: {
          backgroundColor: '#e3f2fd',
          textColor: '#1976d2',
          borderColor: '#2196f3'
        },
        success: {
          backgroundColor: '#e8f5e8',
          textColor: '#2e7d32',
          borderColor: '#4caf50'
        },
        warning: {
          backgroundColor: '#fff3e0',
          textColor: '#f57c00',
          borderColor: '#ff9800'
        },
        error: {
          backgroundColor: '#ffebee',
          textColor: '#c62828',
          borderColor: '#f44336'
        }
      }

      const defaultStyle = styleMap[this.properties.type] || styleMap.info
      
      return {
        backgroundColor: this.properties.backgroundColor || defaultStyle.backgroundColor,
        color: this.properties.textColor || defaultStyle.textColor,
        borderColor: defaultStyle.borderColor
      }
    },

    // 批量显示通知
    showBatch(notifications) {
      const self = this
      return notifications.map((notification, index) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const id = self.showNotification(notification)
            resolve(id)
          }, index * 100) // 错开显示时间
        })
      })
    },

    // 获取通知组件实例
    getNotificationComponent() {
      // 这里应该返回通知组件的实例
      // 实际实现中可能需要通过页面实例来获取
      return this
    },

    // 静默通知（不显示动画）
    showSilentNotification(options = {}) {
      const notificationData = {
        ...this.properties,
        ...options,
        visible: true,
        animationState: 'shown'
      }

      this.setData(notificationData)

      // 触发显示事件
      this.triggerEvent('show', {
        id: this.data.notificationId,
        type: this.properties.type,
        title: this.properties.title,
        content: this.properties.content
      })

      return this.data.notificationId
    },

    // 更新通知内容
    updateNotification(options = {}) {
      this.setData(options)
      
      this.triggerEvent('update', {
        id: this.data.notificationId,
        ...options
      })
    },

    // 获取通知状态
    getNotificationStatus() {
      return {
        visible: this.data.visible,
        animationState: this.data.animationState,
        id: this.data.notificationId,
        type: this.properties.type,
        title: this.properties.title,
        content: this.properties.content
      }
    },

    // 队列管理通知
    queueNotification(notification, priority = 0) {
      const queue = wx.getStorageSync('notificationQueue') || []
      
      queue.push({
        ...notification,
        id: 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        priority: priority,
        timestamp: Date.now()
      })
      
      // 按优先级排序
      queue.sort((a, b) => b.priority - a.priority)
      
      wx.setStorageSync('notificationQueue', queue)
      
      // 处理队列
      this.processNotificationQueue()
    },

    // 处理通知队列
    processNotificationQueue() {
      const queue = wx.getStorageSync('notificationQueue') || []
      
      if (queue.length > 0 && !this.data.visible) {
        const notification = queue.shift()
        wx.setStorageSync('notificationQueue', queue)
        
        this.showNotification(notification)
      }
    },

    // 清除所有通知
    clearAllNotifications() {
      this.clearTimeout()
      this.setData({
        visible: false,
        animationState: 'hidden'
      })
      
      // 清除队列
      wx.removeStorageSync('notificationQueue')
      
      this.triggerEvent('clearall')
    },

    // 显示进度通知
    showProgressNotification(options) {
      const defaultOptions = {
        type: 'info',
        title: '处理中...',
        content: '0%',
        icon: '⏳',
        duration: 0, // 不自动关闭
        autoClose: false
      }
      
      const notificationOptions = {
        ...defaultOptions,
        ...options
      }
      
      return this.showNotification(notificationOptions)
    },

    // 更新进度
    updateProgress(progress) {
      const content = `${Math.round(progress)}%`
      this.updateNotification({ content })
    },

    // 完成进度
    completeProgress() {
      this.updateNotification({
        type: 'success',
        title: '完成',
        content: '100%',
        icon: '✅',
        duration: 2000,
        autoClose: true
      })
    },

    // 显示加载状态
    showLoadingNotification(options = {}) {
      const loadingOptions = {
        type: 'loading',
        title: '加载中',
        content: options.content || '请稍候...',
        icon: '⏳',
        duration: 0,
        autoClose: false,
        ...options
      }
      
      return this.showNotification(loadingOptions)
    },

    // 隐藏加载状态
    hideLoadingNotification() {
      if (this.properties.type === 'loading') {
        this.hideNotification()
      }
    },

    // 显示成功通知
    showSuccessNotification(title, content = '', duration = 3000) {
      return this.showNotification({
        type: 'success',
        title,
        content,
        icon: '✅',
        duration,
        autoClose: true
      })
    },

    // 显示错误通知
    showErrorNotification(title, content = '', duration = 5000) {
      return this.showNotification({
        type: 'error',
        title,
        content,
        icon: '❌',
        duration,
        autoClose: true
      })
    },

    // 显示警告通知
    showWarningNotification(title, content = '', duration = 4000) {
      return this.showNotification({
        type: 'warning',
        title,
        content,
        icon: '⚠️',
        duration,
        autoClose: true
      })
    },

    // 显示信息通知
    showInfoNotification(title, content = '', duration = 3000) {
      return this.showNotification({
        type: 'info',
        title,
        content,
        icon: 'ℹ️',
        duration,
        autoClose: true
      })
    }
  }
})