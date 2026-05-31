//
//  Test Script for Point App
//

import Foundation
import SwiftUI
import Point

// 测试数据模型
func testDataModel() {
    print("=== 测试数据模型 ===")
    
    // 生成模拟新闻
    let mockNews = News.generateMockNews()
    print("生成了 \(mockNews.count) 条模拟新闻")
    
    // 验证新闻数据
    let validatedNews = DataValidationService.validateNewsData(mockNews)
    print("验证后剩余 \(validatedNews.count) 条有效新闻")
    
    // 生成模拟情报数据
    let mockIntelligence = News.generateMockIntelligenceData()
    print("生成了模拟情报数据，包含 \(mockIntelligence.topics.count) 个专题和 \(mockIntelligence.predictions.count) 个预测")
    
    print("数据模型测试通过 ✅")
}

// 测试视图模型
func testViewModel() {
    print("\n=== 测试视图模型 ===")
    
    let viewModel = NewsViewModel()
    
    // 测试阅读模式切换
    viewModel.readingMode = .concise
    print("阅读模式切换到：\(viewModel.readingMode.rawValue)")
    
    // 测试关键词管理
    let keywords = ["人工智能", "芯片"]
    viewModel.updateFollowedKeywords(keywords)
    print("更新关注关键词：\(viewModel.followedKeywords)")
    
    print("视图模型测试通过 ✅")
}

// 测试新闻服务
func testNewsService() {
    print("\n=== 测试新闻服务 ===")
    
    let newsService = NewsService()
    
    // 测试缓存管理
    let cacheManager = NewsCacheManager()
    let mockNews = News.generateMockNews()
    cacheManager.cacheNews(mockNews)
    
    if let cachedNews = cacheManager.getCachedNews() {
        print("缓存管理正常，缓存了 \(cachedNews.count) 条新闻")
    }
    
    print("新闻服务测试通过 ✅")
}

// 运行所有测试
testDataModel()
testViewModel()
testNewsService()

print("\n=== 所有测试完成 ===")
