// components/mobile-interaction/mobile-interaction.js
const interactionHandler = require('../../utils/interactionHandler.js')

Component({
  properties: {
    enablePullRefresh: {
      type: Boolean,
      value: true
    },
    enableInfiniteScroll: {
      type: Boolean,
      value: true
    },
    enableSwipeGestures: {
      type: Boolean,
      value: true
    },
    enableLongPress: {
      type: Boolean,
      value: true
    },
    enableHapticFeedback: {
      type: Boolean,
      value: true
    },
    enableFloatingButton: {
      type: Boolean,
      value: true
    },
    scrollThreshold: {
      type: Number,
      value: 100
    },
    longPressDelay: {
      type: Number,
      value: 800
    },
    swipeThreshold: {
      type: Number,
      value: 50
    }
  },

  data: {
    isRefreshing: false,
    isLoadingMore: false,
    scrollTop: 0,
    showFloatingButton: false,
    showPullRefresh: false,
    touchStart: null,
    touchMove: null,
    touchEnd: null,
    animationData: {},
    floatingButtonAnimation: {},
    pullRefreshAnimation: {}
  },

  lifetimes: {
    attached() {
      this.initInteractionFeatures()
    }
  },

  methods: {
    // 初始化交互功能
    initInteractionFeatures() {
      if (this.properties.enablePullRefresh) {
        this.setupPullToRefresh()
      }
      
      if (this.properties.enableInfiniteScroll) {
        this.setupInfiniteScroll()
      }
      
      if (this.properties.enableSwipeGestures) {
        this.setupSwipeGestures()
      }
      
      if (this.properties.enableLongPress) {
        this.setupLongPress()
      }
      
      if (this.properties.enableFloatingButton) {
        this.setupFloatingButton()
      }
    },

    // 设置下拉刷新
    setupPullToRefresh() {
      const that = this
      
      this.onPullDownRefresh = () => {
        if (this.data.isRefreshing) return
        
        that.setData({ isRefreshing: true })
        
        // 触发动画
        const animation = wx.createAnimation({
          duration: 300,
          timingFunction: 'ease-out'
        })
        
        animation.rotate(360).scale(1.1).step().scale(1).rotate(0).step()
        that.setData({
          pullRefreshAnimation: animation.export()
        })
        
        // 触发父组件刷新事件
        that.triggerEvent('refresh')
      }
    },

    // 设置无限滚动
    setupInfiniteScroll() {
      this.onReachBottom = () => {
        if (this.data.isLoadingMore) return
        
        this.setData({ isLoadingMore: true })
        
        // 延迟触发加载更多事件
        setTimeout(() => {
          this.triggerEvent('loadmore')
          this.setData({ isLoadingMore: false })
        }, 500)
      }
    },

    // 设置滑动手势
    setupSwipeGestures() {
      this.touchStart = this.handleTouchStart.bind(this)
      this.touchMove = this.handleTouchMove.bind(this)
      this.touchEnd = this.handleTouchEnd.bind(this)
    },

    // 设置长按功能
    setupLongPress() {
      this.longPressTimer = null
      this.longPressTriggered = false
    },

    // 设置悬浮按钮
    setupFloatingButton() {
      const that = this
      
      this.setData({
        showFloatingButton: false
      })
      
      // 监听滚动事件
      this.onPageScroll = (e) => {
        const { scrollTop } = e
        that.setData({ scrollTop })
        
        // 显示/隐藏悬浮按钮
        if (scrollTop > 200) {
          that.showFloatingButton()
        } else {
          that.hideFloatingButton()
        }
      }
    },

    // 显示悬浮按钮
    showFloatingButton() {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-out'
      })
      
      animation.opacity(0).scale(0.8).step().opacity(1).scale(1).step()
      
      this.setData({
        showFloatingButton: true,
        floatingButtonAnimation: animation.export()
      })
    },

    // 隐藏悬浮按钮
    hideFloatingButton() {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-in'
      })
      
      animation.opacity(1).step().opacity(0).scale(0.8).step()
      
      this.setData({
        floatingButtonAnimation: animation.export()
      })
      
      setTimeout(() => {
        this.setData({ showFloatingButton: false })
      }, 300)
    },

    // 处理触摸开始
    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX
      this.touchStartY = e.touches[0].clientY
      this.touchStartTime = Date.now()
      
      // 长按检测
      if (this.properties.enableLongPress) {
        this.startLongPress(e.touches[0])
      }
    },

    // 处理触摸移动
    handleTouchMove(e) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - this.touchStartX
      const deltaY = touch.clientY - this.touchStartY
      
      // 取消长按
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
      
      // 触发滑动事件
      if (this.properties.enableSwipeGestures) {
        if (Math.abs(deltaX) > this.properties.swipeThreshold) {
          if (deltaX > 0) {
            this.triggerEvent('swiperight', { deltaX })
          } else {
            this.triggerEvent('swipeleft', { deltaX })
          }
        }
        
        if (Math.abs(deltaY) > this.properties.swipeThreshold) {
          if (deltaY > 0) {
            this.triggerEvent('swipedown', { deltaY })
          } else {
            this.triggerEvent('swipeup', { deltaY })
          }
        }
      }
    },

    // 处理触摸结束
    handleTouchEnd(e) {
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - this.touchStartX
      const deltaY = touch.clientY - this.touchStartY
      const deltaTime = Date.now() - this.touchStartTime
      
      // 取消长按
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
      
      // 轻拍检测
      if (!this.longPressTriggered && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        if (deltaTime < 300) {
          this.triggerEvent('tap', { touch })
        }
      }
      
      this.longPressTriggered = false
    },

    // 开始长按
    startLongPress(touch) {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
      }
      
      this.longPressTimer = setTimeout(() => {
        this.longPressTriggered = true
        this.triggerEvent('longpress', { touch })
        
        // 震动反馈
        if (this.properties.enableHapticFeedback) {
          wx.vibrateLong()
        }
      }, this.properties.longPressDelay)
    },

    // 悬浮按钮点击
    onFloatingButtonTap() {
      this.triggerEvent('floatingtap')
      
      // 按钮动画
      const animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease-in-out'
      })
      
      animation.scale(1.2).step().scale(1).step()
      
      this.setData({
        floatingButtonAnimation: animation.export()
      })
    },

    // 滚动到顶部
    scrollToTop() {
      this.triggerEvent('scrolltotop')
      
      // 滚动动画
      const animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease-out'
      })
      
      animation.opacity(0.8).step().opacity(1).step()
      
      this.setData({
        scrollToTopAnimation: animation.export()
      })
    },

    // 页面切换动画
    pageTransition(type = 'slide') {
      const animations = {
        slide: {
          enter: 'slide-in-right',
          exit: 'slide-out-left'
        },
        fade: {
          enter: 'fade-in',
          exit: 'fade-out'
        },
        zoom: {
          enter: 'zoom-in',
          exit: 'zoom-out'
        }
      }
      
      return animations[type] || animations.slide
    },

    // 适配安全区域
    getSafeArea() {
      const systemInfo = wx.getSystemInfoSync()
      const { windowHeight, statusBarHeight } = systemInfo
      
      return {
        top: statusBarHeight,
        bottom: windowHeight - (statusBarHeight + 44),
        full: windowHeight
      }
    },

    // 获取手势信息
    getGestureInfo(e) {
      const touch = e.touches[0]
      return {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
    },

    // 播放触觉反馈
    playHapticFeedback(type = 'light') {
      if (!this.properties.enableHapticFeedback) return
      
      const feedbackTypes = {
        light: () => wx.vibrateShort(),
        medium: () => wx.vibrateLong(),
        heavy: () => {
          wx.vibrateShort()
          setTimeout(() => wx.vibrateShort(), 100)
        }
      }
      
      feedbackTypes[type] && feedbackTypes[type]()
    },

    // 添加动画类
    addAnimationClass(element, className, duration = 300) {
      if (element) {
        element.classList.add(className)
        setTimeout(() => {
          element.classList.remove(className)
        }, duration)
      }
    },

    // 性能优化：节流函数
    throttle(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    },

    // 性能优化：防抖函数
    debounce(func, wait) {
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
  }
})