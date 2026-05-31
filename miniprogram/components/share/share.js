// components/share/share.js
Component({
  properties: {
    // 分享标题
    title: {
      type: String,
      value: '今日新闻简报'
    },
    // 分享描述
    desc: {
      type: String,
      value: '获取最新AI动态、商业财经、科技前沿、国际要闻'
    },
    // 分享图片
    imageUrl: {
      type: String,
      value: '/images/news-default.png'
    },
    // 分享路径
    path: {
      type: String,
      value: '/pages/index/index'
    },
    // 是否显示分享菜单
    showMenu: {
      type: Boolean,
      value: true
    },
    // 是否显示分享弹窗
    showShareModal: {
      type: Boolean,
      value: false
    },
    // 分享类型 (friends, timeline, etc.)
    shareType: {
      type: Number,
      value: 0 // 0: 普通分享, 1: 图片分享
    },
    // 自定义分享内容
    customShareContent: {
      type: Object,
      value: {}
    }
  },

  data: {
    // 分享选项
    shareOptions: [
      {
        id: 'wechat',
        name: '微信好友',
        icon: '💬',
        color: '#07c160',
        type: 'friend'
      },
      {
        id: 'timeline',
        name: '朋友圈',
        icon: '🌍',
        color: '#576b95',
        type: 'timeline'
      },
      {
        id: 'qq',
        name: 'QQ',
        icon: '📱',
        color: '#1296db',
        type: 'qq'
      },
      {
        id: 'qzone',
        name: 'QQ空间',
        icon: '🎯',
        color: '#ffcc00',
        type: 'qzone'
      },
      {
        id: 'weibo',
        name: '微博',
        icon: '📢',
        color: '#e6162d',
        type: 'weibo'
      },
      {
        id: 'copy',
        name: '复制链接',
        icon: '🔗',
        color: '#666666',
        type: 'copy'
      }
    ],
    // 是否显示选项
    showOptions: false,
    // 分享内容
    shareContent: {}
  },

  lifetimes: {
    attached() {
      this.initShareContent()
    }
  },

  methods: {
    // 初始化分享内容
    initShareContent() {
      const content = {
        title: this.properties.title,
        desc: this.properties.desc,
        path: this.properties.path,
        imageUrl: this.properties.imageUrl
      }

      // 合并自定义分享内容
      if (Object.keys(this.properties.customShareContent).length > 0) {
        Object.assign(content, this.properties.customShareContent)
      }

      this.setData({
        shareContent: content
      })
    },

    // 打开分享菜单
    openShareMenu() {
      if (this.properties.showMenu) {
        // 显示原生分享菜单
        wx.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        })
      }
    },

    // 显示分享选项
    showShareOptions() {
      this.setData({
        showOptions: true
      })
    },

    // 隐藏分享选项
    hideShareOptions() {
      this.setData({
        showOptions: false
      })
    },

    // 选择分享方式
    selectShareOption(e) {
      const { option } = e.currentTarget.dataset
      
      this.hideShareOptions()
      
      switch (option.type) {
        case 'friend':
          this.shareToWeChat()
          break
        case 'timeline':
          this.shareToTimeline()
          break
        case 'qq':
          this.shareToQQ()
          break
        case 'qzone':
          this.shareToQZone()
          break
        case 'weibo':
          this.shareToWeibo()
          break
        case 'copy':
          this.copyLink()
          break
        default:
          this.shareToWeChat()
      }
    },

    // 分享给微信好友
    shareToWeChat() {
      const content = this.data.shareContent
      
      wx.shareAppMessage({
        title: content.title,
        desc: content.desc,
        path: content.path,
        imageUrl: content.imageUrl,
        success: (res) => {
          this.showSuccess('分享成功')
          this.triggerEvent('share', {
            type: 'wechat',
            success: true,
            res: res
          })
        },
        fail: (err) => {
          this.showError('分享失败')
          this.triggerEvent('share', {
            type: 'wechat',
            success: false,
            error: err
          })
        }
      })
    },

    // 分享到朋友圈
    shareToTimeline() {
      const content = this.data.shareContent
      
      wx.showShareImage({
        title: content.title,
        path: content.path,
        imageUrl: content.imageUrl,
        success: (res) => {
          this.showSuccess('分享成功')
          this.triggerEvent('share', {
            type: 'timeline',
            success: true,
            res: res
          })
        },
        fail: (err) => {
          this.showError('分享失败')
          this.triggerEvent('share', {
            type: 'timeline',
            success: false,
            error: err
          })
        }
      })
    },

    // 分享到QQ
    shareToQQ() {
      const content = this.data.shareContent
      
      // 使用小程序分享API
      wx.showShareMenu({
        withShareTicket: false,
        menus: ['shareAppMessage']
      })
      
      // 这里需要使用第三方SDK或者引导用户使用QQ浏览器打开
      wx.showModal({
        title: '分享到QQ',
        content: '请复制链接在QQ中打开分享',
        confirmText: '复制链接',
        success: (res) => {
          if (res.confirm) {
            this.copyLink()
          }
        }
      })
    },

    // 分享到QQ空间
    shareToQZone() {
      const content = this.data.shareContent
      
      wx.showModal({
        title: '分享到QQ空间',
        content: '请复制链接在QQ空间中打开分享',
        confirmText: '复制链接',
        success: (res) => {
          if (res.confirm) {
            this.copyLink()
          }
        }
      })
    },

    // 分享到微博
    shareToWeibo() {
      const content = this.data.shareContent
      
      wx.showModal({
        title: '分享到微博',
        content: '请复制链接在微博中打开分享',
        confirmText: '复制链接',
        success: (res) => {
          if (res.confirm) {
            this.copyLink()
          }
        }
      })
    },

    // 复制链接
    copyLink() {
      const content = this.data.shareContent
      const link = `https://servicewechat.com/your-app-id/latest${content.path}`
      
      wx.setClipboardData({
        data: link,
        success: () => {
          this.showSuccess('链接已复制到剪贴板')
          this.triggerEvent('share', {
            type: 'copy',
            success: true,
            data: link
          })
        },
        fail: (err) => {
          this.showError('复制失败')
          this.triggerEvent('share', {
            type: 'copy',
            success: false,
            error: err
          })
        }
      })
    },

    // 生成小程序码
    generateMiniProgramCode() {
      const content = this.data.shareContent
      
      wx.request({
        url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit',
        method: 'POST',
        data: {
          scene: `path=${content.path}&title=${encodeURIComponent(content.title)}`,
          page: 'pages/index/index',
          width: 280,
          auto_color: false,
          line_color: { r: 0, g: 0, b: 0 },
          is_hyaline: false
        },
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            // 保存到本地
            const fs = wx.getFileSystemManager()
            const filePath = `${wx.env.USER_DATA_PATH}/miniprogram_code.png`
            
            fs.writeFileSync(filePath, res.data, 'base64')
            
            // 显示小程序码
            wx.previewImage({
              current: filePath,
              urls: [filePath]
            })
            
            this.triggerEvent('codecreated', {
              success: true,
              filePath: filePath
            })
          } else {
            this.showError('生成小程序码失败')
          }
        },
        fail: (err) => {
          this.showError('网络请求失败')
          console.error('生成小程序码失败:', err)
        }
      })
    },

    // 群分享
    shareToGroup() {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage']
      })
      
      // 引导用户点击右上角分享
      wx.showToast({
        title: '请点击右上角分享到群聊',
        icon: 'none'
      })
    },

    // 保存到相册
    saveToAlbum() {
      const content = this.data.shareContent
      
      wx.saveImageToPhotosAlbum({
        filePath: content.imageUrl,
        success: () => {
          this.showSuccess('保存成功')
          this.triggerEvent('save', {
            success: true,
            filePath: content.imageUrl
          })
        },
        fail: (err) => {
          if (err.errMsg.includes('auth deny')) {
            wx.showModal({
              title: '权限提示',
              content: '需要相册权限才能保存图片',
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting()
                }
              }
            })
          } else {
            this.showError('保存失败')
          }
        }
      })
    },

    // 生成分享图片
    generateShareImage() {
      const that = this
      
      wx.showLoading({
        title: '生成中...'
      })
      
      // 使用canvas生成分享图片
      const ctx = wx.createCanvasContext('shareCanvas', this)
      
      // 绘制背景
      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, 300, 400)
      
      // 绘制标题
      ctx.setFillStyle('#333333')
      ctx.setFontSize(16)
      ctx.setTextAlign('center')
      ctx.fillText(this.properties.title, 150, 50)
      
      // 绘制描述
      ctx.setFillStyle('#666666')
      ctx.setFontSize(12)
      const desc = this.properties.desc
      const descLines = desc.match(/.{1,20}/g) || [desc]
      descLines.forEach((line, index) => {
        ctx.fillText(line, 150, 80 + index * 16)
      })
      
      // 绘制小程序码占位
      ctx.setFillStyle('#f0f0f0')
      ctx.fillRect(100, 200, 100, 100)
      ctx.setFillStyle('#999999')
      ctx.setFontSize(10)
      ctx.fillText('小程序码', 150, 255)
      
      // 绘制底部信息
      ctx.setFillStyle('#007aff')
      ctx.setFontSize(14)
      ctx.fillText('今日新闻简报', 150, 350)
      
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          success: (res) => {
            wx.hideLoading()
            that.setData({
              shareImagePath: res.tempFilePath
            })
            that.showSuccess('生成分享图片成功')
          },
          fail: (err) => {
            wx.hideLoading()
            that.showError('生成失败')
            console.error('生成分享图片失败:', err)
          }
        }, this)
      })
    },

    // 显示成功提示
    showSuccess(message) {
      wx.showToast({
        title: message,
        icon: 'success',
        duration: 2000
      })
    },

    // 显示错误提示
    showError(message) {
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    },

    // 触发分享事件
    triggerShareEvent(type, data) {
      this.triggerEvent('share', {
        type: type,
        ...data
      })
    },

    // 更新分享内容
    updateShareContent(content) {
      const newContent = {
        ...this.data.shareContent,
        ...content
      }
      
      this.setData({
        shareContent: newContent
      })
      
      this.triggerEvent('contentchange', {
        content: newContent
      })
    },

    // 获取分享统计
    getShareStats() {
      return new Promise((resolve, reject) => {
        wx.request({
          url: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
          method: 'POST',
          data: {
            touser: 'your-openid',
            msgtype: 'text',
            text: {
              content: '用户分享了内容'
            }
          },
          success: (res) => {
            resolve(res.data)
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    },

    // 分享追踪
    trackShare(type, success) {
      // 这里可以添加分享统计代码
      console.log(`分享类型: ${type}, 成功: ${success}`)
      
      // 发送到分析服务
      if (wx.reportAnalytics) {
        wx.reportAnalytics('share', {
          share_type: type,
          share_success: success ? 1 : 0,
          share_time: Date.now()
        })
      }
    }
  }
})