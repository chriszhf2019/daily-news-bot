//
//  OnboardingView.swift
//  Point
//
//  Created by haifangzhao on 2026-01-19.
//

import SwiftUI
import UserNotifications

// 引导流程视图
struct OnboardingView: View {
    @State private var currentPage = 0
    @State private var selectedIdentities: [Identity] = []
    @State private var selectedInterests: [Interest] = []
    @State private var showNotificationPermission = false
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding: Bool = false
    @Environment(\.presentationMode) var presentationMode
    
    // 数据模型
    enum Identity: String, CaseIterable, Identifiable {
        case student = "学生"
        case investor = "投资者"
        case entrepreneur = "创业者"
        case programmer = "程序员"
        
        var id: String { rawValue }
    }
    
    enum Interest: String, CaseIterable, Identifiable {
        case ai = "人工智能"
        case tech = "科技前沿"
        case finance = "金融投资"
        case startups = "创业创新"
        case education = "教育发展"
        case health = "健康医疗"
        
        var id: String { rawValue }
    }
    
    var body: some View {
        ZStack(alignment: .topTrailing) {
            // 背景
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            // 跳过按钮，符合苹果风格的简洁退出选项
            Button(action: {
                completeOnboarding()
            }) {
                Text("跳过")
                    .font(.subheadline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
            }
            .padding(.top, 8)
            .padding(.trailing, 12)
            
            // 内容
            VStack {
                Spacer()
                
                // 品牌展示
                if currentPage == 0 {
                    BrandOnboardingPage()
                }
                // 偏好设置
                else if currentPage == 1 {
                    PreferencesOnboardingPage(
                        selectedIdentities: $selectedIdentities,
                        selectedInterests: $selectedInterests
                    )
                }
                // 权限申请
                else if currentPage == 2 {
                    PermissionOnboardingPage(showNotificationPermission: $showNotificationPermission)
                }
                
                Spacer()
                
                // 分页指示器
                HStack(spacing: 8) {
                    ForEach(0..<3, id: \.self) {
                        page in
                        Circle()
                            .fill(page == currentPage ? Color(hex: "3B82F6") : Color.gray.opacity(0.5))
                            .frame(width: 8, height: 8)
                    }
                }
                .padding(.bottom, 24)
                
                // 导航按钮
                HStack(spacing: 16) {
                    // 上一步按钮
                    if currentPage > 0 {
                        Button(action: {
                            withAnimation {
                                currentPage -= 1
                            }
                        }) {
                            Text("上一步")
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding(.horizontal, 24)
                                .padding(.vertical, 12)
                                .background(
                                    Color.white.opacity(0.2)
                                        .background(Material.thinMaterial)
                                )
                                .cornerRadius(24)
                        }
                    }
                    
                    Spacer()
                    
                    // 下一步/完成按钮
                    Button(action: {
                        withAnimation {
                            if currentPage < 2 {
                                currentPage += 1
                            } else {
                                // 完成引导流程
                                completeOnboarding()
                            }
                        }
                    }) {
                        HStack(spacing: 8) {
                            Text(currentPage == 2 ? "完成" : "下一步")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            if currentPage < 2 {
                                Image(systemName: "arrow.right")
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [Color(hex: "3B82F6"), Color(hex: "1D4ED8")]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(24)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
        .sheet(isPresented: $showNotificationPermission) {
            NotificationPermissionView()
        }
    }
    
    // 完成引导流程
    private func completeOnboarding() {
        // 保存用户选择
        saveOnboardingData()
        
        // 标记引导流程已完成
        hasCompletedOnboarding = true
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
        
        // 返回主界面
        presentationMode.wrappedValue.dismiss()
    }
    
    // 保存用户选择到本地
    private func saveOnboardingData() {
        // 保存身份选择
        let identityStrings = selectedIdentities.map { $0.rawValue }
        UserDefaults.standard.set(identityStrings, forKey: "userIdentities")
        
        // 保存兴趣选择
        let interestStrings = selectedInterests.map { $0.rawValue }
        UserDefaults.standard.set(interestStrings, forKey: "userInterests")
    }
}

// 品牌展示页面
struct BrandOnboardingPage: View {
    var body: some View {
        VStack(spacing: 32) {
            // Logo
            Image(systemName: "brain.circle.fill")
                .font(.system(size: 96))
                .foregroundColor(Color(hex: "3B82F6"))
                .shadow(color: Color(hex: "3B82F6").opacity(0.5), radius: 16, x: 0, y: 0)
            
            // 品牌名称和标语
            VStack(spacing: 8) {
                Text("点透")
                    .font(.system(size: 42, weight: .bold, design: .default))
                    .foregroundColor(.white)
                
                Text("你的私人情报局")
                    .font(.title3)
                    .foregroundColor(.white.opacity(0.9))
            }
            
            // 简介
            Text("用AI帮你看懂世界的逻辑，把握前沿趋势，洞察底层规律")
                .font(.system(size: 16))
                .foregroundColor(.white.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .opacity(0)
        .animation(.easeInOut(duration: 0.8), value: true)
        .opacity(1)
    }
}

// 偏好设置页面
struct PreferencesOnboardingPage: View {
    @Binding var selectedIdentities: [OnboardingView.Identity]
    @Binding var selectedInterests: [OnboardingView.Interest]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            // 标题
            Text("设置你的偏好")
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            
            // 身份选择
            VStack(alignment: .leading, spacing: 16) {
                Text("你的身份")
                    .font(.system(size: 20, weight: .medium, design: .rounded))
                    .foregroundColor(.white)
                
                // 身份选择网格
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 16), GridItem(.flexible(), spacing: 16)], spacing: 16) {
                    ForEach(OnboardingView.Identity.allCases) {
                        identity in
                        IdentityChip(
                            identity: identity,
                            isSelected: selectedIdentities.contains(identity),
                            action: {
                                toggleIdentity(identity)
                            }
                        )
                    }
                }
            }
            
            // 兴趣选择
            VStack(alignment: .leading, spacing: 16) {
                Text("关注领域")
                    .font(.system(size: 20, weight: .medium, design: .rounded))
                    .foregroundColor(.white)
                
                // 兴趣选择网格
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 16), GridItem(.flexible(), spacing: 16)], spacing: 16) {
                    ForEach(OnboardingView.Interest.allCases) {
                        interest in
                        InterestChip(
                            interest: interest,
                            isSelected: selectedInterests.contains(interest),
                            action: {
                                toggleInterest(interest)
                            }
                        )
                    }
                }
            }
        }
        .padding(.horizontal, 24)
        .opacity(0)
        .animation(.easeInOut(duration: 0.8), value: true)
        .opacity(1)
    }
    
    // 切换身份选择
    private func toggleIdentity(_ identity: OnboardingView.Identity) {
        if let index = selectedIdentities.firstIndex(of: identity) {
            selectedIdentities.remove(at: index)
        } else {
            selectedIdentities.append(identity)
        }
    }
    
    // 切换兴趣选择
    private func toggleInterest(_ interest: OnboardingView.Interest) {
        if let index = selectedInterests.firstIndex(of: interest) {
            selectedInterests.remove(at: index)
        } else {
            selectedInterests.append(interest)
        }
    }
}

// 权限申请页面
struct PermissionOnboardingPage: View {
    @Binding var showNotificationPermission: Bool
    
    var body: some View {
        VStack(spacing: 24) {
            // 标题
            Text("开启通知权限")
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            
            // 说明
            Text("我们会在重要新闻和趋势更新时通知你，不会发送垃圾信息")
                .font(.system(size: 16))
                .foregroundColor(.white.opacity(0.8))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
            
            // 隐私保护承诺
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 8) {
                    Image(systemName: "shield.checkmark")
                        .foregroundColor(.green)
                    Text("隐私保护承诺")
                        .font(.system(size: 18, weight: .medium, design: .rounded))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Circle()
                            .fill(Color.green)
                            .frame(width: 6, height: 6)
                        Text("我们不会收集或分享你的个人隐私信息")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.8))
                    }
                    HStack(spacing: 8) {
                        Circle()
                            .fill(Color.green)
                            .frame(width: 6, height: 6)
                        Text("所有数据仅用于个性化推荐，存储在本地")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.8))
                    }
                    HStack(spacing: 8) {
                        Circle()
                            .fill(Color.green)
                            .frame(width: 6, height: 6)
                        Text("你可以随时在设置中关闭通知")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
            }
            .padding(20)
            .background(
                Color.white.opacity(0.1)
                    .background(Material.thinMaterial)
            )
            .cornerRadius(16)
            .padding(.horizontal, 24)
            
            // 开启通知按钮
            Button(action: {
                showNotificationPermission = true
            }) {
                HStack(spacing: 8) {
                    Text("开启通知权限")
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                    Image(systemName: "bell.badge")
                }
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(
                    LinearGradient(
                        gradient: Gradient(colors: [Color(hex: "3B82F6"), Color(hex: "1D4ED8")]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(28)
            }
        }
        .opacity(0)
        .animation(.easeInOut(duration: 0.8), value: true)
        .opacity(1)
    }
}

// 身份选择芯片
struct IdentityChip: View {
    let identity: OnboardingView.Identity
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: getIdentityIcon(identity))
                    .font(.system(size: 32))
                    .foregroundColor(isSelected ? Color(hex: "3B82F6") : .white.opacity(0.7))
                
                Text(identity.rawValue)
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundColor(isSelected ? Color(hex: "3B82F6") : .white.opacity(0.7))
            }
            .padding(20)
            .background(
                isSelected ? 
                Color.white.opacity(0.2)
                    .background(Material.thinMaterial)
                : Color.white.opacity(0.1)
                    .background(Material.thinMaterial)
            )
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(
                        isSelected ? Color(hex: "3B82F6") : Color.white.opacity(0.3),
                        lineWidth: 2
                    )
            )
        }
    }
    
    // 获取身份对应的图标
    private func getIdentityIcon(_ identity: OnboardingView.Identity) -> String {
        switch identity {
        case .student:
            return "graduationcap.fill"
        case .investor:
            return "chart.xyaxis.line"
        case .entrepreneur:
            return "briefcase.fill"
        case .programmer:
            return "laptopcomputer.fill"
        }
    }
}

// 兴趣选择芯片
struct InterestChip: View {
    let interest: OnboardingView.Interest
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(interest.rawValue)
                .font(.system(size: 16, weight: .medium, design: .rounded))
                .foregroundColor(isSelected ? Color(hex: "3B82F6") : .white.opacity(0.9))
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(
                    isSelected ? 
                    Color.white.opacity(0.2)
                        .background(Material.thinMaterial)
                    : Color.white.opacity(0.1)
                        .background(Material.thinMaterial)
                )
                .cornerRadius(24)
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(
                            isSelected ? Color(hex: "3B82F6") : Color.white.opacity(0.3),
                            lineWidth: 2
                        )
                )
        }
    }
}

// 通知权限请求视图
struct NotificationPermissionView: View {
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        VStack(spacing: 24) {
            // 标题
            Text("开启通知权限")
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            
            // 说明
            Text("我们会在重要新闻和趋势更新时通知你，不会发送垃圾信息")
                .font(.system(size: 16))
                .foregroundColor(.white.opacity(0.9))
                .multilineTextAlignment(.center)
            
            // 图标
            Image(systemName: "bell.badge.fill")
                .font(.system(size: 80))
                .foregroundColor(Color(hex: "3B82F6"))
                .shadow(
                    color: Color(hex: "3B82F6").opacity(0.5),
                    radius: 20,
                    x: 0,
                    y: 0
                )
            
            // 操作按钮
            VStack(spacing: 12) {
                Button(action: {
                    requestNotificationPermission()
                }) {
                    Text("允许通知")
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 14)
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [Color(hex: "3B82F6"), Color(hex: "1D4ED8")]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(28)
                }
                
                Button(action: {
                    presentationMode.wrappedValue.dismiss()
                }) {
                    Text("暂不开启")
                        .font(.system(size: 18, weight: .medium, design: .rounded))
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.horizontal, 24)
                        .padding(.vertical, 14)
                        .background(
                            Color.white.opacity(0.2)
                                .background(Material.thinMaterial)
                        )
                        .cornerRadius(28)
                }
            }
        }
        .padding(.horizontal, 24)
        .frame(maxWidth: 400)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
                .background(Material.thickMaterial)
        )
        .cornerRadius(24)
    }
    
    // 请求通知权限
    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) {
            granted, error in
            if let error = error {
                print("请求通知权限失败: \(error)")
            }
            
            // 关闭弹窗
            DispatchQueue.main.async {
                presentationMode.wrappedValue.dismiss()
            }
        }
    }
}

// 预览
struct OnboardingView_Previews: PreviewProvider {
    static var previews: some View {
        OnboardingView()
    }
}
