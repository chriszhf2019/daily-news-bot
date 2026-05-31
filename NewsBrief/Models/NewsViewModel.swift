//
//  NewsViewModel.swift
//  Point
//
//  Created by haifangzhao on 2025-01-01.
//

import Foundation
import SwiftUI
import Combine
import UIKit

// MARK: - 阅读模式
enum ReadingMode: String, CaseIterable, Identifiable {
    case standard = "📚 深度看"
    case simple = "🧐 讲白话"
    case concise = "💧 捞干货"
    
    var id: String { rawValue }
}

// MARK: - 新闻视图模型
@MainActor
class NewsViewModel: ObservableObject {
    @Published var news: [News] = []
    @Published var filteredNews: [News] = []
    @Published var intelligenceData: News.IntelligenceData?
    @Published var categories: [NewsCategory] = []
    @Published var selectedCategory: NewsCategory = .all
    @Published var searchText: String = ""
    @Published var selectedFilter: FilterOption = .all
    @Published var readingMode: ReadingMode = .standard
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var lastUpdated: Date?
    @Published var followedKeywords: [String] = []
    @Published var tomorrowFocus: String? = nil // 明天关注的关键词
    @Published var brainAssetValue: Int = 0 // 脑力资产值
    @Published var masteredCards: Int = 0 // 已掌握的卡片数
    @Published var completedCardsToday: Int = 0
    @Published var dataSource: String = "" // 数据来源标识（API / 缓存 / 本地）

    private let newsService = NewsService()
    private let apiService = NewsAPIService.shared
    let newsServicePublic: NewsService
    private let networkMonitor = NetworkMonitor()
    private var cancellables = Set<AnyCancellable>()
    private var hasLoadedInitialData = false
    
    // MARK: - 初始化
    init() {
        self.newsServicePublic = newsService
        loadCategories()
        
        // 同步加载关键配置（快速）
        loadTomorrowFocusSync()
        loadFollowedKeywordsSync()
        
        // 延迟设置绑定，避免阻塞初始化
        DispatchQueue.main.async { [weak self] in
            self?.setupBindings()
        }
    }
    
    // MARK: - 快速初始化加载（首页显示前完成）
    func loadInitialDataIfNeeded() async {
        guard !hasLoadedInitialData else { return }
        hasLoadedInitialData = true
        
        // 优先加载新闻数据
        await fetchNews()
        
        // 后台加载其他数据
        Task.detached(priority: .utility) { [weak self] in
            await self?.loadBrainAssetValue()
        }
        
        // 情报数据延迟加载
        Task.detached(priority: .background) { [weak self] in
            try? await Task.sleep(nanoseconds: 2_000_000_000) // 2秒后加载
            await self?.fetchIntelligenceDataAsync()
        }
    }
    
    // MARK: - 设置数据绑定
    private func setupBindings() {
        // 监听网络状态
        networkMonitor.$isConnected
            .receive(on: RunLoop.main)
            .sink { [weak self] isConnected in
                guard let self = self else { return }
                Task { @MainActor in
                    if !isConnected {
                        self.errorMessage = "网络连接不可用"
                    } else if self.errorMessage == "网络连接不可用" {
                        self.errorMessage = nil
                    }
                }
            }
            .store(in: &cancellables)
        
        // 监听搜索文本变化
        $searchText
            .receive(on: RunLoop.main)
            .sink { [weak self] _ in
                self?.applyFilters()
            }
            .store(in: &cancellables)
        
        // 监听分类选择变化
        $selectedCategory
            .receive(on: RunLoop.main)
            .sink { [weak self] _ in
                self?.applyFilters()
            }
            .store(in: &cancellables)
        
        // 监听筛选选项变化
        $selectedFilter
            .receive(on: RunLoop.main)
            .sink { [weak self] _ in
                self?.applyFilters()
            }
            .store(in: &cancellables)
        
        // 监听新闻数据变化
        $news
            .receive(on: RunLoop.main)
            .sink { [weak self] news in
                self?.updateCategoryCounts()
                self?.applyFilters()
            }
            .store(in: &cancellables)
    }
    
    // MARK: - 加载分类数据
    private func loadCategories() {
        categories = [
            NewsCategory.all,
            NewsCategory.ai,
            NewsCategory.tech,
            NewsCategory.vr,
            NewsCategory.auto,
            NewsCategory.quantum
        ]
    }
    
    // MARK: - 加载缓存的新闻
    private func loadCachedNews() {
        Task {
            do {
                let cachedNews = try await newsService.fetchNews()
                await MainActor.run {
                    self.news = cachedNews
                    self.lastUpdated = Date()
                }
            } catch {
                print("加载缓存新闻失败: \(error)")
            }
        }
    }
    
    // MARK: - 加载明天关注的关键词（同步版本）
    private func loadTomorrowFocusSync() {
        tomorrowFocus = UserDefaults.standard.string(forKey: "tomorrow_focus")
    }
    
    // MARK: - 加载关注的关键词（同步版本）
    private func loadFollowedKeywordsSync() {
        followedKeywords = UserDefaults.standard.stringArray(forKey: "followedKeywords") ?? ["人工智能", "芯片", "科技", "美联储"]
    }
    
    // MARK: - 加载明天关注的关键词
    private func loadTomorrowFocus() {
        if let savedFocus = UserDefaults.standard.string(forKey: "tomorrow_focus") {
            DispatchQueue.main.async { [weak self] in
                self?.tomorrowFocus = savedFocus
            }
        }
    }
    
    // MARK: - 加载脑力资产值
    private func loadBrainAssetValue() {
        let brainValue = UserDefaults.standard.integer(forKey: "brainAssetValue")
        let masteredValue = UserDefaults.standard.integer(forKey: "masteredCards")
        
        // 检查是否是新的一天，如果是则重置今日完成数
        let lastDate = UserDefaults.standard.object(forKey: "lastCompletionDate") as? Date
        let calendar = Calendar.current
        let today = Date()
        
        var completedValue = 0
        if let lastDate = lastDate {
            if calendar.isDate(lastDate, inSameDayAs: today) {
                completedValue = UserDefaults.standard.integer(forKey: "completedCardsToday")
            } else {
                UserDefaults.standard.set(0, forKey: "completedCardsToday")
            }
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.brainAssetValue = brainValue
            self?.masteredCards = masteredValue
            self?.completedCardsToday = completedValue
        }
    }
    
    // MARK: - 获取新闻
    func fetchNews() async {
        isLoading = true
        errorMessage = nil

        do {
            let fetchedNews = try await newsService.fetchNews(withPriorityKeyword: tomorrowFocus)
            news = fetchedNews
            dataSource = APIConfig.useMockData ? "本地数据" : "后端 API"
            lastUpdated = Date()
            isLoading = false
        } catch NewsServiceError.fileNotFound {
            let mockNews = News.generateMockNews()
            news = mockNews
            dataSource = "模拟数据"
            lastUpdated = Date()
            isLoading = false
            errorMessage = nil
        } catch let error as NewsServiceError {
            errorMessage = error.localizedDescription
            isLoading = false
        } catch {
            let mockNews = News.generateMockNews()
            news = mockNews
            dataSource = "模拟数据（离线）"
            lastUpdated = Date()
            isLoading = false
            errorMessage = "使用本地数据，请检查网络连接"
        }
    }
    
    // MARK: - 按分类获取新闻
    func fetchNewsByCategory(_ category: NewsCategory) async {
        guard category != selectedCategory else { return }
        
        isLoading = true
        errorMessage = nil
        selectedCategory = category
        
        do {
            let categoryNews = try await newsService.fetchNewsByCategory(category.name)
            news = categoryNews
            lastUpdated = Date()
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
    
    // MARK: - 搜索新闻
    func searchNews(_ query: String) async {
        searchText = query
        isLoading = true
        errorMessage = nil

        do {
            // 优先使用后端 API 搜索
            if !APIConfig.useMockData {
                let apiResults = try await apiService.searchNews(keyword: query)
                if !apiResults.isEmpty {
                    news = apiResults.map { News.fromAPIItem($0) }
                    dataSource = "后端 API"
                    lastUpdated = Date()
                    isLoading = false
                    return
                }
            }
            // 降级到本地搜索
            let searchResults = try await newsService.searchNews(query)
            news = searchResults
            dataSource = "本地数据"
            lastUpdated = Date()
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
    
    // MARK: - 刷新新闻
    func refreshNews() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let refreshedNews = try await newsService.refreshNews()
            news = refreshedNews
            lastUpdated = Date()
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
    
    // MARK: - 加载情报数据
    private func loadIntelligenceData() {
        // 这里可以先加载缓存数据
        // 然后异步获取最新数据
        fetchIntelligenceData()
    }
    
    // MARK: - 获取情报数据（异步版本，无延迟）
    private func fetchIntelligenceDataAsync() async {
        let mockData = News.generateMockIntelligenceData()
        await MainActor.run {
            self.intelligenceData = mockData
        }
    }
    
    // MARK: - 获取情报数据
    func fetchIntelligenceData() {
        // 直接生成数据，移除模拟延迟
        let mockData = News.generateMockIntelligenceData()
        self.intelligenceData = mockData
        self.isLoading = false
    }
    
    // MARK: - 加载关注的关键词
    private func loadFollowedKeywords() {
        // 从UserDefaults加载关键词
        let keywords = UserDefaults.standard.stringArray(forKey: "followedKeywords") ?? ["人工智能", "芯片", "科技", "美联储"]
        DispatchQueue.main.async { [weak self] in
            self?.followedKeywords = keywords
        }
    }
    
    // MARK: - 加载缓存的新闻（已废弃，使用loadInitialDataIfNeeded）
    private func loadCachedNews() {
        // 保留空实现以兼容
    }
    
    // MARK: - 更新关注的关键词
    func updateFollowedKeywords(_ keywords: [String]) {
        self.followedKeywords = keywords
        UserDefaults.standard.set(keywords, forKey: "followedKeywords")
        
        // 重新筛选新闻
        applyFilters()
    }
    
    // MARK: - 应用阅读模式
    func applyReadingMode(to news: News) -> String {
        switch readingMode {
        case .standard:
            // 标准模式：全量7要素，适合深度研究
            let content = "\(news.content)\n\n" +
                         "📌 标签：\(news.tags.joined(separator: ", "))\n" +
                         "📊 阅读量：\(news.views) | 分享量：\(news.shares)\n" +
                         "⏱️ 发布时间：\(news.publishedAt) | 阅读时长：\(news.readTime)分钟"
            return content
        case .simple:
            // 小白模式：通俗摘要 + 知识百科，降低阅读门槛
            return news.summary + "\n\n💡 提示：这是简化版内容，适合快速了解核心信息"
        case .concise:
            // 脱水模式：极速快讯流，15字总结，适合高频扫描
            return news.aiAnalysis?.summary ?? news.summary.split(separator: ".").first.map { String($0) + "." } ?? news.title
        }
    }
    
    // MARK: - 应用筛选
    private func applyFilters() {
        var filtered = news
        
        // 按搜索文本筛选
        if !searchText.isEmpty {
            filtered = filtered.filter { news in
                news.title.localizedCaseInsensitiveContains(searchText) ||
                news.content.localizedCaseInsensitiveContains(searchText) ||
                news.tags.contains(where: { $0.localizedCaseInsensitiveContains(searchText) })
            }
        }
        
        // 按用户关注的关键词筛选（首页核心功能）
        if !followedKeywords.isEmpty {
            filtered = filtered.filter { news in
                // 检查新闻是否包含用户关注的关键词
                for keyword in followedKeywords {
                    if news.title.localizedCaseInsensitiveContains(keyword) ||
                       news.content.localizedCaseInsensitiveContains(keyword) ||
                       news.tags.contains(where: { $0.localizedCaseInsensitiveContains(keyword) }) ||
                       news.category.localizedCaseInsensitiveContains(keyword) {
                        return true
                    }
                }
                return false
            }
        }
        
        // 按分类筛选
        if selectedCategory != .all {
            filtered = filtered.filter { $0.category == selectedCategory.name }
        }
        
        // 按时间筛选
        switch selectedFilter {
        case .today:
            filtered = filterByTimeInterval(filtered, timeInterval: 24 * 60 * 60) // 24小时
        case .week:
            filtered = filterByTimeInterval(filtered, timeInterval: 7 * 24 * 60 * 60) // 7天
        case .month:
            filtered = filterByTimeInterval(filtered, timeInterval: 30 * 24 * 60 * 60) // 30天
        case .breaking:
            filtered = filtered.filter { $0.isBreaking }
        case .favorites:
            // 这里需要结合收藏管理器
            break
        case .all:
            break
        }
        
        // 按相关性排序（突发新闻优先，然后按重要性，最后按发布时间）
        filtered.sort { news1, news2 in
            if news1.isBreaking != news2.isBreaking {
                return news1.isBreaking
            }
            
            let importance1 = news1.aiAnalysis?.importance ?? 0
            let importance2 = news2.aiAnalysis?.importance ?? 0
            
            if importance1 != importance2 {
                return importance1 > importance2
            }
            
            return news1.views > news2.views
        }
        
        self.filteredNews = filtered
    }
    
    // MARK: - 按时间间隔筛选
    private func filterByTimeInterval(_ newsArray: [News], timeInterval: TimeInterval) -> [News] {
        let cutoffDate = Date().addingTimeInterval(-timeInterval)
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy年MM月dd日 HH:mm"
        
        return newsArray.filter { newsItem in
            guard let newsDate = dateFormatter.date(from: newsItem.publishedAt) else {
                return false
            }
            return newsDate >= cutoffDate
        }
    }
    
    // MARK: - 更新分类计数
    private func updateCategoryCounts() {
        categories = categories.map { category in
            var updatedCategory = category
            if category == .all {
                updatedCategory.count = news.count
            } else {
                updatedCategory.count = news.filter { $0.category == category.name }.count
            }
            return updatedCategory
        }
    }
    
    // MARK: - 获取新闻统计信息
    func getNewsStats() -> NewsStats {
        let totalNews = news.count
        let breakingNews = news.filter { $0.isBreaking }.count
        let averageViews = news.isEmpty ? 0 : news.map { $0.views }.reduce(0, +) / news.count
        let totalShares = news.map { $0.shares }.reduce(0, +)
        
        return NewsStats(
            totalNews: totalNews,
            breakingNews: breakingNews,
            averageViews: averageViews,
            totalShares: totalShares,
            lastUpdated: lastUpdated
        )
    }
    
    // MARK: - 清除错误
    func clearError() {
        errorMessage = nil
    }
    
    // MARK: - 根据专题获取相关新闻
    func getNewsForTopic(_ topic: News.Topic) -> [News] {
        // 从新闻列表中筛选与专题相关的新闻
        // 匹配条件：新闻标题或内容包含专题关键词，或者新闻分类与专题分类相同
        return news.filter { news in
            // 检查新闻分类
            if news.category == topic.category {
                return true
            }
            
            // 检查新闻标题是否包含专题关键词
            for keyword in topic.keywords {
                if news.title.localizedCaseInsensitiveContains(keyword) ||
                   news.content.localizedCaseInsensitiveContains(keyword) ||
                   news.tags.contains(where: { $0.localizedCaseInsensitiveContains(keyword) }) {
                    return true
                }
            }
            
            // 检查新闻是否是专题的子新闻
            if topic.subNews.contains(where: { $0.newsId == news.id }) {
                return true
            }
            
            return false
        }
    }
}

// MARK: - 新闻统计信息
struct NewsStats {
    let totalNews: Int
    let breakingNews: Int
    let averageViews: Int
    let totalShares: Int
    let lastUpdated: Date?
    
    var formattedLastUpdated: String {
        guard let lastUpdated = lastUpdated else {
            return "未知"
        }
        
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: lastUpdated, relativeTo: Date())
    }
}

// MARK: - 分享图片视图
struct ShareImageView: View {
    let news: News
    
    // 点透蓝
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        VStack(spacing: 20) {
            // 顶部品牌标识
            HStack(spacing: 8) {
                // 品牌Logo
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [pointBlue, Color.purple]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 36, height: 36)
                    
                    Image(systemName: "arrow.up")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                }
                
                Text("点透")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(pointBlue)
            }
            
            // 新闻卡片
            VStack(alignment: .leading, spacing: 16) {
                // 新闻标题
                Text(news.title)
                    .font(.title2)
                    .fontWeight(.bold)
                    .lineLimit(3)
                    .multilineTextAlignment(.center)
                
                // 新闻摘要
                Text(news.summary)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .lineLimit(4)
                    .multilineTextAlignment(.center)
                
                // 新闻信息
                HStack(spacing: 12) {
                    Spacer()
                    
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                        Text(news.publishedAt)
                    }
                    .font(.caption)
                    .foregroundColor(.secondary)
                    
                    HStack(spacing: 4) {
                        Image(systemName: "newspaper")
                        Text(news.source)
                    }
                    .font(.caption)
                    .foregroundColor(.secondary)
                    
                    Spacer()
                }
            }
            .padding(20)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color.white, pointBlue.opacity(0.1)]),
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
            
            // 二维码区域
            VStack(spacing: 12) {
                Text("扫码下载点透 App")
                    .font(.headline)
                    .fontWeight(.bold)
                
                // 二维码占位符
                Rectangle()
                    .fill(Color.white)
                    .frame(width: 120, height: 120)
                    .overlay(
                        VStack(spacing: 4) {
                            ForEach(0..<12, id: \.self) { _ in
                                HStack(spacing: 4) {
                                    ForEach(0..<12, id: \.self) { index in
                                        Rectangle()
                                            .fill(index % 2 == 0 ? Color.black : Color.white)
                                            .frame(width: 8, height: 8)
                                    }
                                }
                            }
                        }
                    )
                    .cornerRadius(8)
                    .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
            }
            
            Spacer()
            
            // 品牌水印
            VStack(spacing: 8) {
                // 分隔线
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 1)
                    .padding(.horizontal, 40)
                
                // 品牌信息
                HStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .fill(pointBlue)
                            .frame(width: 20, height: 20)
                        
                        Image(systemName: "arrow.up")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                    }
                    
                    Text("点透 App")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                    
                    Text("·")
                        .foregroundColor(.secondary)
                    
                    Text("看懂世界的逻辑")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text("来自『点透』：帮你点透世界逻辑的新闻智库")
                    .font(.caption2)
                    .foregroundColor(.secondary.opacity(0.8))
            }
            .padding(.bottom, 16)
        }
        .padding(30)
        .background(Color.white)
        .frame(width: 400, height: 680)
    }
}

// MARK: - 导出功能
extension NewsViewModel {
    func exportNewsAsJSON() -> Data? {
        do {
            let jsonData = try JSONEncoder().encode(news)
            return jsonData
        } catch {
            print("导出JSON失败: \(error)")
            return nil
        }
    }
    
    @MainActor
    func shareNews(_ news: News, fromViewController viewController: UIViewController) {
        // 生成分享图片
        let shareView = ShareImageView(news: news)
        let renderer = ImageRenderer(content: shareView)
        renderer.scale = 2.0
        
        if let shareImage = renderer.uiImage {
            // 创建分享视图控制器
            let activityVC = UIActivityViewController(
                activityItems: [shareImage],
                applicationActivities: nil
            )
            
            // 显示分享控制器
            viewController.present(activityVC, animated: true)
        } else {
            print("无法生成分享图片")
        }
    }
    
    // 保存图片到相册
    func saveImageToAlbum(_ image: UIImage, completion: @escaping (Bool, Error?) -> Void) {
        UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
        completion(true, nil)
    }
}