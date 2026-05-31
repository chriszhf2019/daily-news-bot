//
//  NetworkClient.swift
//  NewsBrief
//

import Foundation

enum NetworkError: LocalizedError {
    case invalidURL
    case requestFailed(statusCode: Int)
    case decodingFailed(Error)
    case noData
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "无效的 URL"
        case .requestFailed(let code): return "请求失败 (HTTP \(code))"
        case .decodingFailed(let err): return "数据解析失败: \(err.localizedDescription)"
        case .noData: return "服务器无响应"
        case .unauthorized: return "认证失败，请重新登录"
        }
    }
}

final class NetworkClient {
    static let shared = NetworkClient()
    private let session: URLSession
    private var authToken: String?

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = APIConfig.requestTimeout
        config.timeoutIntervalForResource = 60
        session = URLSession(configuration: config)
    }

    func setAuthToken(_ token: String?) {
        authToken = token
    }

    func get<T: Decodable>(_ path: String, queryItems: [URLQueryItem]? = nil) async throws -> T {
        return try await request("GET", path: path, queryItems: queryItems)
    }

    func post<T: Decodable>(_ path: String, body: [String: Any]? = nil) async throws -> T {
        return try await request("POST", path: path, body: body)
    }

    func delete<T: Decodable>(_ path: String) async throws -> T {
        return try await request("DELETE", path: path)
    }

    private func request<T: Decodable>(_ method: String, path: String,
                                        queryItems: [URLQueryItem]? = nil,
                                        body: [String: Any]? = nil) async throws -> T {
        guard var components = URLComponents(string: "\(APIConfig.backendBaseURL)\(path)") else {
            throw NetworkError.invalidURL
        }
        if let items = queryItems, !items.isEmpty {
            components.queryItems = items
        }
        guard let url = components.url else {
            throw NetworkError.invalidURL
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = authToken {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body, let jsonData = try? JSONSerialization.data(withJSONObject: body) {
            urlRequest.httpBody = jsonData
        }

        let (data, response) = try await session.data(for: urlRequest)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.noData
        }
        if httpResponse.statusCode == 401 {
            throw NetworkError.unauthorized
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.requestFailed(statusCode: httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw NetworkError.decodingFailed(error)
        }
    }
}
