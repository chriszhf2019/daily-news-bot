// utils/interactionHandler.js
const { showLoading, hideLoading, showSuccess, showError, vibrateShort, vibrateLong } = require('./util.js')

class InteractionHandler {
  constructor() {
    this.touchStartY = 0
    this.touchEndY = 0
    this.touchStartX = 0
    this.touchEndX = 0
    this.swipeThreshold = 50
    this.longPressTimer = null
    this.doubleTapTimer = null
    this.lastTapTime = 0
    this.lastTapPosition = { x: 0, y: 0 }
  }

  // 下拉刷新处理
  setupPullToRefresh(page, onRefresh) {
    page.onPullDownRefresh = () => {
      showLoading('刷新中...')
      setTimeout(() => {
        hideLoading()
        if (onRefresh) {
          onRefresh()
        }
        wx.stopPullDownRefresh()
        showSuccess('刷新完成')
      }, 1000)
    }
  }

  // 上拉加载更多处理
  setupLoadMore(page, hasMore, onLoadMore) {
    page.onReachBottom = () => {
      if (hasMore) {
        if (onLoadMore) {
          onLoadMore()
        }
      } else {
        showError('没有更多数据了')
      }
    }
  }

  // 触摸开始
  onTouchStart(event) {
    const touch = event.touches[0]
    this.touchStartY = touch.clientY
    this.touchStartX = touch.clientX
    this.lastTapPosition = { x: touch.clientX, y: touch.clientY }
  }

  // 触摸结束
  onTouchEnd(event, callbacks = {}) {
    const touch = event.changedTouches[0]
    this.touchEndY = touch.clientY
    this.touchEndX = touch.clientX

    const deltaY = this.touchEndY - this.touchStartY
    const deltaX = this.touchEndX - this.touchStartX

    // 判断滑动方向
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // 垂直滑动
      if (deltaY > this.swipeThreshold) {
        callbacks.onSwipeDown && callbacks.onSwipeDown()
      } else if (deltaY < -this.swipeThreshold) {
        callbacks.onSwipeUp && callbacks.onSwipeUp()
      }
    } else {
      // 水平滑动
      if (deltaX > this.swipeThreshold) {
        callbacks.onSwipeRight && callbacks.onSwipeRight()
      } else if (deltaX < -this.swipeThreshold) {
        callbacks.onSwipeLeft && callbacks.onSwipeLeft()
      }
    }

    // 点击事件
    if (Math.abs(deltaY) < 10 && Math.abs(deltaX) < 10) {
      this.onTap(event, callbacks)
    }
  }

  // 点击事件处理
  onTap(event, callbacks = {}) {
    const now = Date.now()
    const touch = event.changedTouches[0]
    const tapDistance = Math.sqrt(
      Math.pow(touch.clientX - this.lastTapPosition.x, 2) +
      Math.pow(touch.clientY - this.lastTapPosition.y, 2)
    )

    // 双击检测
    if (now - this.lastTapTime < 300 && tapDistance < 30) {
      callbacks.onDoubleTap && callbacks.onDoubleTap()
      this.lastTapTime = 0
    } else {
      this.lastTapTime = now
      this.lastTapPosition = { x: touch.clientX, y: touch.clientY }
      
      // 单击延迟处理
      setTimeout(() => {
        if (Date.now() - this.lastTapTime >= 300) {
          callbacks.onTap && callbacks.onTap()
        }
      }, 300)
    }
  }

  // 长按事件处理
  onLongPress(event, callbacks = {}) {
    const touch = event.touches[0]
    
    this.longPressTimer = setTimeout(() => {
      callbacks.onLongPress && callbacks.onLongPress(touch)
      vibrateLong()
    }, 800)
  }

  // 取消长按
  cancelLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  // 页面切换动画
  navigateToDetail(newsId) {
    wx.navigateTo({
      url: `/pages/detail/detail?id=${newsId}`,
      animationType: 'slide-in-right',
      animationDuration: 300
    })
  }

  // 返回上一页动画
  navigateBack() {
    wx.navigateBack({
      animationType: 'slide-out-right',
      animationDuration: 300
    })
  }

  // 切换标签页
  switchTab(tabIndex, tabs) {
    if (tabIndex >= 0 && tabIndex < tabs.length) {
      vibrateShort()
      return tabIndex
    }
    return 0
  }

  // 卡片悬浮效果
  setupCardHover(cardElement, scale = 1.02) {
    if (!cardElement) return

    cardElement.addEventListener('touchstart', () => {
      cardElement.style.transform = `scale(${scale})`
      cardElement.style.transition = 'transform 0.1s ease'
    })

    cardElement.addEventListener('touchend', () => {
      cardElement.style.transform = 'scale(1)'
      cardElement.style.transition = 'transform 0.2s ease'
    })

    cardElement.addEventListener('touchcancel', () => {
      cardElement.style.transform = 'scale(1)'
      cardElement.style.transition = 'transform 0.2s ease'
    })
  }

  // 按钮点击反馈
  setupButtonFeedback(buttonElement) {
    if (!buttonElement) return

    buttonElement.addEventListener('touchstart', () => {
      buttonElement.style.opacity = '0.7'
      buttonElement.style.transform = 'scale(0.95)'
      vibrateShort()
    })

    buttonElement.addEventListener('touchend', () => {
      buttonElement.style.opacity = '1'
      buttonElement.style.transform = 'scale(1)'
    })

    buttonElement.addEventListener('touchcancel', () => {
      buttonElement.style.opacity = '1'
      buttonElement.style.transform = 'scale(1)'
    })
  }

  // 列表项动画
  animateListItems(items, delay = 100) {
    items.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '1'
        item.style.transform = 'translateY(0)'
      }, index * delay)
    })
  }

  // 骨架屏显示
  showSkeleton() {
    return new Promise((resolve) => {
      const skeletonAnimation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease-in-out'
      })

      skeletonAnimation.opacity(0.3).step().opacity(1).step()
      
      resolve(skeletonAnimation.export())
    })
  }

  // 加载动画
  showLoadingAnimation() {
    return wx.createAnimation({
      duration: 800,
      timingFunction: 'linear'
    }).rotate(360).step().rotate(0).step().export()
  }

  // 点赞动画
  likeAnimation(element) {
    if (!element) return

    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-in-out'
    })

    animation.scale(1.5).step().scale(1).step()
    element.setData({
      likeAnimation: animation.export()
    })

    vibrateShort()
  }

  // 收藏动画
  favoriteAnimation(element) {
    if (!element) return

    const animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-in-out'
    })

    animation.rotate(180).scale(1.2).step().rotate(360).scale(1).step()
    element.setData({
      favoriteAnimation: animation.export()
    })

    vibrateShort()
  }

  // 分享弹窗动画
  showShareModal() {
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })

    animation.opacity(0).scale(0.8).step().opacity(1).scale(1).step()
    
    return animation.export()
  }

  // 隐藏分享弹窗
  hideShareModal() {
    const animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in'
    })

    animation.opacity(1).step().opacity(0).scale(0.8).step()
    
    return animation.export()
  }

  // 滚动到顶部
  scrollToTop(scrollView) {
    if (scrollView) {
      scrollView.scrollTo({
        top: 0,
        duration: 500
      })
    }
  }

  // 滚动到底部
  scrollToBottom(scrollView) {
    if (scrollView) {
      scrollView.scrollTo({
        top: 999999,
        duration: 500
      })
    }
  }

  // 平滑滚动到指定位置
  smoothScrollTo(scrollView, top, duration = 300) {
    if (scrollView) {
      scrollView.scrollTo({
        top: top,
        duration: duration
      })
    }
  }

  // 页面切换效果
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
  }

  // 手势缩放处理
  setupPinchZoom(element, callbacks = {}) {
    let initialDistance = 0
    let currentScale = 1

    element.onTouchStart = (event) => {
      if (event.touches.length === 2) {
        const touch1 = event.touches[0]
        const touch2 = event.touches[1]
        
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )
      }
    }

    element.onTouchMove = (event) => {
      if (event.touches.length === 2) {
        const touch1 = event.touches[0]
        const touch2 = event.touches[1]
        
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )

        const scale = currentDistance / initialDistance
        const newScale = Math.max(0.5, Math.min(3, currentScale * scale))

        callbacks.onPinch && callbacks.onPinch(newScale)
      }
    }

    element.onTouchEnd = () => {
      currentScale = 1
      initialDistance = 0
    }
  }

  // 防止误触
  preventAccidentalTap(callback, delay = 300) {
    let isProcessing = false
    
    return () => {
      if (isProcessing) return
      
      isProcessing = true
      callback()
      
      setTimeout(() => {
        isProcessing = false
      }, delay)
    }
  }

  // 适配不同屏幕尺寸
  adaptToScreen() {
    const systemInfo = wx.getSystemInfoSync()
    const { windowWidth, windowHeight, statusBarHeight } = systemInfo
    
    return {
      screenWidth: windowWidth,
      screenHeight: windowHeight,
      statusBarHeight: statusBarHeight,
      safeAreaTop: statusBarHeight,
      safeAreaBottom: windowHeight - (statusBarHeight + 44) // 减去导航栏高度
    }
  }

  // 主题切换动画
  themeTransition(fromTheme, toTheme) {
    const animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-in-out'
    })

    if (fromTheme === 'light' && toTheme === 'dark') {
      // 暗色主题切换动画
      return animation.backgroundColor('#1a1a1a').step().export()
    } else if (fromTheme === 'dark' && toTheme === 'light') {
      // 亮色主题切换动画
      return animation.backgroundColor('#ffffff').step().export()
    }

    return animation.export()
  }
}

module.exports = new InteractionHandler()