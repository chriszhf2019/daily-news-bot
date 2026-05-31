//
//  PersonalCenterView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-15.
//

import SwiftUI

// MARK: - 个人中心视图
struct PersonalCenterView: View {
    @EnvironmentObject private var loginManager: LoginManager
    @EnvironmentObject private var favoritesManager: FavoritesManager
    
    @State private var isLoginViewPresented = false
    @State private var isDeleteAccountConfirming = false
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    @AppStorage("darkModeEnabled") private var darkModeEnabled = false
    @AppStorage("autoRefreshEnabled") private var autoRefreshEnabled = true
    @AppStorage("newsUpdateInterval") private var newsUpdateInterval = 30
    @AppStorage("fontSize") private var fontSize = 16.0
    
    var body: some View {
        ZStack {
            // 深海蓝渐变色背景
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            ScrollView {
            VStack(spacing: 24) {
                // 根据登录状态显示不同内容
                if loginManager.isLoggedIn, let user = loginManager.currentUser {
                    // 已登录状态
                    LoggedInView(user: user)
                } else {
                    // 未登录状态
                    NotLoggedInView()
                }
                
                // 设置功能区（保留原有设置功能）
                SettingsSection()
                
                // 隐私政策和用户协议链接
                PrivacyLinksSection()
            }
            .padding()
        }
        }
        .navigationTitle("👤 个人中心")
        .navigationBarTitleDisplayMode(.large)
        .tint(.white)
        .alert("注销账号", isPresented: $isDeleteAccountConfirming) {
            Button("取消", role: .cancel) {}
            Button("确认注销", role: .destructive) {
                deleteAccount()
            }
        } message: {
            Text("确定要注销账号吗？此操作将清除所有本地数据，且无法恢复。")
        }
    }
    
    // MARK: - 已登录状态视图
    @ViewBuilder
    private func LoggedInView(user: User) -> some View {
        VStack(spacing: 20) {
            // 用户信息卡片
            UserInfoCard(user: user)
            
            // 统计信息卡片
            StatisticsCard(user: user)
        }
    }
    
    // MARK: - 未登录状态视图
    @ViewBuilder
    private func NotLoggedInView() -> some View {
        VStack(spacing: 20) {
            // 未登录用户信息
            VStack(spacing: 12) {
                // 默认头像
                Circle()
                    .fill(Color.blue.opacity(0.2))
                    .frame(width: 100, height: 100)
                    .overlay(
                        Image(systemName: "person.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.blue)
                    )
                
                // 登录/注册按钮
                Button(action: {
                    // 弹出登录视图
                    isLoginViewPresented = true
                }) {
                    Text("点击登录/注册")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 30)
                        .padding(.vertical, 12)
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [Color.blue, Color.purple]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(25)
                        .shadow(radius: 5)
                }
                .sheet(isPresented: $isLoginViewPresented) {
                    LoginView(isPresented: $isLoginViewPresented)
                        .environmentObject(loginManager)
                }
            }
            
            // 功能卡片
            FeatureBenefitsCard()
        }
    }
    
    // MARK: - 用户信息卡片
    @ViewBuilder
    private func UserInfoCard(user: User) -> some View {
        VStack(spacing: 16) {
            // 头像
            ZStack {
                if let avatarURL = user.avatarURL, let url = URL(string: avatarURL) {
                    AsyncImage(url: url) {phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                                .clipShape(Circle())
                        default:
                            DefaultAvatar(user: user)
                        }
                    }
                } else {
                    DefaultAvatar(user: user)
                }
                
                // 等级标识
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Text(user.intelligenceOfficerLevel)
                            .font(.caption2)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.orange)
                            .clipShape(Capsule())
                            .offset(x: 15, y: 15)
                    }
                }
            }
            
            // 昵称
            Text(user.nickname)
                .font(.title2)
                .fontWeight(.bold)
            
            // 私人情报员信息
            Text("您的私人情报员：点透（已在线）")
                .font(.subheadline)
                .foregroundColor(Color(hex: "3B82F6")) // 使用点透蓝
                .padding(.vertical, 4)
            
            // 等级信息
            Text("情报官等级：\(user.intelligenceOfficerLevel)")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            // 登出按钮
            Button(action: {
                loginManager.logout()
            }) {
                Text("退出登录")
                    .font(.subheadline)
                    .foregroundColor(.red)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 8)
                    .background(Color.red.opacity(0.1))
                    .cornerRadius(20)
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(
            GlassBackground()
        )
        .cornerRadius(20)
        .shadow(radius: 10)
    }
    
    // MARK: - 默认头像
    @ViewBuilder
    private func DefaultAvatar(user: User) -> some View {
        Circle()
            .fill(user.defaultAvatarColor)
            .frame(width: 100, height: 100)
            .overlay(
                Text(user.defaultAvatarText)
                    .font(.system(size: 40))
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            )
    }
    
    // MARK: - 统计信息卡片
    @ViewBuilder
    private func StatisticsCard(user: User) -> some View {
        HStack(spacing: 20) {
            // 已读情报数
            StatisticItem(
                icon: Image(systemName: "book.closed.fill"),
                title: "已读情报",
                value: "\(user.readNewsCount)"
            )
            
            Divider()
            
            // 收藏条数
            StatisticItem(
                icon: Image(systemName: "heart.fill"),
                title: "收藏",
                value: "\(user.favoriteCount)"
            )
            
            Divider()
            
            // 关注关键词数
            StatisticItem(
                icon: Image(systemName: "magnifyingglass"),
                title: "关注",
                value: "\(user.followedKeywords)"
            )
        }
        .padding(24)
        .background(
            GlassBackground()
        )
        .cornerRadius(20)
        .shadow(radius: 10)
    }
    
    // MARK: - 统计项
    @ViewBuilder
    private func StatisticItem(icon: Image, title: String, value: String) -> some View {
        VStack(spacing: 8) {
            icon
                .font(.system(size: 24))
                .foregroundColor(.blue)
            
            Text(value)
                .font(.title)
                .fontWeight(.bold)
                
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
    
    // MARK: - 功能卡片（未登录状态）
    @ViewBuilder
    private func FeatureBenefitsCard() -> some View {
        VStack(spacing: 16) {
            Text("登录后开启")
                .font(.headline)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                FeatureBenefitItem(icon: Image(systemName: "wand.and.stars"), text: "私人定制")
                FeatureBenefitItem(icon: Image(systemName: "cloud.fill"), text: "云端收藏")
                FeatureBenefitItem(icon: Image(systemName: "brain.fill"), text: "AI 复盘")
            }
        }
        .padding(24)
        .background(
            GlassBackground()
        )
        .cornerRadius(20)
        .shadow(radius: 10)
    }
    
    // MARK: - 功能项
    @ViewBuilder
    private func FeatureBenefitItem(icon: Image, text: String) -> some View {
        HStack(spacing: 12) {
            icon
                .font(.system(size: 20))
                .foregroundColor(.blue)
                .frame(width: 30)
            
            Text(text)
                .font(.subheadline)
        }
    }
    
    // MARK: - 设置功能区（保留原有设置功能）
    @ViewBuilder
    private func SettingsSection() -> some View {
        VStack(spacing: 16) {
            // 通知设置
            SettingGroup(title: "📱 通知设置") {
                Toggle("启用推送通知", isOn: $notificationsEnabled)
                
                if notificationsEnabled {
                    HStack {
                        Text("自动刷新间隔")
                        Spacer()
                        Picker("刷新间隔", selection: $newsUpdateInterval) {
                            Text("15分钟").tag(15)
                            Text("30分钟").tag(30)
                            Text("1小时").tag(60)
                            Text("2小时").tag(120)
                        }
                        .pickerStyle(MenuPickerStyle())
                    }
                }
            }
            
            // 外观设置
            SettingGroup(title: "🎨 外观设置") {
                Toggle("深色模式", isOn: $darkModeEnabled)
                
                HStack {
                    Text("字体大小")
                    Spacer()
                    Slider(value: $fontSize, in: 12...24, step: 1) {}
                        .frame(width: 100)
                    Text("\(Int(fontSize))")
                        .font(.system(size: fontSize))
                        .foregroundColor(.secondary)
                }
            }
            
            // 数据管理
            SettingGroup(title: "🔄 数据管理") {
                Toggle("自动刷新新闻", isOn: $autoRefreshEnabled)
                
                Button("清除缓存") {
                    Task {
                        await clearCache()
                    }
                }
                .foregroundColor(.red)
                
                Button("重置应用数据") {
                    resetAppData()
                }
                .foregroundColor(.red)
                
                Button("注销账号") {
                    showDeleteAccountConfirmation()
                }
                .foregroundColor(.red)
            }
            
            // 隐私管理
            SettingGroup(title: "🔒 隐私管理") {
                NavigationLink(destination: PrivacyManagementView()) {
                    HStack {
                        Text("隐私设置")
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            // 关键词管理
            SettingGroup(title: "🔍 关键词管理") {
                NavigationLink(destination: KeywordManagementView()) {
                    HStack {
                        Text("关注关键词")
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            // 关于
            SettingGroup(title: "ℹ️ 关于") {
                HStack {
                    Text("应用版本")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("开发者")
                    Spacer()
                    Text("haifangzhao")
                        .foregroundColor(.secondary)
                }
            }
        }
    }
    
    // MARK: - 设置分组
    @ViewBuilder
    private func SettingGroup(title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .fontWeight(.bold)
            
            VStack(spacing: 0) {
                content()
            }
        }
        .padding(20)
        .background(
            GlassBackground()
        )
        .cornerRadius(15)
        .shadow(radius: 5)
    }
    
    // MARK: - 清除缓存
    private func clearCache() async {
        // 清除缓存逻辑
        UserDefaults.standard.removeObject(forKey: "cached_news_data")
        UserDefaults.standard.removeObject(forKey: "cached_news_timestamp")
        
        await MainActor.run {
            print("缓存已清除")
        }
    }
    
    // MARK: - 重置应用数据
    private func resetAppData() {
        let domain = Bundle.main.bundleIdentifier!
        UserDefaults.standard.removePersistentDomain(forName: domain)
        UserDefaults.standard.synchronize()
        
        print("应用数据已重置")
    }
    
    // MARK: - 隐私政策和用户协议链接
    @ViewBuilder
    private func PrivacyLinksSection() -> some View {
        VStack(spacing: 12) {
            HStack(spacing: 24) {
                NavigationLink(destination: PrivacyPolicyView(contentType: .privacyPolicy)) {
                    Text("隐私政策")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                }
                
                NavigationLink(destination: PrivacyPolicyView(contentType: .userAgreement)) {
                    Text("用户协议")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                }
            }
            .padding(.bottom, 20)
        }
    }
    
    // MARK: - 显示注销账号确认
    private func showDeleteAccountConfirmation() {
        isDeleteAccountConfirming = true
    }
    
    // MARK: - 注销账号
    private func deleteAccount() {
        // 清除本地所有用户数据
        loginManager.deleteAccount()
        
        // 关闭确认对话框
        isDeleteAccountConfirming = false
    }
}

// MARK: - 磨砂玻璃背景
struct GlassBackground: View {
    var body: some View {
        Rectangle()
            .fill(Color.white.opacity(0.1))
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color.blue.opacity(0.05), Color.purple.opacity(0.05)]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .background(BlurBackground())
            .cornerRadius(15)
    }
}

// MARK: - 模糊背景
struct BlurBackground: UIViewRepresentable {
    func makeUIView(context: Context) -> UIVisualEffectView {
        let blurEffect = UIBlurEffect(style: .systemUltraThinMaterialDark)
        let blurView = UIVisualEffectView(effect: blurEffect)
        return blurView
    }
    
    func updateUIView(_ uiView: UIVisualEffectView, context: Context) {}
}

#Preview {
    PersonalCenterView()
        .environmentObject(LoginManager())
        .environmentObject(FavoritesManager())
}
