//
//  NewsService.swift
//  Point
//
//  News data service — tries backend API first, falls back to local JSON / mock data.
//

import Foundation

// MARK: - Protocol

protocol NewsServiceProtocol {
    func fetchNews(withPriorityKeyword priorityKeyword: String?) async throws -> [News]
    func fetchNews() async throws -> [News]
    func fetchNewsByCategory(_ category: String) async throws -> [News]
    func searchNews(_ query: String) async throws -> [News]
    func refreshNews() async throws -> [News]
}

// MARK: - Implementation

final class NewsService: NewsServiceProtocol {
    private let cacheManager = NewsCacheManager()
    private let apiService = NewsAPIService.shared

    // MARK: Fetch (with priority keyword)

    func fetchNews(withPriorityKeyword priorityKeyword: String?) async throws -> [News] {
        var allNews: [News]

        // 1. Try backend API
        if !APIConfig.useMockData {
            do {
                let apiNews = try await apiService.fetchNews()
                if !apiNews.isEmpty {
                    allNews = apiNews.map { News.fromAPIItem($0) }
                    cacheManager.cacheNews(allNews)
                    return sortIfNeeded(allNews, by: priorityKeyword)
                }
            } catch {
                print("⚠️ 后端 API 不可用: \(error.localizedDescription)，使用本地数据")
            }
        }

        // 2. Try cache
        if let cached = cacheManager.getCachedNews() {
            return sortIfNeeded(cached, by: priorityKeyword)
        }

        // 3. Try local JSON
        if let jsonNews = try? loadFromJSON() {
            let valid = DataValidationService.validateNewsData(jsonNews)
            cacheManager.cacheNews(valid)
            return sortIfNeeded(valid, by: priorityKeyword)
        }

        // 4. Fall back to mock data
        let mock = News.generateMockNews()
        return sortIfNeeded(mock, by: priorityKeyword)
    }

    func fetchNews() async throws -> [News] {
        try await fetchNews(withPriorityKeyword: nil)
    }

    // MARK: Category

    func fetchNewsByCategory(_ category: String) async throws -> [News] {
        if category == "全部" {
            return try await fetchNews()
        }

        if !APIConfig.useMockData {
            do {
                let apiNews = try await apiService.fetchNews(category: category)
                if !apiNews.isEmpty {
                    return apiNews.map { News.fromAPIItem($0) }
                }
            } catch {
                print("⚠️ 按分类获取失败: \(error)")
            }
        }

        let all = try await fetchNews()
        return all.filter { $0.category == category }
    }

    // MARK: Search

    func searchNews(_ query: String) async throws -> [News] {
        guard !query.isEmpty else { return try await fetchNews() }

        if !APIConfig.useMockData {
            do {
                let results = try await apiService.searchNews(keyword: query)
                if !results.isEmpty {
                    return results.map { News.fromAPIItem($0) }
                }
            } catch {
                print("⚠️ 搜索失败: \(error)")
            }
        }

        let all = try await fetchNews()
        return all.filter { news in
            news.title.localizedCaseInsensitiveContains(query) ||
            news.content.localizedCaseInsensitiveContains(query) ||
            news.tags.contains { $0.localizedCaseInsensitiveContains(query) }
        }
    }

    // MARK: Refresh

    func refreshNews() async throws -> [News] {
        cacheManager.clearCache()
        return try await fetchNews()
    }

    // MARK: Helpers

    private func sortIfNeeded(_ news: [News], by keyword: String?) -> [News] {
        guard let kw = keyword, !kw.isEmpty else { return news }
        return news.sorted { n1, n2 in
            calculateRelevance(news: n1, keyword: kw) > calculateRelevance(news: n2, keyword: kw)
        }
    }

    private func calculateRelevance(news: News, keyword: String) -> Int {
        var score = 0
        if news.title.localizedCaseInsensitiveContains(keyword) { score += 10 }
        if news.content.localizedCaseInsensitiveContains(keyword) { score += 5 }
        if news.tags.contains(where: { $0.localizedCaseInsensitiveContains(keyword) }) { score += 8 }
        if news.category.localizedCaseInsensitiveContains(keyword) { score += 3 }
        return score
    }

    private func loadFromJSON() throws -> [News] {
        guard let url = Bundle.main.url(forResource: "NewsData", withExtension: "json") else {
            throw NewsServiceError.fileNotFound
        }
        let data = try Data(contentsOf: url)
        let response = try JSONDecoder().decode(NewsResponse.self, from: data)
        return response.news
    }
}

// MARK: - JSON / Cache / Validation (unchanged)

struct NewsResponse: Codable {
    let news: [News]
    let metadata: NewsMetadata
}

struct NewsMetadata: Codable {
    let version: String
    let lastUpdated: String
    let totalNews: Int
    let categories: Int
}

final class NewsCacheManager {
    private let cacheKey = "cached_news_data"
    private let cacheTimestampKey = "cached_news_timestamp"
    private let cacheExpirationTime: TimeInterval = 30 * 60

    func cacheNews(_ news: [News]) {
        if let data = try? JSONEncoder().encode(news) {
            UserDefaults.standard.set(data, forKey: cacheKey)
            UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: cacheTimestampKey)
        }
    }

    func getCachedNews() -> [News]? {
        guard let data = UserDefaults.standard.data(forKey: cacheKey),
              let timestamp = UserDefaults.standard.object(forKey: cacheTimestampKey) as? TimeInterval
        else { return nil }
        if Date().timeIntervalSince1970 - timestamp > cacheExpirationTime {
            clearCache()
            return nil
        }
        return try? JSONDecoder().decode([News].self, from: data)
    }

    func clearCache() {
        UserDefaults.standard.removeObject(forKey: cacheKey)
        UserDefaults.standard.removeObject(forKey: cacheTimestampKey)
    }
}

enum NewsServiceError: LocalizedError {
    case networkError, invalidData, fileNotFound, cacheError, rateLimitExceeded

    var errorDescription: String? {
        switch self {
        case .networkError: return "网络连接错误，请检查网络设置"
        case .invalidData: return "数据格式错误，请稍后重试"
        case .fileNotFound: return "找不到新闻数据文件，请检查应用安装"
        case .cacheError: return "缓存访问错误"
        case .rateLimitExceeded: return "请求过于频繁，请稍后重试"
        }
    }
}

enum DataValidationService {
    static func validateNewsData(_ news: [News]) -> [News] {
        news.filter { item in
            guard !item.id.isEmpty, !item.title.isEmpty, !item.content.isEmpty,
                  !item.category.isEmpty, !item.publishedAt.isEmpty,
                  item.readTime > 0, item.views >= 0, item.shares >= 0
            else { return false }
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy年MM月dd日 HH:mm"
            guard formatter.date(from: item.publishedAt) != nil else { return false }
            if let ai = item.aiAnalysis {
                guard ai.importance >= 0, ai.importance <= 100, ai.predictedViews >= 0
                else { return false }
            }
            return true
        }
    }
}
