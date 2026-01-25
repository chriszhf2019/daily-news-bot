//
//  FavoritesView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-01.
//

import SwiftUI

// MARK: - 收藏视图
struct FavoritesView: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @EnvironmentObject var favoritesManager: FavoritesManager
    @State private var selectedNews: News?
    @State private var showingDetailView = false
    @State private var showingAIReview = false
    
    // MARK: - 主视图
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 内容区域
                Group {
                    if favoritesManager.favoriteNewsIDs.isEmpty {
                        emptyStateView
                    } else {
                        ScrollView {
                            VStack(spacing: 24) {
                                // 认知回响模块
                                MemoryEchoSection()
                                
                                // 数据看板
                                DataDashboardView()
                                
                                // AI一键复盘按钮
                                AIAssistantButton()
                                
                                // 知识库内容
                                knowledgeBaseView
                            }
                            .padding(16)
                        }
                    }
                }
            }
            .navigationTitle("📚 知识库")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if !favoritesManager.favoriteNewsIDs.isEmpty {
                        Menu {
                            Button(action: {
                                clearAllFavorites()
                            }) {
                                Label("清空知识库", systemImage: "trash")
                            }
                            
                            Button(action: {
                                exportFavorites()
                            }) {
                                Label("导出知识库", systemImage: "square.and.arrow.up")
                            }
                        } label: {
                            Image(systemName: "ellipsis.circle")
                        }
                    }
                }
            }
            .sheet(isPresented: $showingDetailView) {
                if let news = selectedNews {
                    NewsDetailView(news: news)
                        .environmentObject(favoritesManager)
                }
            }
            .sheet(isPresented: $showingAIReview) {
                AIReviewPopup()
            }
            .background(
                // 深海蓝渐变色
                LinearGradient(
                    gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
        }
    }
    
    // MARK: - 数据看板视图
    @ViewBuilder
    private func DataDashboardView() -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            Text("📊 数据看板")
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            // 数据卡片网格
            HStack(spacing: 16) {
                // 阅读时长卡片
                StatCard(title: "阅读时长", value: "2小时30分", icon: "clock.fill", color: Color(hex: "3B82F6"))
                
                // 今日新增收藏卡片
                StatCard(title: "今日新增收藏", value: "5条", icon: "star.fill", color: Color(hex: "F59E0B"))
                
                // 已内化知识点卡片
                StatCard(title: "已内化知识点", value: "12个", icon: "brain.fill", color: Color(hex: "10B981"))
            }
        }
        .padding(16)
        .background(
            // 玻璃拟态效果
            Color.white.opacity(0.1)
                .background(Material.thinMaterial)
        )
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
    }
    
    // MARK: - 统计卡片组件
    @ViewBuilder
    private func StatCard(title: String, value: String, icon: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            Text(value)
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.white)
            Text(title)
                .font(.caption)
                .foregroundColor(.white.opacity(0.8))
        }
        .padding(16)
        .background(
            // 玻璃拟态效果
            Color.white.opacity(0.1)
                .background(Material.thinMaterial)
        )
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
        .frame(maxWidth: .infinity)
    }
    
    // MARK: - AI一键复盘按钮
    @ViewBuilder
    private func AIAssistantButton() -> some View {
        Button(action: {
            performAIReview()
        }) {
            HStack(spacing: 12) {
                Image(systemName: "brain.head.profile")
                    .font(.title2)
                    .foregroundColor(.white)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("🤖 AI 一键复盘")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Text("基于收藏内容生成个人化研究报告")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.9))
                }
                
                Spacer()
                
                Image(systemName: "arrow.forward")
                    .foregroundColor(.white)
            }
            .padding(16)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color(hex: "3B82F6"), Color(hex: "8B5CF6")]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(16)
            .shadow(color: Color(hex: "3B82F6").opacity(0.4), radius: 8, x: 0, y: 4)
            .animation(.easeInOut(duration: 0.3), value: UUID())
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    // MARK: - 空状态视图
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "books.vertical.fill")
                .font(.system(size: 48))
                .foregroundColor(.white.opacity(0.7))
            
            Text("📚 知识库为空")
                .font(.title2)
                .fontWeight(.medium)
                .foregroundColor(.white)
            
            Text("在浏览新闻时点击❤️按钮，将内容添加到知识库")
                .font(.body)
                .foregroundColor(.white.opacity(0.8))
                .multilineTextAlignment(.center)
            
            Button(action: {
                // 跳转到首页
            }) {
                Label("去浏览新闻", systemImage: "newspaper")
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(LinearGradient(
                        gradient: Gradient(colors: [Color(hex: "3B82F6"), Color(hex: "8B5CF6")]),
                        startPoint: .leading,
                        endPoint: .trailing
                    ))
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            // 深海蓝渐变色
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }
    
    // MARK: - 知识库视图
    private var knowledgeBaseView: some View {
        VStack(spacing: 24) {
            // 结构化归档 - 按AI自动分类
            ForEach(knowledgeCategories, id: \.self) { category in
                KnowledgeCategorySection(category: category)
            }
        }
    }
    
    // MARK: - 知识分类
    private var knowledgeCategories: [String] {
        // AI自动分类：技术储备、市场机会、政策预警
        return ["技术储备", "市场机会", "政策预警"]
    }
    
    // MARK: - 知识分类区域
    @ViewBuilder
    private func KnowledgeCategorySection(category: String) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // 分类标题
            HStack(spacing: 8) {
                Text(getCategoryIcon(category))
                Text(category)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Spacer()
                Text("\(getNewsCountForCategory(category))")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Color.white.opacity(0.2))
                    .cornerRadius(12)
            }
            
            // 分类内容 - 数字笔记本样式
            VStack(spacing: 12) {
                ForEach(getNewsForCategory(category), id: \.id) { news in
                    KnowledgeItem(news: news)
                }
            }
        }
    }
    
    // MARK: - 分类图标映射
    private func getCategoryIcon(_ category: String) -> String {
        switch category {
        case "技术储备":
            return "🔬"
        case "市场机会":
            return "📈"
        case "政策预警":
            return "⚠️"
        default:
            return "📌"
        }
    }
    
    // MARK: - 获取分类新闻数量
    private func getNewsCountForCategory(_ category: String) -> Int {
        // 根据AI分类逻辑返回数量，这里简化处理
        let count = favoriteNews.count
        return count > 0 ? Int.random(in: 1...count) : 0
    }
    
    // MARK: - 获取分类新闻
    private func getNewsForCategory(_ category: String) -> [News] {
        // 根据AI分类逻辑返回新闻，这里简化处理
        return favoriteNews
    }
    
    // MARK: - 知识条目视图
    @ViewBuilder
    private func KnowledgeItem(news: News) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // 条目头部：标题和来源
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Text("📌")
                    Text(news.title)
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                
                HStack(spacing: 16) {
                    Text(news.source)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    Text(formatPublishedTime(news.publishedAt))
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                }
            }
            
            // 新闻内容摘要
            Text(news.summary)
                .font(.body)
                .foregroundColor(.white.opacity(0.9))
                .lineSpacing(6)
            
            // AI分析标签
            if let aiAnalysis = news.aiAnalysis {
                HStack(spacing: 8) {
                    Text("✨ AI 分析")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.purple)
                    Text(aiAnalysis.summary)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                }
                .padding(8)
                .background(Color.purple.opacity(0.2))
                .cornerRadius(12)
            }
            
            // 笔记整合区域
            NoteIntegrationView(news: news)
            
            // 操作按钮
            HStack(spacing: 12) {
                Button(action: {
                    favoritesManager.toggleFavorite(newsID: news.id)
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "heart.fill")
                            .foregroundColor(.red)
                        Text("取消收藏")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
                .buttonStyle(PlainButtonStyle())
                .onTapGesture {
                    let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedbackgenerator.impactOccurred()
                }
                
                Button(action: {
                    shareNews(news)
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "square.and.arrow.up")
                            .foregroundColor(.white.opacity(0.7))
                        Text("分享")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
                .buttonStyle(PlainButtonStyle())
                .onTapGesture {
                    let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedbackgenerator.impactOccurred()
                }
                
                Spacer()
                
                Button(action: {
                    selectedNews = news
                    showingDetailView = true
                }) {
                    HStack(spacing: 4) {
                        Text("查看详情")
                            .font(.caption)
                            .foregroundColor(Color(hex: "3B82F6"))
                        Image(systemName: "arrow.forward")
                            .foregroundColor(Color(hex: "3B82F6"))
                    }
                }
                .buttonStyle(PlainButtonStyle())
                .onTapGesture {
                    let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedbackgenerator.impactOccurred()
                }
            }
        }
        .padding(16)
        .background(
            // 玻璃拟态效果
            Color.white.opacity(0.1)
                .background(Material.thinMaterial)
        )
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.white.opacity(0.2), lineWidth: 1)
        )
    }
    
    // MARK: - 笔记整合视图
    @ViewBuilder
    private func NoteIntegrationView(news: News) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "pencil.and.outline")
                    .foregroundColor(.yellow)
                Text("笔记")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                Spacer()
                Button(action: {
                    addNoteToNews(news)
                }) {
                    Text("添加笔记")
                        .font(.caption)
                        .foregroundColor(.yellow)
                }
            }
            
            // 模拟笔记内容 - 黄色便签质感
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Circle()
                        .fill(Color.black.opacity(0.3))
                        .frame(width: 4, height: 4)
                    Text("这是一个示例笔记，与新闻内容完美融合")
                        .font(.body)
                        .foregroundColor(.black)
                        .lineSpacing(6)
                }
                
                HStack(spacing: 8) {
                    Circle()
                        .fill(Color.black.opacity(0.3))
                        .frame(width: 4, height: 4)
                    Text("可以添加自己的见解和分析")
                        .font(.body)
                        .foregroundColor(.black)
                        .lineSpacing(6)
                }
            }
            .padding(16)
            .background(
                // 黄色便签质感
                Color(hex: "FEF3C7")
                    .shadow(color: Color.black.opacity(0.1), radius: 4, x: 2, y: 2)
            )
            .cornerRadius(8)
            // 添加便签效果的轻微旋转
            .rotationEffect(.degrees(-0.5))
        }
    }
    
    // MARK: - 计算属性：收藏的新闻
    private var favoriteNews: [News] {
        favoritesManager.favoriteNewsIDs.compactMap { newsID in
            viewModel.news.first { $0.id == newsID }
        }
    }
    
    // MARK: - 辅助方法
    private func performAIReview() {
        // 调用AI一键复盘功能
        print("🤖 开始AI一键复盘...")
        // 显示AI复盘弹窗
        showingAIReview = true
    }
    
    // MARK: - AI复盘弹窗视图
    @ViewBuilder
    private func AIReviewPopup() -> some View {
        VStack(spacing: 24) {
            // 弹窗标题
            HStack(spacing: 8) {
                Text("🤖 AI 复盘报告")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Spacer()
                Button(action: {
                    showingAIReview = false
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.white.opacity(0.7))
                        .font(.title2)
                }
                .buttonStyle(PlainButtonStyle())
            }
            
            // 报告内容
            ScrollView {
                VStack(spacing: 16) {
                    // 报告摘要
                    VStack(alignment: .leading, spacing: 8) {
                        Text("📋 报告摘要")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        Text("基于您的收藏内容，AI生成了以下个性化研究报告。该报告涵盖了您关注的主要领域和知识点，帮助您更好地理解和内化已收藏的信息。")
                            .font(.body)
                            .foregroundColor(.white.opacity(0.9))
                            .lineSpacing(6)
                    }
                    
                    // 知识分类统计
                    VStack(alignment: .leading, spacing: 12) {
                        Text("📊 知识分类统计")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        HStack(spacing: 16) {
                            StatCard(title: "技术储备", value: "\(favoriteNews.count) 条", icon: "🔬", color: Color(hex: "3B82F6"))
                            StatCard(title: "市场机会", value: "\(favoriteNews.count) 条", icon: "📈", color: Color(hex: "F59E0B"))
                            StatCard(title: "政策预警", value: "\(favoriteNews.count) 条", icon: "⚠️", color: Color(hex: "EF4444"))
                        }
                    }
                    
                    // 核心知识点
                    VStack(alignment: .leading, spacing: 12) {
                        Text("💡 核心知识点")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        VStack(spacing: 12) {
                            ForEach(0..<3, id: \.self) {
                                index in
                                HStack(spacing: 12) {
                                    Circle()
                                        .fill(Color(hex: "3B82F6"))
                                        .frame(width: 8, height: 8)
                                    Text("核心知识点 \(index + 1)：基于您的收藏内容，AI提取的重要知识点描述")
                                        .font(.body)
                                        .foregroundColor(.white.opacity(0.9))
                                        .lineSpacing(6)
                                }
                            }
                        }
                    }
                    
                    // 建议行动
                    VStack(alignment: .leading, spacing: 12) {
                        Text("📌 建议行动")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        VStack(spacing: 12) {
                            ForEach(0..<2, id: \.self) {
                                index in
                                HStack(spacing: 12) {
                                    Image(systemName: "lightbulb.fill")
                                        .foregroundColor(Color(hex: "F59E0B"))
                                    Text("建议行动 \(index + 1)：基于您的收藏内容，AI建议您可以采取的下一步行动")
                                        .font(.body)
                                        .foregroundColor(.white.opacity(0.9))
                                        .lineSpacing(6)
                                }
                            }
                        }
                    }
                }
            }
            
            // 底部按钮
            Button(action: {
                showingAIReview = false
            }) {
                Text("完成")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(16)
                    .frame(maxWidth: .infinity)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [Color(hex: "3B82F6"), Color(hex: "8B5CF6")]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding(24)
        .background(
            // 玻璃拟态效果
            Color(hex: "0F172A").opacity(0.9)
                .background(Material.thickMaterial)
        )
        .cornerRadius(24)
        .padding(24)
        .background(Color.black.opacity(0.5))
    }
    
    private func addNoteToNews(_ news: News) {
        // 添加笔记到新闻
        print("📝 添加笔记到新闻：\(news.title)")
    }
    
    private func formatPublishedTime(_ time: String) -> String {
        // 格式化发布时间
        return time
    }
    
    private func shareNews(_ news: News) {
        // 获取当前的UIViewController
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let viewController = windowScene.windows.first?.rootViewController {
            viewModel.shareNews(news, fromViewController: viewController)
        }
        
        print("分享新闻: \(news.title)")
    }
    
    private func clearAllFavorites() {
        favoritesManager.clearAllFavorites()
    }
    
    private func exportFavorites() {
        let newsCount = favoriteNews.count
        print("导出 \(newsCount) 条知识库内容")
        
        // 这里可以实现导出功能
        let alert = UIAlertController(
            title: "导出成功",
            message: "已导出 \(newsCount) 条知识库内容",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "确定", style: .default))
        // 需要在实际使用中通过UIViewController显示
    }
    
    // MARK: - 认知回响模块（优化版）
    @ViewBuilder
    private func MemoryEchoSection() -> some View {
        VStack(spacing: 20) {
            // 模块标题
            HStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.purple.opacity(0.2))
                        .frame(width: 36, height: 36)
                        .blur(radius: 6)
                    
                    Text("🧠")
                        .font(.system(size: 20))
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("认知回响")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Memory Echo · 间隔重复学习")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.6))
                        .tracking(0.5)
                }
                
                Spacer()
            }
            
            // 脑力资产值看板（优化版）
            BrainAssetDashboard()
            
            // AI闪卡（优化版）
            AIFlashCardsEnhanced()
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(hex: "1E293B").opacity(0.8),
                            Color(hex: "334155").opacity(0.6)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .background(Material.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.purple.opacity(0.3),
                            Color.pink.opacity(0.2)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .shadow(color: Color.purple.opacity(0.2), radius: 15, x: 0, y: 8)
    }
    
    // MARK: - 脑力资产值看板（优化版）
    @ViewBuilder
    private func BrainAssetDashboard() -> some View {
        VStack(spacing: 16) {
            // 顶部：脑力资产值和进度
            HStack(spacing: 16) {
                // 左侧：大脑图标 + 数值
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(
                                RadialGradient(
                                    gradient: Gradient(colors: [
                                        Color.yellow.opacity(0.6),
                                        Color.yellow.opacity(0.3)
                                    ]),
                                    center: .center,
                                    startRadius: 0,
                                    endRadius: 30
                                )
                            )
                            .frame(width: 60, height: 60)
                        
                        Text("🧠")
                            .font(.system(size: 32))
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("脑力资产值")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.7))
                        
                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text("\(viewModel.brainAssetValue)")
                                .font(.system(size: 32, weight: .bold, design: .monospaced))
                                .foregroundColor(.yellow)
                                .shadow(color: .yellow, radius: 8, x: 0, y: 0)
                            
                            Text("pts")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.yellow.opacity(0.8))
                        }
                    }
                }
                
                Spacer()
                
                // 右侧：今日进度
                VStack(alignment: .trailing, spacing: 4) {
                    Text("今日进度")
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.7))
                    
                    HStack(spacing: 4) {
                        ForEach(0..<3, id: \.self) { index in
                            Circle()
                                .fill(index < viewModel.completedCardsToday ? Color.green : Color.white.opacity(0.3))
                                .frame(width: 12, height: 12)
                                .shadow(color: index < viewModel.completedCardsToday ? .green : .clear, radius: 4, x: 0, y: 0)
                        }
                    }
                    
                    Text("\(viewModel.completedCardsToday)/3 已完成")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            
            // 进度条
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("你已内化了 \(internalizationPercentage)% 的收藏情报")
                        .font(.system(size: 13))
                        .foregroundColor(.white.opacity(0.9))
                    
                    Spacer()
                    
                    Text("\(viewModel.masteredCards)/\(totalCards)")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundColor(.white.opacity(0.7))
                }
                
                // 渐变进度条
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        // 背景
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.white.opacity(0.1))
                            .frame(height: 12)
                        
                        // 进度
                        RoundedRectangle(cornerRadius: 8)
                            .fill(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color(hex: "3B82F6"),
                                        Color(hex: "8B5CF6"),
                                        Color(hex: "EC4899")
                                    ]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: geometry.size.width * CGFloat(internalizationPercentage) / 100.0, height: 12)
                            .shadow(color: Color(hex: "8B5CF6").opacity(0.5), radius: 6, x: 0, y: 0)
                    }
                }
                .frame(height: 12)
            }
            
            // 完成勋章动画
            if viewModel.completedCardsToday >= 3 {
                CompletionBadge()
                    .transition(.scale.combined(with: .opacity))
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.yellow.opacity(0.2), lineWidth: 1)
                )
        )
    }
    
    // 计算内化百分比
    private var internalizationPercentage: Int {
        guard totalCards > 0 else { return 0 }
        return min(Int(Double(viewModel.masteredCards) / Double(totalCards) * 100), 100)
    }
    
    // 总卡片数
    private var totalCards: Int {
        return favoriteNews.count
    }
    
    // MARK: - 完成勋章
    @ViewBuilder
    private func CompletionBadge() -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(
                        RadialGradient(
                            gradient: Gradient(colors: [
                                Color.yellow.opacity(0.8),
                                Color.orange.opacity(0.6)
                            ]),
                            center: .center,
                            startRadius: 0,
                            endRadius: 25
                        )
                    )
                    .frame(width: 50, height: 50)
                
                Text("🏆")
                    .font(.system(size: 28))
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text("今日内化完成！")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.yellow)
                
                Text("明天继续保持，让知识真正属于你")
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.8))
            }
            
            Spacer()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.yellow.opacity(0.2),
                            Color.orange.opacity(0.1)
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.yellow.opacity(0.3), lineWidth: 1)
        )
    }
    
    // MARK: - AI闪卡（优化版）
    @ViewBuilder
    private func AIFlashCardsEnhanced() -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // 闪卡标题
            HStack(spacing: 8) {
                Image(systemName: "sparkles")
                    .foregroundColor(.purple)
                    .shadow(color: .purple, radius: 4, x: 0, y: 0)
                
                Text("AI 闪卡挑战")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                
                Text("3张/天")
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.purple.opacity(0.3))
                    .cornerRadius(10)
                
                Spacer()
                
                // 今日完成状态
                HStack(spacing: 4) {
                    Image(systemName: viewModel.completedCardsToday >= 3 ? "checkmark.circle.fill" : "clock.fill")
                        .font(.system(size: 12))
                        .foregroundColor(viewModel.completedCardsToday >= 3 ? .green : .orange)
                    
                    Text(viewModel.completedCardsToday >= 3 ? "已完成" : "进行中")
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.8))
                }
            }
            
            // 闪卡描述
            Text("基于间隔重复原理，从3天前、7天前收藏的内容生成深度问题")
                .font(.system(size: 12))
                .foregroundColor(.white.opacity(0.7))
                .lineSpacing(4)
            
            // 闪卡列表（水平滚动）
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 20) {
                    // 生成3张闪卡
                    ForEach(Array(generateFlashCardData().enumerated()), id: \.offset) { index, cardData in
                        EnhancedFlashCard(
                            cardData: cardData,
                            cardIndex: index,
                            onMastered: {
                                handleCardMastered(cardData)
                            },
                            onSkip: {
                                handleCardSkipped(cardData)
                            }
                        )
                    }
                }
                .padding(.vertical, 8)
            }
        }
    }
    
    // MARK: - 处理卡片掌握
    private func handleCardMastered(_ cardData: FlashCardData) {
        // 增加脑力资产值
        viewModel.brainAssetValue += 10
        viewModel.masteredCards += 1
        viewModel.completedCardsToday += 1
        
        // 保存到 UserDefaults
        UserDefaults.standard.set(viewModel.brainAssetValue, forKey: "brainAssetValue")
        UserDefaults.standard.set(viewModel.masteredCards, forKey: "masteredCards")
        UserDefaults.standard.set(viewModel.completedCardsToday, forKey: "completedCardsToday")
        UserDefaults.standard.set(Date(), forKey: "lastCompletionDate")
        
        // 触觉反馈
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
        
        print("✅ 已掌握卡片：\(cardData.question)")
        print("🧠 脑力资产值：\(viewModel.brainAssetValue)")
        print("📊 已掌握卡片数：\(viewModel.masteredCards)")
    }
    
    // MARK: - 处理卡片跳过
    private func handleCardSkipped(_ cardData: FlashCardData) {
        // 记录跳过的卡片，用于后续分析用户薄弱环节
        print("⏭️ 跳过卡片：\(cardData.question)")
        
        // 触觉反馈
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }
    
    // MARK: - 生成模拟闪卡数据
    private func generateFlashCardData() -> [FlashCardData] {
        var flashCards: [FlashCardData] = []
        
        // 获取收藏的新闻
        let favorited = favoriteNews
        
        // 从收藏的新闻中提取 memory_quiz
        for news in favorited.prefix(3) {
            if let intelPro = news.intelPro {
                let memoryQuiz = intelPro.memoryQuiz
                flashCards.append(FlashCardData(
                    question: memoryQuiz.question,
                    answer: memoryQuiz.answer,
                    newsTitle: news.title,
                    newsId: news.id,
                    date: calculateDaysAgo(news.publishedAt)
                ))
            }
        }
        
        // 如果没有足够的闪卡，使用模拟数据补充
        if flashCards.count < 3 {
            let mockData = [
                FlashCardData(
                    question: "GPT-5的参数规模是多少？支持多长的上下文？",
                    answer: "1.76万亿参数，支持200万token上下文",
                    newsTitle: "OpenAI发布GPT-5模型",
                    newsId: "1",
                    date: "3天前"
                ),
                FlashCardData(
                    question: "特斯拉Robotaxi在多少个城市运营？费用是传统出租车的多少？",
                    answer: "50个城市，费用仅为传统出租车的30%",
                    newsTitle: "特斯拉Robotaxi全球运营",
                    newsId: "2",
                    date: "7天前"
                ),
                FlashCardData(
                    question: "比亚迪固态电池的能量密度是多少？充电15分钟可行驶多远？",
                    answer: "能量密度550Wh/kg，充电15分钟可行驶500公里",
                    newsTitle: "比亚迪固态电池量产",
                    newsId: "3",
                    date: "3天前"
                )
            ]
            
            for i in flashCards.count..<3 {
                if i < mockData.count {
                    flashCards.append(mockData[i])
                }
            }
        }
        
        return Array(flashCards.prefix(3))
    }
    
    private func calculateDaysAgo(_ publishedAt: String) -> String {
        // 简化处理，实际应该计算真实的天数差
        return "3天前"
    }
}

// MARK: - 闪卡数据模型
struct FlashCardData {
    let question: String
    let answer: String
    let newsTitle: String
    let newsId: String
    let date: String
}

// MARK: - 增强版闪卡组件
struct EnhancedFlashCard: View {
    let cardData: FlashCardData
    let cardIndex: Int
    let onMastered: () -> Void
    let onSkip: () -> Void
    @State private var isFlipped = false
    @State private var offset: CGSize = .zero
    @State private var isDragging = false
    
    var body: some View {
        ZStack {
            // 背面 - 答案（先渲染，在下层）
            FlashCardBackFace(cardData: cardData, onMastered: onMastered, onSkip: onSkip)
                .rotation3DEffect(
                    .degrees(isFlipped ? 0 : 180),
                    axis: (x: 0, y: 1, z: 0),
                    anchor: .center,
                    perspective: 0.5
                )
                .opacity(isFlipped ? 1 : 0)
            
            // 正面 - 问题（后渲染，在上层）
            FlashCardFrontFace(cardData: cardData, cardIndex: cardIndex)
                .rotation3DEffect(
                    .degrees(isFlipped ? 180 : 0),
                    axis: (x: 0, y: 1, z: 0),
                    anchor: .center,
                    perspective: 0.5
                )
                .opacity(isFlipped ? 0 : 1)
        }
        .frame(width: 300, height: 220)
        .offset(offset)
        .rotationEffect(.degrees(Double(offset.width / 20)))
        .gesture(
            DragGesture()
                .onChanged { gesture in
                    isDragging = true
                    offset = gesture.translation
                }
                .onEnded { _ in
                    isDragging = false
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                        offset = .zero
                    }
                }
        )
        .onTapGesture {
            // 翻转卡片
            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                isFlipped.toggle()
            }
            
            // 触觉反馈
            let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
            impactFeedbackgenerator.impactOccurred()
        }
    }
}

// MARK: - 闪卡正面
struct FlashCardFrontFace: View {
    let cardData: FlashCardData
    let cardIndex: Int
    
    var body: some View {
        VStack(spacing: 16) {
            // 顶部：来源信息
            HStack(spacing: 8) {
                Image(systemName: "clock.arrow.circlepath")
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.7))
                
                Text("来自 \(cardData.date) 的挑战")
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.8))
                
                Spacer()
                
                // 卡片序号
                Text("#\(cardIndex + 1)")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.6))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(8)
            }
            
            // 中间：问题
            VStack(spacing: 12) {
                Text("❓")
                    .font(.system(size: 32))
                
                Text(cardData.question)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.white)
                    .lineSpacing(6)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            Spacer()
            
            // 底部：提示
            VStack(spacing: 8) {
                HStack(spacing: 6) {
                    Image(systemName: "hand.tap.fill")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.5))
                    
                    Text("点击翻面查看答案")
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.6))
                }
                
                // 新闻来源
                Text("📰 \(cardData.newsTitle)")
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.5))
                    .lineLimit(1)
            }
        }
        .padding(20)
        .frame(width: 300, height: 220)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(hex: "3B82F6"),
                            Color(hex: "2563EB")
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .shadow(color: Color(hex: "3B82F6").opacity(0.4), radius: 15, x: 0, y: 8)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.white.opacity(0.3),
                            Color.white.opacity(0.1)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
    }
}

// MARK: - 闪卡背面
struct FlashCardBackFace: View {
    let cardData: FlashCardData
    let onMastered: () -> Void
    let onSkip: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            // 顶部：答案标识
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.green)
                    
                    Text("答案")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.green)
                }
                
                Spacer()
            }
            
            // 中间：答案内容
            VStack(spacing: 12) {
                Text("✅")
                    .font(.system(size: 28))
                
                Text(cardData.answer)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.white)
                    .lineSpacing(7)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            Spacer()
            
            // 底部：操作按钮
            HStack(spacing: 12) {
                // 再想想按钮
                Button(action: {
                    onSkip()
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 12))
                        Text("再想想")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .foregroundColor(.white.opacity(0.9))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.white.opacity(0.15))
                    )
                }
                .buttonStyle(PlainButtonStyle())
                
                // 已掌握按钮
                Button(action: {
                    onMastered()
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 12))
                        Text("已掌握 +10")
                            .font(.system(size: 13, weight: .bold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color.green,
                                        Color.green.opacity(0.8)
                                    ]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .shadow(color: .green.opacity(0.4), radius: 8, x: 0, y: 4)
                    )
                }
                .buttonStyle(PlainButtonStyle())
            }
        }
        .padding(20)
        .frame(width: 300, height: 220)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(hex: "10B981"),
                            Color(hex: "059669")
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .shadow(color: Color.green.opacity(0.4), radius: 15, x: 0, y: 8)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.white.opacity(0.3),
                            Color.white.opacity(0.1)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
    }
}

// MARK: - 旧版闪卡组件（保留兼容）
struct FlashCard: View {
    let cardData: FlashCardData
    let onMastered: () -> Void
    @State private var isFlipped = false
    
    var body: some View {
        VStack(spacing: 12) {
            // 新闻来源信息
            HStack(spacing: 8) {
                Text(cardData.date)
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.7))
                Text(cardData.newsTitle)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
            }
            .padding(.horizontal, 8)
            
            // 闪卡主体
            ZStack {
                // 正面 - 问题
                FlashCardFace(
                    content: {
                        VStack(spacing: 12) {
                            Text("❓ 问题")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.purple)
                            Text(cardData.question)
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundColor(.white)
                                .lineSpacing(6)
                                .multilineTextAlignment(.center)
                            
                            Spacer()
                            
                            HStack {
                                Spacer()
                                Text("点击翻面")
                                    .font(.caption2)
                                    .foregroundColor(.white.opacity(0.6))
                                Image(systemName: "arrow.right.arrow.left")
                                    .font(.caption2)
                                    .foregroundColor(.white.opacity(0.6))
                                Spacer()
                            }
                        }
                    },
                    backgroundColor: LinearGradient(
                        gradient: Gradient(colors: [Color(hex: "3B82F6"), Color(hex: "2563EB")]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    isFlipped: isFlipped
                )
                
                // 背面 - 答案
                FlashCardFace(
                    content: {
                        VStack(spacing: 12) {
                            Text("✅ 答案")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.green)
                            Text(cardData.answer)
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundColor(.white)
                                .lineSpacing(6)
                                .multilineTextAlignment(.center)
                            
                            Spacer()
                            
                            Button(action: {
                                // 标记为已完成，增加脑力资产值
                                onMastered()
                                
                                // 翻转回正面
                                withAnimation(.easeInOut(duration: 0.5)) {
                                    isFlipped = false
                                }
                            }) {
                                HStack(spacing: 6) {
                                    Image(systemName: "checkmark.circle.fill")
                                    Text("已掌握")
                                }
                                .font(.caption2)
                                .foregroundColor(.green)
                                .padding(8)
                                .background(
                                    Color.green.opacity(0.2)
                                )
                                .cornerRadius(12)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    },
                    backgroundColor: LinearGradient(
                        gradient: Gradient(colors: [Color(hex: "10B981"), Color(hex: "059669")]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    isFlipped: !isFlipped
                )
            }
            .frame(width: 280, height: 180)
            .onTapGesture {
                // 翻转卡片
                withAnimation(.easeInOut(duration: 0.5)) {
                    isFlipped.toggle()
                }
                
                // 触觉反馈
                let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                impactFeedbackgenerator.impactOccurred()
            }
        }
    }
}

// MARK: - 闪卡面
struct FlashCardFace<Content: View>: View {
    let content: () -> Content
    let backgroundColor: LinearGradient
    let isFlipped: Bool
    
    var body: some View {
        content()
            .padding(20)
            .frame(width: 280, height: 200)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(backgroundColor)
                    .shadow(color: Color.black.opacity(0.3), radius: 12, x: 0, y: 6)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
            .rotation3DEffect(
                .degrees(isFlipped ? 180 : 0),
                axis: (x: 0, y: 1, z: 0),
                anchor: .center,
                anchorZ: 0.0,
                perspective: 0.5
            )
            .opacity(isFlipped ? 1 : 0)
    }
}

// MARK: - 移除不需要的NewsRowView结构体
// 由于我们已经替换了收藏列表视图，不再需要原来的NewsRowView
// struct NewsRowView: View {
//     let news: News
//     let isFavorited: Bool
//     let onFavoriteToggle: () -> Void
//     let onShare: () -> Void
//     let onTap: () -> Void
//     
//     var body: some View {
//         Button(action: onTap) {
//             VStack(alignment: .leading, spacing: 8) {
//                 // 分类标签
//                 Text(news.category)
//                     .font(.caption)
//                     .foregroundColor(.blue)
//                     .padding(.horizontal, 8)
//                     .padding(.vertical, 4)
//                     .background(Color.blue.opacity(0.1))
//                     .cornerRadius(8)
//                 
//                 // 标题
//                 Text(news.title)
//                     .font(.headline)
//                     .lineLimit(2)
//                 
//                 // 摘要
//                 Text(news.summary)
//                     .font(.subheadline)
//                     .foregroundColor(.secondary)
//                     .lineLimit(2)
//                 
//                 // 底部信息
//                 HStack {
//                     Text(news.source)
//                         .font(.caption)
//                         .foregroundColor(.secondary)
//                     
//                     Spacer()
//                     
//                     // 收藏按钮
//                     Button(action: onFavoriteToggle) {
//                         Image(systemName: isFavorited ? "heart.fill" : "heart")
//                             .foregroundColor(isFavorited ? .red : .secondary)
//                     }
//                     .buttonStyle(PlainButtonStyle())
//                     
//                     // 分享按钮
//                     Button(action: onShare) {
//                         Image(systemName: "square.and.arrow.up")
//                             .foregroundColor(.secondary)
//                     }
//                     .buttonStyle(PlainButtonStyle())
//                 }
//             }
//             .padding(.vertical, 8)
//         }
//         .buttonStyle(PlainButtonStyle())
//     }
// }



#Preview {
    FavoritesView()
        .environmentObject(FavoritesManager())
}
