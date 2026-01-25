//
//  NewsListView.swift
//  点透 (Point)
//
//  Created by haifangzhao on 2025-01-01.
//

import SwiftUI

// MARK: - 首页新闻列表视图
struct NewsListView: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @EnvironmentObject var favoritesManager: FavoritesManager
    @State private var selectedCategory: String = "全部"
    @State private var showMoreNews = false
    @State private var selectedNews: News?
    
    // 点透蓝
    private let pointBlue = Color(hex: "3B82F6")
    
    // 分类列表
    private let categories = [
        ("全部", "📰"),
        ("AI动态", "🤖"),
        ("科技前沿", "🚀"),
        ("商业财经", "💰"),
        ("国际要闻", "🌍"),
        ("汽车科技", "🚗")
    ]
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                // 品牌头部
                BrandHeaderView()
                
                // 顶部仪表盘
                TopDashboardSection(newsCount: viewModel.filteredNews.count)
                
                // 明天点名功能
                TomorrowFocusSection()
                
                // 阅读模式切换
                ReadingModeSelector(selectedMode: $viewModel.readingMode)
                
                // 分类筛选栏
                CategoryFilterBar(
                    categories: categories,
                    selectedCategory: $selectedCategory
                )
                
                // 新闻列表
                LazyVStack(spacing: 20) {
                    // 前20条新闻
                    ForEach(Array(filteredNews.prefix(20).enumerated()), id: \.element.id) { index, news in
                        NewsCardDetailView(news: news, index: index + 1)
                    }
                    
                    // 更多新闻按钮
                    if filteredNews.count > 20 {
                        MoreNewsButton(
                            remainingCount: filteredNews.count - 20,
                            isExpanded: $showMoreNews
                        )
                        
                        // 展开的更多新闻
                        if showMoreNews {
                            ForEach(Array(filteredNews.dropFirst(20).enumerated()), id: \.element.id) { index, news in
                                NewsCardDetailView(news: news, index: index + 21)
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 120)
            }
        }
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
        .refreshable {
            await viewModel.refreshNews()
        }
        .sheet(item: $selectedNews) { news in
            NewsDetailView(news: news)
                .environmentObject(favoritesManager)
        }
        .overlay {
            if viewModel.isLoading {
                LoadingView()
            }
        }
    }
    
    // 根据分类过滤新闻
    private var filteredNews: [News] {
        if selectedCategory == "全部" {
            return viewModel.filteredNews
        } else {
            return viewModel.filteredNews.filter { $0.category == selectedCategory }
        }
    }
}

// MARK: - 品牌头部视图
struct BrandHeaderView: View {
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        VStack(spacing: 12) {
            // Logo和品牌名
            HStack(spacing: 10) {
                // 品牌Logo
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [pointBlue, Color.purple]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 44, height: 44)
                        .shadow(color: pointBlue.opacity(0.4), radius: 8, x: 0, y: 4)
                    
                    Image(systemName: "arrow.up")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("点透")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Text("Point")
                        .font(.caption)
                        .foregroundColor(.primary.opacity(0.8))
                }
                
                Spacer()
                
                // 今日日期
            VStack(alignment: .trailing, spacing: 2) {
                    Text(currentDateString())
                        .font(.caption)
                        .foregroundColor(.primary.opacity(0.8))
                    
                    Text("周\(currentWeekday())")
                        .font(.caption)
                        .foregroundColor(.primary.opacity(0.7))
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            
            // 宣传语
            Text("帮你点透世界逻辑的新闻智库")
                .font(.caption)
                .foregroundColor(.primary.opacity(0.8))
                .padding(.horizontal, 20)
                .padding(.bottom, 4)
            
            // 分隔线
            Rectangle()
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [Color.clear, pointBlue.opacity(0.3), Color.clear]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 1)
                .padding(.horizontal, 40)
        }
    }
    
    private func currentDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy年MM月dd日"
        return formatter.string(from: Date())
    }
    
    private func currentWeekday() -> String {
        let weekdays = ["日", "一", "二", "三", "四", "五", "六"]
        let calendar = Calendar.current
        let weekday = calendar.component(.weekday, from: Date())
        return weekdays[weekday - 1]
    }
}

// MARK: - 顶部仪表盘
struct TopDashboardSection: View {
    let newsCount: Int
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        HStack(spacing: 12) {
            // 今日情报
            DashboardCard(
                icon: "📋",
                value: "\(newsCount)",
                label: "今日情报",
                gradient: [Color(hex: "1E293B"), Color(hex: "334155")]
            )
            
            // 情绪指数
            DashboardCard(
                icon: "🧠",
                value: "68",
                label: "情绪指数",
                gradient: [Color(hex: "7C3AED").opacity(0.8), Color(hex: "4C1D95")]
            )
            
            // 重要信号
            DashboardCard(
                icon: "⚡",
                value: "5",
                label: "重要信号",
                gradient: [Color(hex: "059669"), Color(hex: "047857")]
            )
        }
        .padding(.horizontal, 16)
    }
}

// MARK: - 仪表盘卡片
struct DashboardCard: View {
    let icon: String
    let value: String
    let label: String
    let gradient: [Color]
    
    var body: some View {
        VStack(spacing: 8) {
            Text(icon)
                .font(.title2)
            
            Text(value)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Text(label)
                .font(.caption)
                .foregroundColor(.white.opacity(0.8))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: gradient),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
    }
}

// MARK: - 明天点名功能
struct TomorrowFocusSection: View {
    @State private var focusKeyword: String = ""
    @State private var isLocked: Bool = false
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Text("🎯")
                    .font(.title3)
                
                Text("明天想看什么？让点透帮你蹲点")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
            }
            
            HStack(spacing: 12) {
                // 输入框
                HStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.5))
                    
                    TextField("输入关键词，如：英伟达、AI、芯片", text: $focusKeyword)
                        .font(.system(size: 14))
                        .foregroundColor(.white)
                        .disabled(isLocked)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.white.opacity(0.08))
                .cornerRadius(12)
                
                // 锁定按钮
                Button(action: {
                    if !focusKeyword.isEmpty {
                        isLocked.toggle()
                        // 保存到UserDefaults
                        if isLocked {
                            UserDefaults.standard.set(focusKeyword, forKey: "tomorrow_focus")
                        }
                        let generator = UIImpactFeedbackGenerator(style: .medium)
                        generator.impactOccurred()
                    }
                }) {
                    Image(systemName: isLocked ? "lock.fill" : "lock.open")
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                        .frame(width: 44, height: 44)
                        .background(
                            Circle()
                                .fill(isLocked ? pointBlue : Color.white.opacity(0.1))
                        )
                }
            }
            
            if isLocked {
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 12))
                        .foregroundColor(.green)
                    
                    Text("已锁定「\(focusKeyword)」，明天优先推送相关情报")
                        .font(.system(size: 11))
                        .foregroundColor(.green)
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Material.ultraThinMaterial)
                .opacity(0.6)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [pointBlue.opacity(0.3), Color.purple.opacity(0.2)]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .padding(.horizontal, 16)
        .onAppear {
            // 加载已保存的关键词
            if let saved = UserDefaults.standard.string(forKey: "tomorrow_focus") {
                focusKeyword = saved
                isLocked = true
            }
        }
    }
}

// MARK: - 阅读模式选择器
struct ReadingModeSelector: View {
    @Binding var selectedMode: ReadingMode
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        HStack(spacing: 10) {
            ForEach(ReadingMode.allCases) { mode in
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedMode = mode
                    }
                    let generator = UIImpactFeedbackGenerator(style: .light)
                    generator.impactOccurred()
                }) {
                    Text(mode.rawValue)
                        .font(.subheadline)
                        .fontWeight(selectedMode == mode ? .semibold : .regular)
                        .foregroundColor(selectedMode == mode ? .white : .white.opacity(0.6))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 20)
                                .fill(selectedMode == mode ? pointBlue : Color.white.opacity(0.1))
                        )
                }
            }
        }
        .padding(.horizontal, 16)
    }
}

// MARK: - 分类筛选栏
struct CategoryFilterBar: View {
    let categories: [(String, String)]
    @Binding var selectedCategory: String
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(categories, id: \.0) { category, icon in
                    CategoryFilterChip(
                        title: category,
                        icon: icon,
                        isSelected: selectedCategory == category
                    ) {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedCategory = category
                        }
                        let generator = UIImpactFeedbackGenerator(style: .light)
                        generator.impactOccurred()
                    }
                }
            }
            .padding(.horizontal, 16)
        }
    }
}

// MARK: - 分类筛选标签
struct CategoryFilterChip: View {
    let title: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(icon)
                    .font(.system(size: 16))
                
                Text(title)
                    .font(.caption)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .foregroundColor(isSelected ? .white : .white.opacity(0.7))
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? pointBlue : Color.white.opacity(0.08))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(isSelected ? Color.clear : Color.white.opacity(0.1), lineWidth: 1)
                    )
            )
        }
    }
}

// MARK: - 更多新闻按钮
struct MoreNewsButton: View {
    let remainingCount: Int
    @Binding var isExpanded: Bool
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        Button(action: {
            withAnimation(.easeInOut(duration: 0.3)) {
                isExpanded.toggle()
            }
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
        }) {
            HStack(spacing: 12) {
                Image(systemName: isExpanded ? "chevron.up.circle.fill" : "chevron.down.circle.fill")
                    .font(.title2)
                    .foregroundColor(pointBlue)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(isExpanded ? "收起更多" : "查看更多")
                        .font(.headline)
                        .foregroundColor(.white)
                    
                    Text("还有 \(remainingCount) 条新闻")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.6))
                }
                
                Spacer()
                
                Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    .foregroundColor(.white.opacity(0.6))
            }
            .padding(16)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [pointBlue.opacity(0.2), Color.purple.opacity(0.15)]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(pointBlue.opacity(0.3), lineWidth: 1)
            )
        }
        .padding(.vertical, 8)
    }
}


// MARK: - 详细新闻卡片视图
struct NewsCardDetailView: View {
    let news: News
    let index: Int
    @EnvironmentObject var viewModel: NewsViewModel
    @EnvironmentObject var favoritesManager: FavoritesManager
    @State private var isExpanded = false
    @State private var userJob = ""
    @State private var showRipples = false // 显示二阶效应
    @State private var showMentalModel = false // 显示思维模型
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // 顶部：序号、情绪指示器、重要性
            HStack(spacing: 8) {
                // 序号
                Text("\(index)")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundColor(.white.opacity(0.5))
                    .frame(width: 20, height: 20)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(4)
                
                // 情绪指示器
                SentimentBadge(sentiment: news.aiAnalysis?.sentiment ?? "neutral")
                
                Spacer()
                
                // 当前阅读模式标签
                Text(viewModel.readingMode.rawValue)
                    .font(.system(size: 9))
                    .foregroundColor(pointBlue)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(pointBlue.opacity(0.15))
                    .cornerRadius(4)
                
                // 重要性标签
                if let importance = news.aiAnalysis?.importance, importance >= 80 {
                    HStack(spacing: 4) {
                        Text("\(importance)")
                            .font(.system(size: 11, weight: .bold))
                        Text("重要")
                            .font(.system(size: 10))
                    }
                    .foregroundColor(.orange)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.orange.opacity(0.15))
                    .cornerRadius(8)
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 14)
            
            // 新闻标题（带逻辑挂钩图标）
            HStack(alignment: .top, spacing: 8) {
                Text(news.title)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(2)
                
                // 逻辑挂钩图标
                if news.intelPro != nil {
                    Button(action: {
                        showMentalModel = true
                        let generator = UIImpactFeedbackGenerator(style: .light)
                        generator.impactOccurred()
                    }) {
                        Image(systemName: "brain.head.profile")
                            .font(.system(size: 14))
                            .foregroundColor(.purple.opacity(0.8))
                            .padding(6)
                            .background(
                                Circle()
                                    .fill(Color.purple.opacity(0.15))
                            )
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 10)
            
            // 根据阅读模式显示不同内容
            switch viewModel.readingMode {
            case .standard:
                // 深度看模式：完整内容
                StandardModeContent(news: news, pointBlue: pointBlue)
            case .simple:
                // 讲白话模式：简化内容
                SimpleModeContent(news: news, pointBlue: pointBlue)
            case .concise:
                // 捞干货模式：极简内容
                ConciseModeContent(news: news, pointBlue: pointBlue)
            }
            
            // 底部操作栏
            HStack(spacing: 0) {
                // 收藏按钮
                ActionButton(
                    icon: favoritesManager.isNewsFavorited(news.id) ? "heart.fill" : "heart",
                    text: "收藏",
                    color: favoritesManager.isNewsFavorited(news.id) ? .red : .white.opacity(0.6)
                ) {
                    favoritesManager.toggleFavorite(newsID: news.id)
                }
                
                Spacer()
                
                // 分享按钮
                ActionButton(
                    icon: "paperplane",
                    text: "分享",
                    color: .white.opacity(0.6)
                ) {
                    // 分享功能
                }
                
                Spacer()
                
                // 浮动按钮
                FloatingActionButton()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
        .background(
            RoundedRectangle(cornerRadius: 18)
                .fill(Color(hex: "1E293B").opacity(0.6))
                .background(
                    RoundedRectangle(cornerRadius: 18)
                        .fill(Material.ultraThinMaterial)
                        .opacity(0.3)
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18)
                .stroke(Color.white.opacity(0.08), lineWidth: 1)
        )
        // 思维模型弹窗
        .sheet(isPresented: $showMentalModel) {
            if let intelPro = news.intelPro {
                MentalModelSheet(mentalModel: intelPro.mentalModel)
                    .presentationDetents([.medium])
                    .presentationDragIndicator(.visible)
            }
        }
    }
}

// MARK: - 深度看模式内容
struct StandardModeContent: View {
    let news: News
    let pointBlue: Color
    @State private var showRipples = false // 显示二阶效应
    @State private var showMentalModel = false // 显示思维模型
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // 摘要区域
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 5) {
                    Rectangle()
                        .fill(pointBlue)
                        .frame(width: 3, height: 14)
                        .cornerRadius(1.5)
                    
                    Text("📋 摘要")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(pointBlue)
                }
                
                Text(news.summary)
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.85))
                    .lineSpacing(5)
            }
            .padding(12)
            .background(Color.white.opacity(0.04))
            .cornerRadius(10)
            .padding(.horizontal, 16)
            .padding(.top, 12)
            
            // 出处、时间、可靠性
            VStack(spacing: 8) {
                HStack(spacing: 0) {
                    HStack(spacing: 4) {
                        Text("出处:")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.5))
                        
                        Text(news.source)
                            .font(.system(size: 12))
                            .foregroundColor(pointBlue)
                            .underline()
                    }
                    
                    Spacer()
                    
                    // 可靠性评分
                    if let reliability = news.aiAnalysis?.reliability {
                        HStack(spacing: 4) {
                            ForEach(0..<min(reliability / 20, 5), id: \.self) { _ in
                                Image(systemName: "star.fill")
                                    .font(.system(size: 8))
                                    .foregroundColor(.yellow)
                            }
                            Text("\(reliability)分")
                                .font(.system(size: 10))
                                .foregroundColor(.yellow)
                        }
                    }
                }
                
                HStack {
                    Text("发布时间: \(news.publishedAt)")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.5))
                    
                    Spacer()
                    
                    // 重要程度
                    if let importance = news.aiAnalysis?.importance {
                        HStack(spacing: 4) {
                            Text("重要度:")
                                .font(.system(size: 11))
                                .foregroundColor(.white.opacity(0.5))
                            Text("\(importance)")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(importanceColor(importance))
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            
            // 标签
            if !news.tags.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(news.tags.prefix(4), id: \.self) { tag in
                            Text("#\(tag)")
                                .font(.system(size: 12))
                                .foregroundColor(pointBlue)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(pointBlue.opacity(0.12))
                                .cornerRadius(6)
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
            
            // AI深度解读
            if let aiAnalysis = news.aiAnalysis {
                AIInsightSection(analysis: aiAnalysis)
                    .padding(.horizontal, 16)
            }
            
            // "然后呢？"按钮 - 显示二阶效应
            if let intelPro = news.intelPro {
                Button(action: {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                        showRipples.toggle()
                    }
                    let generator = UIImpactFeedbackGenerator(style: .medium)
                    generator.impactOccurred()
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: showRipples ? "chevron.down.circle.fill" : "chevron.right.circle.fill")
                            .font(.system(size: 16))
                            .foregroundColor(.cyan)
                        
                        Text("然后呢？")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.cyan)
                        
                        Text("看看二阶效应")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.6))
                        
                        Spacer()
                        
                        Image(systemName: "waveform.path")
                            .font(.system(size: 14))
                            .foregroundColor(.cyan.opacity(0.6))
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.cyan.opacity(0.1))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.cyan.opacity(0.3), lineWidth: 1)
                            )
                    )
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                
                // 涟漪图 - 二阶效应展示
                if showRipples {
                    RipplesVisualization(ripples: intelPro.ripples)
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                        .transition(.asymmetric(
                            insertion: .move(edge: .leading).combined(with: .opacity),
                            removal: .move(edge: .trailing).combined(with: .opacity)
                        ))
                }
            }
            
            // 涟漪效应
            if let rippleEffect = news.aiAnalysis?.rippleEffect {
                RippleEffectSection(rippleEffect: rippleEffect)
                    .padding(.horizontal, 16)
            }
            
            // 未来前瞻
            if let futureOutlook = news.aiAnalysis?.futureOutlook {
                FutureOutlookSection(outlook: futureOutlook)
                    .padding(.horizontal, 16)
            }
            
            // 与我何干
            if let personalRelevance = news.aiAnalysis?.personalRelevance {
                PersonalRelevanceSection(relevance: personalRelevance)
                    .padding(.horizontal, 16)
            }
        }
    }
    
    private func importanceColor(_ importance: Int) -> Color {
        if importance >= 90 { return .red }
        if importance >= 80 { return .orange }
        if importance >= 70 { return .yellow }
        return .green
    }
}

// MARK: - 涟漪效应区域
struct RippleEffectSection: View {
    let rippleEffect: News.AIAnalysis.RippleEffect
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 5) {
                Text("🌊")
                    .font(.system(size: 14))
                Text("涟漪效应")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.cyan)
            }
            
            // 影响行业
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(rippleEffect.industries, id: \.self) { industry in
                        Text(industry)
                            .font(.system(size: 11))
                            .foregroundColor(.cyan)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.cyan.opacity(0.15))
                            .cornerRadius(6)
                    }
                }
            }
            
            Text(rippleEffect.description)
                .font(.system(size: 13))
                .foregroundColor(.white.opacity(0.8))
                .lineSpacing(4)
        }
        .padding(12)
        .background(Color.cyan.opacity(0.08))
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.cyan.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - 未来前瞻区域
struct FutureOutlookSection: View {
    let outlook: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 5) {
                Text("✨")
                    .font(.system(size: 14))
                Text("AI 未来前瞻")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.orange)
            }
            
            Text(outlook)
                .font(.system(size: 13))
                .foregroundColor(.white.opacity(0.85))
                .lineSpacing(5)
        }
        .padding(12)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color.orange.opacity(0.15), Color.yellow.opacity(0.1)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.orange.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - 与我何干区域
struct PersonalRelevanceSection: View {
    let relevance: String
    @State private var userJob: String = ""
    @State private var showAnalysis = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 5) {
                Text("💡")
                    .font(.system(size: 14))
                Text("这条新闻与我何干？")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.pink)
            }
            
            HStack(spacing: 8) {
                TextField("输入你的职业", text: $userJob)
                    .font(.system(size: 12))
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(8)
                
                Button(action: {
                    showAnalysis = true
                    let generator = UIImpactFeedbackGenerator(style: .light)
                    generator.impactOccurred()
                }) {
                    Text("分析")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.pink)
                        .cornerRadius(8)
                }
            }
            
            if showAnalysis || !userJob.isEmpty {
                Text(relevance)
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.85))
                    .lineSpacing(5)
                    .padding(.top, 4)
            }
        }
        .padding(12)
        .background(Color.pink.opacity(0.1))
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.pink.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - 讲白话模式内容
struct SimpleModeContent: View {
    let news: News
    let pointBlue: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // 简化摘要
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 5) {
                    Text("🗣️")
                        .font(.system(size: 14))
                    Text("大白话解读")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.green)
                }
                
                Text(generateSimpleSummary(news))
                    .font(.system(size: 15))
                    .foregroundColor(.white.opacity(0.9))
                    .lineSpacing(6)
            }
            .padding(14)
            .background(Color.green.opacity(0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.green.opacity(0.2), lineWidth: 1)
            )
            .padding(.horizontal, 16)
            .padding(.top, 12)
            
            // 知识小百科
            if let aiAnalysis = news.aiAnalysis {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 5) {
                        Text("💡")
                            .font(.system(size: 12))
                        Text("小知识")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.yellow)
                    }
                    
                    Text("关键词：\(aiAnalysis.keywords.prefix(3).joined(separator: "、"))")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.7))
                }
                .padding(10)
                .background(Color.yellow.opacity(0.08))
                .cornerRadius(8)
                .padding(.horizontal, 16)
            }
            
            // 来源信息
            HStack {
                Text("来源: \(news.source)")
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.5))
                
                Spacer()
                
                Text(news.publishedAt)
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.5))
            }
            .padding(.horizontal, 16)
            .padding(.top, 4)
        }
    }
    
    private func generateSimpleSummary(_ news: News) -> String {
        // 生成通俗易懂的解读
        let summary = news.summary
        if let aiSummary = news.aiAnalysis?.summary {
            return "简单来说：\(summary)\n\n点透解读：\(aiSummary)"
        }
        return "简单来说：\(summary)"
    }
}

// MARK: - 捞干货模式内容
struct ConciseModeContent: View {
    let news: News
    let pointBlue: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // 一句话总结
            HStack(alignment: .top, spacing: 8) {
                Text("💧")
                    .font(.system(size: 16))
                
                Text(generateConciseSummary(news))
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.white)
                    .lineLimit(2)
            }
            .padding(12)
            .background(pointBlue.opacity(0.15))
            .cornerRadius(10)
            .padding(.horizontal, 16)
            .padding(.top, 12)
            
            // 关键数据
            if let aiAnalysis = news.aiAnalysis {
                HStack(spacing: 16) {
                    // 重要性
                    VStack(spacing: 2) {
                        Text("\(aiAnalysis.importance)")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(importanceColor(aiAnalysis.importance))
                        Text("重要性")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    
                    Divider()
                        .frame(height: 30)
                        .background(Color.white.opacity(0.2))
                    
                    // 情绪
                    VStack(spacing: 2) {
                        Text(sentimentEmoji(aiAnalysis.sentiment))
                            .font(.system(size: 18))
                        Text("情绪")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    
                    Divider()
                        .frame(height: 30)
                        .background(Color.white.opacity(0.2))
                    
                    // 趋势
                    VStack(spacing: 2) {
                        Text(aiAnalysis.trends.first ?? "—")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.purple)
                            .lineLimit(1)
                        Text("趋势")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.top, 6)
            }
            
            // 来源和时间（极简）
            HStack {
                Text(news.source)
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.4))
                
                Text("·")
                    .foregroundColor(.white.opacity(0.3))
                
                Text(formatShortTime(news.publishedAt))
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.4))
            }
            .padding(.horizontal, 16)
            .padding(.top, 4)
        }
    }
    
    private func generateConciseSummary(_ news: News) -> String {
        // 生成15字左右的极简总结
        if let aiSummary = news.aiAnalysis?.summary {
            let words = aiSummary.prefix(30)
            return String(words) + (aiSummary.count > 30 ? "..." : "")
        }
        let words = news.summary.prefix(30)
        return String(words) + (news.summary.count > 30 ? "..." : "")
    }
    
    private func importanceColor(_ importance: Int) -> Color {
        if importance >= 90 { return .red }
        if importance >= 80 { return .orange }
        if importance >= 70 { return .yellow }
        return .green
    }
    
    private func sentimentEmoji(_ sentiment: String) -> String {
        switch sentiment.lowercased() {
        case "positive", "very_positive": return "📈"
        case "negative": return "📉"
        case "breakthrough", "excited": return "🚀"
        default: return "➡️"
        }
    }
    
    private func formatShortTime(_ time: String) -> String {
        // 简化时间显示
        if time.contains("日") {
            let parts = time.components(separatedBy: "日")
            if parts.count > 1 {
                return parts[1].trimmingCharacters(in: .whitespaces)
            }
        }
        return time
    }
}

// MARK: - 情绪标签
struct SentimentBadge: View {
    let sentiment: String
    
    var info: (String, Color) {
        switch sentiment.lowercased() {
        case "positive", "very_positive":
            return ("积极", .green)
        case "negative":
            return ("消极", .red)
        case "excited", "breakthrough":
            return ("突破", .orange)
        default:
            return ("中性", .gray)
        }
    }
    
    var body: some View {
        HStack(spacing: 5) {
            Circle()
                .fill(info.1)
                .frame(width: 6, height: 6)
            
            Text("→ \(info.0)")
                .font(.system(size: 11))
                .foregroundColor(info.1)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 5)
        .background(info.1.opacity(0.12))
        .cornerRadius(10)
    }
}

// MARK: - AI深度解读区域
struct AIInsightSection: View {
    let analysis: News.AIAnalysis
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // 标题栏
            HStack {
                HStack(spacing: 5) {
                    Text("✨")
                        .font(.system(size: 14))
                    Text("AI 深度解读")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.purple)
                }
                
                Spacer()
                
                // 毒舌极客标签
                Text("毒舌极客")
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.6))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(6)
            }
            
            // AI解读内容
            Text(analysis.summary)
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.85))
                .lineSpacing(5)
            
            // 趋势预测
            if !analysis.trends.isEmpty {
                HStack(spacing: 6) {
                    Text("📈")
                        .font(.system(size: 12))
                    
                    ForEach(analysis.trends.prefix(2), id: \.self) { trend in
                        Text(trend)
                            .font(.system(size: 11))
                            .foregroundColor(.purple.opacity(0.9))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.purple.opacity(0.15))
                            .cornerRadius(6)
                    }
                }
            }
        }
        .padding(12)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color.purple.opacity(0.2), pointBlue.opacity(0.1)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.purple.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - 操作按钮
struct ActionButton: View {
    let icon: String
    let text: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: {
            action()
            let generator = UIImpactFeedbackGenerator(style: .light)
            generator.impactOccurred()
        }) {
            HStack(spacing: 5) {
                Image(systemName: icon)
                    .font(.system(size: 14))
                Text(text)
                    .font(.system(size: 12))
            }
            .foregroundColor(color)
        }
    }
}

// MARK: - 浮动操作按钮
struct FloatingActionButton: View {
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        Button(action: {
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
        }) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [Color.purple, pointBlue]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 44, height: 44)
                    .shadow(color: Color.purple.opacity(0.4), radius: 8, x: 0, y: 4)
                
                Image(systemName: "message.fill")
                    .font(.system(size: 18))
                    .foregroundColor(.white)
            }
        }
    }
}

// MARK: - 展开的详细内容
struct ExpandedContent: View {
    let news: News
    
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Divider()
                .background(Color.white.opacity(0.1))
            
            // 完整内容
            Text(news.content)
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.8))
                .lineSpacing(6)
            
            // 时间线
            TimelineSection(news: news)
        }
    }
}

// MARK: - 时间线区域
struct TimelineSection: View {
    let news: News
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var events: [(String, String)] {
        [
            ("起源", "相关领域技术突破"),
            ("发展", "市场关注度上升"),
            ("当前", news.summary),
            ("展望", news.aiAnalysis?.summary ?? "持续关注")
        ]
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 5) {
                Text("📅")
                Text("发展时间线")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white)
            }
            
            VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(events.enumerated()), id: \.offset) { i, event in
                    HStack(alignment: .top, spacing: 10) {
                        VStack(spacing: 0) {
                            Circle()
                                .fill(i == 2 ? pointBlue : Color.white.opacity(0.3))
                                .frame(width: 10, height: 10)
                            
                            if i < events.count - 1 {
                                Rectangle()
                                    .fill(Color.white.opacity(0.15))
                                    .frame(width: 1.5, height: 30)
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 3) {
                            Text(event.0)
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(i == 2 ? pointBlue : .white.opacity(0.5))
                            
                            Text(event.1)
                                .font(.system(size: 12))
                                .foregroundColor(.white.opacity(0.7))
                                .lineLimit(2)
                        }
                        .padding(.bottom, i < events.count - 1 ? 10 : 0)
                    }
                }
            }
        }
        .padding(12)
        .background(Color.white.opacity(0.04))
        .cornerRadius(10)
    }
}

// MARK: - 涟漪图可视化（二阶效应）
struct RipplesVisualization: View {
    let ripples: [News.IntelPro.RippleEffect]
    @State private var animateCards = false
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // 标题
            HStack(spacing: 6) {
                Image(systemName: "waveform.path.ecg")
                    .font(.system(size: 14))
                    .foregroundColor(.cyan)
                
                Text("逻辑推演路径")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.cyan)
            }
            .padding(.horizontal, 4)
            
            // 垂直时间轴样式
            VStack(spacing: 0) {
                ForEach(Array(ripples.enumerated()), id: \.offset) { index, ripple in
                    RippleTimelineItem(
                        ripple: ripple,
                        index: index,
                        isLast: index == ripples.count - 1
                    )
                    .opacity(animateCards ? 1 : 0)
                    .offset(y: animateCards ? 0 : 20)
                    .animation(
                        .spring(response: 0.6, dampingFraction: 0.8)
                            .delay(Double(index) * 0.15),
                        value: animateCards
                    )
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color.cyan.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color.cyan.opacity(0.2), lineWidth: 1)
                )
        )
        .onAppear {
            animateCards = true
        }
    }
}

// MARK: - 涟漪时间轴项
struct RippleTimelineItem: View {
    let ripple: News.IntelPro.RippleEffect
    let index: Int
    let isLast: Bool
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // 左侧时间轴
            VStack(spacing: 0) {
                // 圆点
                ZStack {
                    Circle()
                        .fill(dotColor)
                        .frame(width: 20, height: 20)
                    
                    if index == 2 {
                        // 三阶发光效果
                        Circle()
                            .fill(dotColor.opacity(0.3))
                            .frame(width: 28, height: 28)
                            .blur(radius: 4)
                    }
                    
                    Circle()
                        .stroke(dotColor.opacity(0.3), lineWidth: 2)
                        .frame(width: 26, height: 26)
                }
                
                // 连接线
                if !isLast {
                    Rectangle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [dotColor.opacity(0.4), dotColor.opacity(0.1)]),
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(width: 2, height: 60)
                }
            }
            
            // 右侧内容
            VStack(alignment: .leading, spacing: 6) {
                // 标题
                Text(ripple.level)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(dotColor)
                
                // 内容
                Text(ripple.content)
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.85))
                    .lineSpacing(5)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.vertical, 4)
            .padding(.bottom, isLast ? 0 : 16)
        }
    }
    
    private var dotColor: Color {
        if ripple.level.contains("一阶") {
            return Color(hex: "67E8F9") // 淡蓝色
        } else if ripple.level.contains("二阶") {
            return Color(hex: "A78BFA") // 紫色
        } else {
            return Color(hex: "FB923C") // 橙色
        }
    }
}

// MARK: - 思维模型弹窗
struct MentalModelSheet: View {
    let mentalModel: News.IntelPro.MentalModel
    @Environment(\.dismiss) var dismiss
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        ZStack {
            // 深海蓝渐变背景
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    // 顶部装饰
                    HStack {
                        Spacer()
                        
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color.white.opacity(0.3))
                            .frame(width: 40, height: 5)
                        
                        Spacer()
                    }
                    .padding(.top, 8)
                    
                    // 标题区域
                    VStack(spacing: 12) {
                        // 图标
                        ZStack {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        gradient: Gradient(colors: [Color.purple.opacity(0.3), pointBlue.opacity(0.2)]),
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 80, height: 80)
                            
                            Image(systemName: "brain.head.profile")
                                .font(.system(size: 36))
                                .foregroundColor(.purple)
                        }
                        
                        Text("逻辑挂钩")
                            .font(.system(size: 16))
                            .foregroundColor(.white.opacity(0.6))
                        
                        Text(mentalModel.name)
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 16)
                    
                    // 分隔线
                    Rectangle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [Color.clear, Color.purple.opacity(0.3), Color.clear]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(height: 1)
                        .padding(.horizontal, 40)
                    
                    // 解释内容
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(spacing: 8) {
                            Image(systemName: "lightbulb.fill")
                                .font(.system(size: 16))
                                .foregroundColor(.yellow)
                            
                            Text("为什么适用这个模型？")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white.opacity(0.9))
                        }
                        
                        Text(mentalModel.logic)
                            .font(.system(size: 15))
                            .foregroundColor(.white.opacity(0.85))
                            .lineSpacing(6)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Material.ultraThinMaterial)
                            .opacity(0.5)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(
                                LinearGradient(
                                    gradient: Gradient(colors: [Color.purple.opacity(0.3), pointBlue.opacity(0.2)]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1
                            )
                    )
                    
                    // 关闭按钮
                    Button(action: {
                        dismiss()
                        let generator = UIImpactFeedbackGenerator(style: .light)
                        generator.impactOccurred()
                    }) {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 16))
                            
                            Text("明白了")
                                .font(.system(size: 16, weight: .semibold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [Color.purple, pointBlue]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                    }
                    .padding(.top, 8)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
    }
}

#Preview {
    NewsListView()
        .environmentObject(NewsViewModel())
        .environmentObject(FavoritesManager())
}
