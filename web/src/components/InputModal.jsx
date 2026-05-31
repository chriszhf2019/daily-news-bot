import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function InputModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { newsData, setNewsData } = useStore()
  const [inputUrl, setInputUrl] = useState('')
  const [inputContent, setInputContent] = useState('')
  const [isParsingUrl, setIsParsingUrl] = useState(false)
  
  if (!isOpen) return null
  
  // 识别平台
  const detectPlatform = (url) => {
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes('douyin.com') || lowerUrl.includes('v.douyin.com')) {
      return { platform: '抖音', isVideo: true, icon: '🎵' }
    }
    if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('b23.tv')) {
      return { platform: 'B站', isVideo: true, icon: '📺' }
    }
    if (lowerUrl.includes('mp.weixin.qq.com')) {
      return { platform: '微信公众号', isVideo: false, icon: '📱' }
    }
    if (lowerUrl.includes('xiaohongshu.com') || lowerUrl.includes('xhslink.com')) {
      return { platform: '小红书', isVideo: true, icon: '📕' }
    }
    return { platform: '网页', isVideo: false, icon: '🌐' }
  }
  
  // 解析链接
  const handleParseUrl = async () => {
    if (!inputUrl.trim()) return
    
    const platformInfo = detectPlatform(inputUrl)
    setIsParsingUrl(true)
    
    if (platformInfo.isVideo) {
      setIsParsingUrl(false)
      alert(`${platformInfo.icon} ${platformInfo.platform}视频\n\n请手动复制视频文案/字幕后粘贴到下方输入框`)
      return
    }
    
    // 模拟解析（实际需要调用 API）
    setTimeout(() => {
      setIsParsingUrl(false)
      alert('请手动复制文章内容后粘贴到输入框')
    }, 1000)
  }
  
  // 开始分析
  const handleStartAnalysis = () => {
    if (!inputContent.trim()) {
      alert('请输入内容')
      return
    }
    
    // 创建临时新闻
    const tempNews = {
      id: `custom-${Date.now()}`,
      title: inputContent.split('\n')[0].substring(0, 50) || '自定义情报',
      summary: inputContent.substring(0, 200),
      content: inputContent,
      category: 'AI',
      source: inputUrl ? '链接解析' : '手动录入',
      published_at: new Date().toISOString(),
      tags: ['自定义', '情报分析'],
      isCustom: true
    }
    
    // 添加到新闻列表
    setNewsData([tempNews, ...newsData])
    
    // 关闭弹窗并跳转
    onClose()
    setInputUrl('')
    setInputContent('')
    navigate(`/seven-elements/${tempNews.id}`)
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl border border-purple-500/30 overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 bg-purple-500/10 border-b border-purple-500/20">
          <h3 className="text-lg font-semibold text-purple-400">📝 录入情报</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-5 space-y-5">
          {/* 链接输入 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              🔗 粘贴链接
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="微信公众号/抖音/B站/网页链接"
                className="flex-1 px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleParseUrl}
                disabled={!inputUrl || isParsingUrl}
                className="px-4 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isParsingUrl ? '解析中...' : '解析'}
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              {['📱 微信', '🎵 抖音', '📺 B站', '🌐 网页'].map(tag => (
                <span key={tag} className="text-xs text-slate-500 bg-slate-700/30 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* 分隔线 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-xs text-slate-500">或</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>
          
          {/* 内容输入 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              📋 直接粘贴内容
            </label>
            <p className="text-xs text-slate-500 mb-2">视频可粘贴字幕/口播文稿</p>
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="粘贴新闻内容、视频字幕、口播文稿..."
              rows={6}
              maxLength={10000}
              className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-purple-500"
            />
            <p className="text-xs text-slate-500 text-right mt-1">
              {inputContent.length}/10000
            </p>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="flex gap-3 px-5 py-4 bg-slate-900/50 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-700/50 text-slate-300 rounded-lg font-medium hover:bg-slate-600/50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleStartAnalysis}
            disabled={!inputContent && !inputUrl}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            开始情报建模
          </button>
        </div>
      </div>
    </div>
  )
}
