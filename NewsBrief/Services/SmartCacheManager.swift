//
//  SmartCacheManager.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  智能缓存管理器
//

import Foundation

// MARK: - 智能缓存管理器
class SmartCacheManager {
    static let shared = SmartCacheManager()
    
    private let newsCache = "cached_news_data"
    private let timestampCache = "cached_news_timestamp"
    private let userActivityKey = "user_activity_level"
    
    // 用户活跃度级别
    enum ActivityLevel: Int {
        case low = 0      // 低活跃：缓存60分钟
        case medium = 1   // 中活跃：缓存30分钟
        case high = 2     // 高活跃：缓存15分钟
        
        var cacheExpiration: TimeInterval {
            switch self {
            case .low: return 60 * 60      // 60分钟
            case .medium: return 30 * 60   // 30分钟
            case .high: return 15 * 60     // 15分钟
            }
        }
    }
    
    private init() {}
    
    // MARK: - 缓存新闻
    func cacheNews(_ news: [News]) {
        if let data = try? JSONEncoder().encode(news) {
            UserDefaults.standard.set(data, forKey: newsCache)
            UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: timestampCache)
            
            print("✅ 缓存新闻: \(news.count) 条")
        }
    }
    
    // MARK: - 获取缓存的新闻
    func getCachedNews() -> [News]? {
        guard let data = UserDefaults.standard.data(forKey: newsCache),
              let timestamp = UserDefaults.standard.object(forKey: timestampCache) as? TimeInterval
        else {
            print("❌ 缓存为空")
            return nil
        }
        
        let currentTime = Date().timeIntervalSince1970
        let timeElapsed = currentTime - timestamp
        let activityLevel = getUserActivityLevel()
        let expirationTime = activityLevel.cacheExpiration
        
        // 检查缓存是否过期
        if timeElapsed > expirationTime {
            print("⏰ 缓存已过期 (经过 \(Int(timeElapsed/60)) 分钟)")
            clearCache()
            return nil
        }
        
        guard let news = try? JSONDecoder().decode([News].self, from: data) else {
            print("❌ 缓存解码失败")
            return nil
        }
        
        print("✅ 从缓存加载: \(news.count) 条 (剩余 \(Int((expirationTime - timeElapsed)/60)) 分钟)")
        return news
    }
    
    // MARK: - 清除缓存
    func clearCache() {
        UserDefaults.standard.removeObject(forKey: newsCache)
        UserDefaults.standard.removeObject(forKey: timestampCache)
        print("🗑️ 缓存已清除")
    }
    
    // MARK: - 获取用户活跃度
    private func getUserActivityLevel() -> ActivityLevel {
        let level = UserDefaults.standard.integer(forKey: userActivityKey)
        return ActivityLevel(rawValue: level) ?? .medium
    }
    
    // MARK: - 更新用户活跃度
    func updateUserActivity() {
        let lastActivityTime = UserDefaults.standard.double(forKey: "last_activity_time")
        let currentTime = Date().timeIntervalSince1970
        
        // 如果距离上次活动不到5分钟，认为是高活跃
        if currentTime - lastActivityTime < 5 * 60 {
            UserDefaults.standard.set(ActivityLevel.high.rawValue, forKey: userActivityKey)
            print("📈 用户活跃度: 高")
        } else if currentTime - lastActivityTime < 30 * 60 {
            UserDefaults.standard.set(ActivityLevel.medium.rawValue, forKey: userActivityKey)
            print("📊 用户活跃度: 中")
        } else {
            UserDefaults.standard.set(ActivityLevel.low.rawValue, forKey: userActivityKey)
            print("📉 用户活跃度: 低")
        }
        
        UserDefaults.standard.set(currentTime, forKey: "last_activity_time")
    }
    
    // MARK: - 增量更新缓存
    func updateCacheIncremental(newNews: [News]) {
        guard var cachedNews = getCachedNews() else {
            // 如果没有缓存，直接缓存新数据
            cacheNews(newNews)
            return
        }
        
        // 合并新旧数据（去重）
        let newNewsIDs = Set(newNews.map { $0.id })
        cachedNews.removeAll { newNewsIDs.contains($0.id) }
        
        // 新闻放在前面
        let mergedNews = newNews + cachedNews
        
        // 限制缓存大小（最多500条）
        let limitedNews = Array(mergedNews.prefix(500))
        
        cacheNews(limitedNews)
        print("🔄 增量更新缓存: 新增 \(newNews.count) 条，总计 \(limitedNews.count) 条")
    }
    
    // MARK: - 获取缓存统计
    func getCacheStats() -> CacheStats {
        let hasCache = UserDefaults.standard.data(forKey: newsCache) != nil
        let timestamp = UserDefaults.standard.double(forKey: timestampCache)
        let activityLevel = getUserActivityLevel()
        
        var cacheAge: TimeInterval = 0
        var remainingTime: TimeInterval = 0
        
        if hasCache && timestamp > 0 {
            let currentTime = Date().timeIntervalSince1970
            cacheAge = currentTime - timestamp
            remainingTime = max(0, activityLevel.cacheExpiration - cacheAge)
        }
        
        return CacheStats(
            hasCache: hasCache,
            cacheAge: cacheAge,
            remainingTime: remainingTime,
            activityLevel: activityLevel
        )
    }
}

// MARK: - 缓存统计
struct CacheStats {
    let hasCache: Bool
    let cacheAge: TimeInterval
    let remainingTime: TimeInterval
    let activityLevel: SmartCacheManager.ActivityLevel
    
    var cacheAgeMinutes: Int {
        Int(cacheAge / 60)
    }
    
    var remainingMinutes: Int {
        Int(remainingTime / 60)
    }
    
    var description: String {
        if !hasCache {
            return "无缓存"
        }
        return "缓存年龄: \(cacheAgeMinutes)分钟，剩余: \(remainingMinutes)分钟，活跃度: \(activityLevel)"
    }
}
