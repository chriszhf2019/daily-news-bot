//
//  TomorrowFocusSection.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  明天点名功能组件（优化版）
//

import SwiftUI

// MARK: - 明天点名功能
struct TomorrowFocusSection: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @State private var focusKeyword: String = ""
    @State private var isLocked: Bool = false
    @State private var showHistory: Bool = false
    @State private var keywordHistory: [String] = []
    
    var body: some View {
        GlowCard(glowColor: .pointBlue, padding: Spacing.lg) {
            VStack(alignment: .leading, spacing: Spacing.md) {
                // 标题
                HeaderSection()
                
                // 输入框和锁定按钮
                InputSection(
                    focusKeyword: $focusKeyword,
                    isLocked: $isLocked,
                    showHistory: $showHistory,
                    onLock: lockKeyword
                )
                
                // 锁定状态提示
                if isLocked {
                    LockedStatusView(keyword: focusKeyword)
                }
                
                // 关键词历史记录
                if showHistory && !keywordHistory.isEmpty {
                    KeywordHistoryView(
                        history: keywordHistory,
                        onSelect: { keyword in
                            focusKeyword = keyword
                            showHistory = false
                        }
                    )
                }
                
                // 智能推荐
                if !isLocked && focusKeyword.isEmpty {
                    SmartRecommendationView(onSelect: { keyword in
                        focusKeyword = keyword
                    })
                }
            }
        }
        .padding(.horizontal, Spacing.lg)
        .onAppear {
            loadSavedData()
        }
    }
    
    // MARK: - 锁定关键词
    private func lockKeyword() {
        guard !focusKeyword.isEmpty else { return }
        
        isLocked.toggle()
        
        if isLocked {
            // 保存到UserDefaults
            UserDefaults.standard.set(focusKeyword, forKey: "tomorrow_focus")
            
            // 更新ViewModel
            viewModel.tomorrowFocus = focusKeyword
            
            // 添加到历史记录
            addToHistory(focusKeyword)
            
            // 触发新闻重新排序
            Task {
                await viewModel.fetchNews()
            }
        } else {
            // 解锁时清除
            UserDefaults.standard.removeObject(forKey: "tomorrow_focus")
            viewModel.tomorrowFocus = nil
        }
        
        // 触觉反馈
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.impactOccurred()
    }
    
    // MARK: - 加载保存的数据
    private func loadSavedData() {
        // 加载已锁定的关键词
        if let saved = UserDefaults.standard.string(forKey: "tomorrow_focus") {
            focusKeyword = saved
            isLocked = true
        }
        
        // 加载历史记录
        if let history = UserDefaults.standard.stringArray(forKey: "keyword_history") {
            keywordHistory = history
        }
    }
    
    // MARK: - 添加到历史记录
    private func addToHistory(_ keyword: String) {
        // 去重
        keywordHistory.removeAll { $0 == keyword }
        // 添加到开头
        keywordHistory.insert(keyword, at: 0)
        // 最多保留10条
        if keywordHistory.count > 10 {
            keywordHistory = Array(keywordHistory.prefix(10))
        }
        // 保存
        UserDefaults.standard.set(keywordHistory, forKey: "keyword_history")
    }
}

// MARK: - 标题区域
private struct HeaderSection: View {
    var body: some View {
        HStack(spacing: Spacing.sm) {
            Text("🎯")
                .font(Typography.title3)
            
            Text("明天想看什么？让点透帮你蹲点")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.9))
        }
    }
}

// MARK: - 输入区域
private struct InputSection: View {
    @Binding var focusKeyword: String
    @Binding var isLocked: Bool
    @Binding var showHistory: Bool
    let onLock: () -> Void
    
    var body: some View {
        HStack(spacing: Spacing.md) {
            // 输入框
            HStack(spacing: Spacing.sm) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: IconSize.sm))
                    .foregroundColor(.white.opacity(0.5))
                
                TextField("输入关键词，如：英伟达、AI、芯片", text: $focusKeyword)
                    .font(.system(size: 14))
                    .foregroundColor(.white)
                    .disabled(isLocked)
                    .onChange(of: focusKeyword) { _ in
                        showHistory = false
                    }
                
                // 历史记录按钮
                if !isLocked && focusKeyword.isEmpty {
                    Button(action: {
                        withAnimation(Animation.quick) {
                            showHistory.toggle()
                        }
                    }) {
                        Image(systemName: "clock.arrow.circlepath")
                            .font(.system(size: IconSize.sm))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
                
                // 清除按钮
                if !focusKeyword.isEmpty && !isLocked {
                    Button(action: {
                        focusKeyword = ""
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: IconSize.sm))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
            }
            .padding(.horizontal, Spacing.lg)
            .padding(.vertical, Spacing.md)
            .background(Color.white.opacity(0.08))
            .cornerRadius(CornerRadius.md)
            
            // 锁定按钮
            Button(action: onLock) {
                Image(systemName: isLocked ? "lock.fill" : "lock.open")
                    .font(.system(size: IconSize.md))
                    .foregroundColor(.white)
                    .frame(width: 44, height: 44)
                    .background(
                        Circle()
                            .fill(isLocked ? Color.pointBlue : Color.white.opacity(0.1))
                    )
            }
        }
    }
}

// MARK: - 锁定状态视图
private struct LockedStatusView: View {
    let keyword: String
    
    var body: some View {
        HStack(spacing: Spacing.xs + 2) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: IconSize.sm))
                .foregroundColor(.accentGreen)
            
            Text("已锁定「\(keyword)」，明天优先推送相关情报")
                .font(.system(size: 11))
                .foregroundColor(.accentGreen)
        }
        .transition(.asymmetric(
            insertion: .move(edge: .top).combined(with: .opacity),
            removal: .move(edge: .bottom).combined(with: .opacity)
        ))
    }
}

// MARK: - 关键词历史记录
private struct KeywordHistoryView: View {
    let history: [String]
    let onSelect: (String) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text("历史搜索")
                .font(Typography.caption2)
                .foregroundColor(.white.opacity(0.6))
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.sm) {
                    ForEach(history, id: \.self) { keyword in
                        Button(action: {
                            onSelect(keyword)
                        }) {
                            Text(keyword)
                                .font(Typography.caption1)
                                .foregroundColor(.white.opacity(0.8))
                                .padding(.horizontal, Spacing.md)
                                .padding(.vertical, Spacing.xs + 2)
                                .background(Color.white.opacity(0.1))
                                .cornerRadius(CornerRadius.sm)
                        }
                    }
                }
            }
        }
        .transition(.asymmetric(
            insertion: .move(edge: .top).combined(with: .opacity),
            removal: .move(edge: .bottom).combined(with: .opacity)
        ))
    }
}

// MARK: - 智能推荐
private struct SmartRecommendationView: View {
    let onSelect: (String) -> Void
    
    // 热门关键词推荐
    private let recommendations = ["AI", "芯片", "新能源", "量子计算", "自动驾驶"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack(spacing: Spacing.xs) {
                Image(systemName: "sparkles")
                    .font(.system(size: IconSize.xs))
                    .foregroundColor(.accentYellow)
                
                Text("热门推荐")
                    .font(Typography.caption2)
                    .foregroundColor(.white.opacity(0.6))
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.sm) {
                    ForEach(recommendations, id: \.self) { keyword in
                        Button(action: {
                            onSelect(keyword)
                        }) {
                            HStack(spacing: Spacing.xs) {
                                Text(keyword)
                                    .font(Typography.caption1)
                                    .foregroundColor(.accentYellow)
                                
                                Image(systemName: "arrow.right.circle.fill")
                                    .font(.system(size: IconSize.xs))
                                    .foregroundColor(.accentYellow.opacity(0.6))
                            }
                            .padding(.horizontal, Spacing.md)
                            .padding(.vertical, Spacing.xs + 2)
                            .background(Color.accentYellow.opacity(0.15))
                            .cornerRadius(CornerRadius.sm)
                        }
                    }
                }
            }
        }
        .transition(.asymmetric(
            insertion: .move(edge: .top).combined(with: .opacity),
            removal: .move(edge: .bottom).combined(with: .opacity)
        ))
    }
}

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        TomorrowFocusSection()
            .environmentObject(NewsViewModel())
    }
}
