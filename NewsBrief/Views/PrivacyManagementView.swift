//
//  PrivacyManagementView.swift
//  NewsBrief
//
//  Created by haifangzhao on 2025-01-15.
//

import SwiftUI
import UIKit

// MARK: - 隐私管理视图
struct PrivacyManagementView: View {
    @EnvironmentObject private var loginManager: LoginManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var isPersonalizedAIEnabled: Bool = true
    @State private var isExportingData: Bool = false
    @State private var isDeletingAccount: Bool = false
    @State private var showSuccessMessage: Bool = false
    @State private var successMessage: String = ""
    
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
                VStack(spacing: 20) {
                    // 个人数据导出
                    PrivacyOptionView(
                        icon: Image(systemName: "doc.badge.arrow.down"),
                        title: "个人数据导出",
                        description: "下载您的所有阅读行为数据",
                        action: exportPersonalData
                    )
                    
                    // 注销账号
                    PrivacyOptionView(
                        icon: Image(systemName: "person.fill.xmark"),
                        title: "注销账号",
                        description: "一键注销并删除服务器所有个人资料",
                        isDangerous: true,
                        action: deleteAccount
                    )
                    
                    // AI个性化开关
                    PrivacyOptionView(
                        icon: Image(systemName: "brain"),
                        title: "AI个性化",
                        description: "关闭后将使用匿名通用推荐模式",
                        isToggleable: true,
                        toggleValue: $isPersonalizedAIEnabled,
                        toggleAction: toggleAIpersonalization
                    )
                    
                    // 安全提示
                    VStack(spacing: 12) {
                        Text("数据安全说明")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(spacing: 12) {
                                Image(systemName: "lock.shield.fill")
                                    .font(.system(size: 20))
                                    .foregroundColor(.green)
                                    .frame(width: 24)
                                
                                Text("我们采用加密技术保护您的个人数据")
                                    .font(.subheadline)
                                    .foregroundColor(.white.opacity(0.9))
                            }
                            
                            HStack(spacing: 12) {
                                Image(systemName: "eye.slash.fill")
                                    .font(.system(size: 20))
                                    .foregroundColor(.green)
                                    .frame(width: 24)
                                
                                Text("您可以随时控制数据的使用方式")
                                    .font(.subheadline)
                                    .foregroundColor(.white.opacity(0.9))
                            }
                            
                            HStack(spacing: 12) {
                                Image(systemName: "hand.raised.fill")
                                    .font(.system(size: 20))
                                    .foregroundColor(.green)
                                    .frame(width: 24)
                                
                                Text("数据仅用于AI优化，绝不共享给第三方")
                                    .font(.subheadline)
                                    .foregroundColor(.white.opacity(0.9))
                            }
                        }
                    }
                    .padding(20)
                    .background(
                        // 玻璃拟态效果
                        Color.white.opacity(0.1)
                            .background(Material.thinMaterial)
                    )
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
                }
                .padding()
            }
            
            // 成功消息
            if showSuccessMessage {
                SuccessMessageView(message: successMessage) {
                    showSuccessMessage = false
                }
            }
            
            // 确认弹窗
            if isExportingData || isDeletingAccount {
                ConfirmationAlertView(
                    isPresented: isExportingData ? $isExportingData : $isDeletingAccount,
                    title: isExportingData ? "导出个人数据" : "注销账号",
                    message: isExportingData ? "确定要导出您的所有阅读行为数据吗？" : "确定要注销账号吗？此操作不可撤销，所有个人数据将被永久删除。",
                    confirmAction: isExportingData ? confirmExportData : confirmDeleteAccount
                )
            }
        }
        .navigationTitle("🔒 隐私管理")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { 
                    dismiss() 
                    let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedbackgenerator.impactOccurred()
                }) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.white)
                }
            }
        }
        .tint(.white)
        .onAppear {
            // 加载AI个性化设置
            isPersonalizedAIEnabled = UserDefaults.standard.bool(forKey: "personalizedAIEnabled")
        }
    }
    
    // MARK: - 导出个人数据
    private func exportPersonalData() {
        isExportingData = true
    }
    
    private func confirmExportData() {
        // 模拟导出数据
        isExportingData = false
        showSuccessMessage = true
        successMessage = "数据导出成功"
        
        // 实际项目中，这里应该调用API导出数据
        // 并使用UIActivityViewController分享
        if let user = loginManager.currentUser {
            exportUserData(user: user)
        }
    }
    
    // MARK: - 注销账号
    private func deleteAccount() {
        isDeletingAccount = true
    }
    
    private func confirmDeleteAccount() {
        // 模拟注销账号
        isDeletingAccount = false
        loginManager.logout()
        showSuccessMessage = true
        successMessage = "账号注销成功"
        
        // 延迟关闭页面
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            dismiss()
        }
    }
    
    // MARK: - 切换AI个性化
    private func toggleAIpersonalization() {
        UserDefaults.standard.set(isPersonalizedAIEnabled, forKey: "personalizedAIEnabled")
    }
    
    // MARK: - 导出用户数据
    private func exportUserData(user: User) {
        // 创建CSV数据
        var csv = "日期,行为类型,内容ID,内容标题,时长(秒)\n"
        
        // 模拟数据
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        
        for i in 1...5 {
            let date = Date().addingTimeInterval(-Double(i * 3600 * 24))
            let dateString = dateFormatter.string(from: date)
            let action = i % 2 == 0 ? "阅读" : "收藏"
            let contentId = "news_\(String(format: "%03d", i))"
            let contentTitle = "新闻标题 \(i)"
            let duration = String(i * 120)
            
            csv += "\(dateString),\(action),\(contentId),\(contentTitle),\(duration)\n"
        }
        
        // 保存到文件并分享
        guard let data = csv.data(using: .utf8) else { return }
        
        let filename = "新闻简报-阅读数据-\(Date().timeIntervalSince1970).csv"
        let fileURL = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(filename)
        
        do {
            try data.write(to: fileURL)
            
            let activityVC = UIActivityViewController(activityItems: [fileURL], applicationActivities: nil)
            
            // 这里需要获取当前的UIViewController
            // 使用 UIWindowScene 获取根控制器以替代已废弃的 UIApplication.shared.windows API
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let rootVC = windowScene.windows.first?.rootViewController {
                rootVC.present(activityVC, animated: true)
            }
        } catch {
            print("导出数据失败: \(error)")
        }
    }
}

// MARK: - 隐私选项视图
struct PrivacyOptionView: View {
    let icon: Image
    let title: String
    let description: String
    var isDangerous: Bool = false
    var isToggleable: Bool = false
    var toggleValue: Binding<Bool>? = nil
    var toggleAction: (() -> Void)? = nil
    var action: (() -> Void)? = nil
    
    var body: some View {
        HStack(spacing: 16) {
            // 图标
            icon
                .font(.system(size: 24))
                .foregroundColor(isDangerous ? .red : Color(hex: "3B82F6"))
                .frame(width: 30)
            
            // 标题和描述
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.medium)
                    .foregroundColor(isDangerous ? .red : .white)
                
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.8))
            }
            
            Spacer()
            
            // 操作按钮或开关
            if isToggleable, let toggleValue = toggleValue, let toggleAction = toggleAction {
                Toggle("", isOn: toggleValue)
                    .onChange(of: toggleValue.wrappedValue) {
                        _ in
                        toggleAction()
                        let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                        impactFeedbackgenerator.impactOccurred()
                    }
            } else if let action = action {
                Button(action: {
                    action()
                    let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedbackgenerator.impactOccurred()
                }) {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.white.opacity(0.7))
                }
            } else {
                Image(systemName: "chevron.right")
                    .foregroundColor(.white.opacity(0.3))
            }
        }
        .padding()
        .background(
            // 玻璃拟态效果
            Color.white.opacity(0.1)
                .background(Material.thinMaterial)
        )
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
    }
}

// MARK: - 成功消息视图
struct SuccessMessageView: View {
    let message: String
    let onDismiss: () -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 40))
                .foregroundColor(.green)
            
            Text(message)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.green)
        }
        .padding(20)
        .background(
            // 玻璃拟态效果
            Color.white.opacity(0.9)
                .background(Material.thinMaterial)
        )
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.2), radius: 10, x: 0, y: 5)
        .padding()
        .transition(.opacity)
        .animation(.easeInOut, value: message)
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                onDismiss()
            }
        }
    }
}

// MARK: - 确认弹窗视图
struct ConfirmationAlertView: View {
    @Binding var isPresented: Bool
    let title: String
    let message: String
    let confirmAction: () -> Void
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .onTapGesture {
                    isPresented = false
                }
            
            VStack(spacing: 20) {
                Text(title)
                    .font(.title2)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                
                Text(message)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                
                HStack(spacing: 12) {
                    Button(action: { isPresented = false }) {
                        Text("取消")
                            .font(.headline)
                            .foregroundColor(.secondary)
                            .padding(.vertical, 12)
                            .frame(maxWidth: .infinity)
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(25)
                    }
                    
                    Button(action: confirmAction) {
                        Text("确认")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.vertical, 12)
                            .frame(maxWidth: .infinity)
                            .background(
                                LinearGradient(
                                    gradient: Gradient(colors: [Color.red, Color.orange]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(25)
                    }
                }
            }
            .padding(24)
            .background(Color.white)
            .cornerRadius(20)
            .shadow(radius: 10)
            .padding()
            .transition(.scale)
            .animation(.spring(response: 0.4, dampingFraction: 0.8), value: isPresented)
        }
    }
}

#Preview {
    PrivacyManagementView()
        .environmentObject(LoginManager())
}
