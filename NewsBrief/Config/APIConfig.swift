//
//  APIConfig.swift
//  NewsBrief
//

import Foundation

struct APIConfig {
    // 后端 API 地址 — 生产环境应替换为实际服务器地址
    static let backendBaseURL: String = {
        if let url = Bundle.main.object(forInfoDictionaryKey: "BACKEND_BASE_URL") as? String {
            return url
        }
        #if DEBUG
        return "http://localhost:5000"
        #else
        return "https://api.example.com"
        #endif
    }()

    // DeepSeek API 配置 — 优先从 Info.plist 读取
    static let deepSeekAPIKey: String = {
        if let key = Bundle.main.object(forInfoDictionaryKey: "DEEPSEEK_API_KEY") as? String,
           !key.isEmpty, key != "your_deepseek_api_key_here" {
            return key
        }
        if let key = ProcessInfo.processInfo.environment["DEEPSEEK_API_KEY"] {
            return key
        }
        return ""
    }()

    static let deepSeekAPIURL = "https://api.deepseek.com/v1/chat/completions"
    static let deepSeekModel = "deepseek-chat"

    // 请求配置
    static let requestTimeout: TimeInterval = 30
    static let maxTokens = 1000
    static let temperature = 0.7

    // 当 API Key 不可用时使用本地 JSON 数据
    static var useMockData: Bool { deepSeekAPIKey.isEmpty }
}
