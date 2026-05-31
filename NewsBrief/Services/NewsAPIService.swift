//
//  NewsAPIService.swift
//  NewsBrief
//
//  Backend API 新闻数据服务
//

import Foundation

// MARK: - API 响应模型

struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let message: String?
    let data: T?
}

struct NewsListData: Decodable {
    let news: [APINewsItem]
    let pagination: PaginationData?
}

struct PaginationData: Decodable {
    let page: Int
    let perPage: Int
    let total: Int
    let totalPages: Int?
}

struct APINewsItem: Decodable {
    let id: Int
    let title: String
    let summary: String?
    let category: String?
    let source: String?
    let sourceUrl: String?
    let imageUrl: String?
    let tags: [String]?
    let publishedAt: String?
}

struct NewsSearchData: Decodable {
    let keyword: String
    let results: [APINewsItem]
    let total: Int
}

// MARK: - 新闻 API 服务

final class NewsAPIService {
    static let shared = NewsAPIService()
    private let client = NetworkClient.shared

    private init() {}

    func setToken(_ token: String?) {
        client.setAuthToken(token)
    }

    func fetchNews(page: Int = 1, perPage: Int = 20, category: String? = nil) async throws -> [APINewsItem] {
        var queryItems = [
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "per_page", value: String(perPage)),
        ]
        if let category = category, category != "全部" {
            queryItems.append(URLQueryItem(name: "category", value: category))
        }
        let response: APIResponse<NewsListData> = try await client.get("/api/v1/news", queryItems: queryItems)
        return response.data?.news ?? []
    }

    func searchNews(keyword: String, page: Int = 1) async throws -> [APINewsItem] {
        let queryItems = [
            URLQueryItem(name: "keyword", value: keyword),
            URLQueryItem(name: "page", value: String(page)),
        ]
        let response: APIResponse<NewsSearchData> = try await client.get("/api/v1/news/search", queryItems: queryItems)
        return response.data?.results ?? []
    }
}
