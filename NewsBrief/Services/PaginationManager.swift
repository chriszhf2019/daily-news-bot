//
//  PaginationManager.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  分页加载管理器
//

import Foundation
import Combine

// MARK: - 分页加载管理器
class PaginationManager: ObservableObject {
    @Published var currentPage = 1
    @Published var isLoadingMore = false
    @Published var hasMorePages = true
    
    let pageSize: Int
    private var allNews: [News] = []
    
    init(pageSize: Int = 20) {
        self.pageSize = pageSize
    }
    
    // MARK: - 设置所有新闻
    func setAllNews(_ news: [News]) {
        allNews = news
        currentPage = 1
        hasMorePages = news.count > pageSize
    }
    
    // MARK: - 获取当前页新闻
    func getCurrentPageNews() -> [News] {
        let endIndex = min(currentPage * pageSize, allNews.count)
        return Array(allNews.prefix(endIndex))
    }
    
    // MARK: - 加载更多
    func loadMore() {
        guard !isLoadingMore && hasMorePages else { return }
        
        isLoadingMore = true
        
        // 模拟网络延迟
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            guard let self = self else { return }
            
            self.currentPage += 1
            let totalLoaded = self.currentPage * self.pageSize
            self.hasMorePages = totalLoaded < self.allNews.count
            self.isLoadingMore = false
            
            print("📄 加载第 \(self.currentPage) 页，已加载 \(min(totalLoaded, self.allNews.count))/\(self.allNews.count) 条")
        }
    }
    
    // MARK: - 重置
    func reset() {
        currentPage = 1
        isLoadingMore = false
        hasMorePages = true
    }
    
    // MARK: - 是否应该加载更多
    func shouldLoadMore(currentItem: News) -> Bool {
        let currentNews = getCurrentPageNews()
        guard let lastNews = currentNews.last else { return false }
        
        // 当滚动到倒数第5条时触发加载
        let triggerIndex = max(0, currentNews.count - 5)
        if let currentIndex = currentNews.firstIndex(where: { $0.id == currentItem.id }),
           currentIndex >= triggerIndex {
            return true
        }
        
        return false
    }
}

// MARK: - 分页状态
enum PaginationState {
    case idle
    case loading
    case loaded
    case error(String)
    case noMoreData
}
