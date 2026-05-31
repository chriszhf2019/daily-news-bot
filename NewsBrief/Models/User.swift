//
//  User.swift
//  Point
//
//  Created by haifangzhao on 2025-01-15.
//

import Foundation
import SwiftUI

// MARK: - 用户模型
struct User: Codable, Identifiable {
    let id: String
    var nickname: String
    var avatarURL: String?
    var email: String?
    let joinDate: Date
    var readingTime: TimeInterval // 总阅读时长（秒）
    var readNewsCount: Int // 已读情报数
    var favoriteCount: Int // 收藏条数
    var followedKeywords: Int // 关注关键词数
    
    // MARK: - 计算属性：情报官等级
    var intelligenceOfficerLevel: String {
        calculateLevel(readingTime: readingTime)
    }
    
    // MARK: - 根据阅读时长计算等级
    private func calculateLevel(readingTime: TimeInterval) -> String {
        // 按阅读时长（分钟）计算等级
        let readingMinutes = Int(readingTime / 60)
        
        switch readingMinutes {
        case 0..<30: return "情报员"
        case 30..<120: return "初级情报官"
        case 120..<360: return "中级情报官"
        case 360..<720: return "高级情报官"
        case 720..<1440: return "资深情报官"
        case 1440..<2880: return "情报专家"
        default: return "首席情报官"
        }
    }
    
    // MARK: - 默认头像颜色
    var defaultAvatarColor: Color {
        let hue = Double(hashId % 360) / 360.0
        return Color(hue: hue, saturation: 0.6, brightness: 0.9)
    }
    
    // MARK: - 从ID生成哈希值用于默认头像颜色
    private var hashId: Int {
        var hasher = Hasher()
        hasher.combine(id)
        return abs(hasher.finalize())
    }
    
    // MARK: - 默认头像文字
    var defaultAvatarText: String {
        let firstChar = nickname.prefix(1)
        return String(firstChar.uppercased())
    }
}

// MARK: - 模拟用户数据
extension User {
    static let mockUser = User(
        id: "user_123456",
        nickname: "科技情报员",
        avatarURL: nil,
        email: "user@example.com",
        joinDate: Date().addingTimeInterval(-3600 * 24 * 30), // 30天前
        readingTime: 3600 * 10, // 10小时
        readNewsCount: 250,
        favoriteCount: 35,
        followedKeywords: 12
    )
}
