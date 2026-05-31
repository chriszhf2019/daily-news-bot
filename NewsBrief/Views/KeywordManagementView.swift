//
//  KeywordManagementView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-15.
//

import SwiftUI

// MARK: - 关键词管理视图
struct KeywordManagementView: View {
    @Environment(\.dismiss) private var dismiss
    
    @State private var keywords: [String] = ["人工智能", "科技", "互联网", "新能源", "医疗健康"]
    @State private var newKeyword: String = ""
    @State private var showAlert: Bool = false
    @State private var alertMessage: String = ""
    
    var body: some View {
        ZStack {
            // 深海蓝磨砂玻璃背景
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.blue.opacity(0.1),
                    Color.purple.opacity(0.1),
                    Color.indigo.opacity(0.1)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 20) {
                // 添加关键词
                VStack(spacing: 10) {
                    HStack(spacing: 12) {
                        TextField("输入关键词", text: $newKeyword)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                        
                        Button(action: addKeyword) {
                            Text("添加")
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 10)
                                .background(
                                    LinearGradient(
                                        gradient: Gradient(colors: [Color.blue, Color.purple]),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .cornerRadius(10)
                        }
                        .disabled(newKeyword.isEmpty)
                    }
                    
                    // 敏感设置提示
                    Text("我们采用加密技术保护您的偏好，数据仅用于 AI 优化，绝不共享给第三方")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
                .background(
                    GlassBackground()
                )
                .cornerRadius(15)
                .shadow(radius: 5)
                
                // 关键词列表
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(keywords, id: \.self) { keyword in
                            KeywordItemView(
                                keyword: keyword,
                                onDelete: { removeKeyword(keyword) }
                            )
                        }
                    }
                }
            }
            .padding()
        }
        .navigationTitle("关注关键词")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { dismiss() }) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.blue)
                }
            }
        }
        .alert(isPresented: $showAlert) {
            Alert(title: Text("提示"), message: Text(alertMessage), dismissButton: .default(Text("确定")))
        }
    }
    
    // MARK: - 添加关键词
    private func addKeyword() {
        guard !newKeyword.isEmpty else { return }
        
        if keywords.contains(newKeyword) {
            alertMessage = "该关键词已存在"
            showAlert = true
            return
        }
        
        if keywords.count >= 10 {
            alertMessage = "最多可以添加10个关键词"
            showAlert = true
            return
        }
        
        keywords.append(newKeyword)
        newKeyword = ""
        
        // 保存到UserDefaults
        UserDefaults.standard.set(keywords, forKey: "followedKeywords")
    }
    
    // MARK: - 删除关键词
    private func removeKeyword(_ keyword: String) {
        keywords.removeAll { $0 == keyword }
        
        // 保存到UserDefaults
        UserDefaults.standard.set(keywords, forKey: "followedKeywords")
    }
}

// MARK: - 关键词项视图
struct KeywordItemView: View {
    let keyword: String
    let onDelete: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            // 关键词标签
            Text(keyword)
                .font(.subheadline)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    LinearGradient(
                        gradient: Gradient(colors: [Color.blue.opacity(0.2), Color.purple.opacity(0.2)]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(20)
            
            Spacer()
            
            // 删除按钮
            Button(action: onDelete) {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(.red.opacity(0.5))
            }
        }
        .padding(12)
        .background(
            GlassBackground()
        )
        .cornerRadius(10)
        .shadow(radius: 3)
    }
}

#Preview {
    KeywordManagementView()
}
