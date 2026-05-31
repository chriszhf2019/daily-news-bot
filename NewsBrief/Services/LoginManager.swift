//
//  LoginManager.swift
//  Point
//
//  Created by haifangzhao on 2025-01-15.
//

import Foundation
import Combine

// MARK: - 登录管理器
class LoginManager: ObservableObject {
    @Published var isLoggedIn: Bool = false
    @Published var currentUser: User?
    
    private let userKey = "currentUser"
    
    // MARK: - 初始化
    init() {
        // 延迟加载用户数据，避免阻塞启动
        DispatchQueue.global(qos: .utility).async { [weak self] in
            self?.loadUser()
        }
    }
    
    // MARK: - 登录
    func login(email: String, password: String) async -> Bool {
        // 模拟登录请求
        try? await Task.sleep(nanoseconds: 1_000_000_000) // 模拟网络延迟
        
        // 模拟登录成功，创建用户
        let user = User(
            id: UUID().uuidString,
            nickname: "科技情报员",
            avatarURL: nil,
            email: email,
            joinDate: Date().addingTimeInterval(-3600 * 24 * 30), // 30天前
            readingTime: 3600 * 10, // 10小时
            readNewsCount: 250,
            favoriteCount: 35,
            followedKeywords: 12
        )
        
        // 保存用户信息
        await MainActor.run {
            self.currentUser = user
            self.isLoggedIn = true
            self.saveUser(user)
        }
        
        return true
    }
    
    // MARK: - 登出
    func logout() {
        currentUser = nil
        isLoggedIn = false
        UserDefaults.standard.removeObject(forKey: userKey)
    }
    
    // MARK: - 模拟登录（用于演示）
    func mockLogin() {
        let user = User(
            id: UUID().uuidString,
            nickname: "科技情报员",
            avatarURL: nil,
            email: "demo@newsbrief.com",
            joinDate: Date().addingTimeInterval(-3600 * 24 * 30), // 30天前
            readingTime: 3600 * 10, // 10小时
            readNewsCount: 250,
            favoriteCount: 35,
            followedKeywords: 12
        )
        
        currentUser = user
        isLoggedIn = true
        saveUser(user)
    }
    
    // MARK: - 保存用户信息
    private func saveUser(_ user: User) {
        if let data = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(data, forKey: userKey)
        }
    }
    
    // MARK: - 加载用户信息
    private func loadUser() {
        if let data = UserDefaults.standard.data(forKey: userKey),
           let user = try? JSONDecoder().decode(User.self, from: data) {
            DispatchQueue.main.async { [weak self] in
                self?.currentUser = user
                self?.isLoggedIn = true
            }
        }
    }
    
    // MARK: - 更新用户阅读时长
    func updateReadingTime(seconds: TimeInterval) {
        guard let user = currentUser else { return }
        
        var updatedUser = user
        updatedUser.readingTime += seconds
        updatedUser.readNewsCount += 1
        
        currentUser = updatedUser
        saveUser(updatedUser)
    }
    
    // MARK: - 更新收藏数
    func updateFavoriteCount(by delta: Int) {
        guard let user = currentUser else { return }
        
        var updatedUser = user
        updatedUser.favoriteCount += delta
        updatedUser.favoriteCount = max(0, updatedUser.favoriteCount) // 确保不小于0
        
        currentUser = updatedUser
        saveUser(updatedUser)
    }
    
    // MARK: - 更新关注关键词数
    func updateFollowedKeywords(by delta: Int) {
        guard let user = currentUser else { return }
        
        var updatedUser = user
        updatedUser.followedKeywords += delta
        updatedUser.followedKeywords = max(0, updatedUser.followedKeywords) // 确保不小于0
        
        currentUser = updatedUser
        saveUser(updatedUser)
    }
    
    // MARK: - 注销账号
    func deleteAccount() {
        // 清除用户信息
        logout()
        
        // 清除所有本地数据
        let domain = Bundle.main.bundleIdentifier!
        UserDefaults.standard.removePersistentDomain(forName: domain)
        UserDefaults.standard.synchronize()
        
        print("账号已注销，所有本地数据已清除")
    }
}
