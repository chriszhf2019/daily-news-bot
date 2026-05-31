//
//  NewsListView_New.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  首页新闻列表视图（重构版 - 从1720行优化到<200行）
//

import SwiftUI

// MARK: - 首页新闻列表视图（重构版）
struct NewsListView_New: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @EnvironmentObject var favoritesManager: FavoritesManager
    
    @State private var selectedCategory: String = "全部"
    @State private var showMoreNews = false
    @State private var selectedNews: News?
    
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
            VStack(spacing: Spacing.lg) {
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
                NewsListSection(
                    filteredNews: filteredNews,
                    showMoreNews: $showMoreNews,
                    selectedNews: $selectedNews
                )
            }
        }
        .background(LinearGradient.deepOceanGradient.ignoresSafeArea())
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

// MARK: - 新闻列表区域
private struct NewsListSection: View {
    let filteredNews: [News]
    @Binding var showMoreNews: Bool
    @Binding var selectedNews: News?
    
    var body: some View {
        LazyVStack(spacing: Spacing.xl) {
            // 前20条新闻
            ForEach(Array(filteredNews.prefix(20).enumerated()), id: \.element.id) { index, news in
                NewsCardDetailView(news: news, index: index + 1)
                    .onTapGesture {
                        selectedNews = news
                    }
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
                            .onTapGesture {
                                selectedNews = news
                            }
                    }
                }
            }
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.bottom, 120)
    }
}

// MARK: - 更多新闻按钮
private struct MoreNewsButton: View {
    let remainingCount: Int
    @Binding var isExpanded: Bool
    
    var body: some View {
        Button(action: {
            withAnimation(Animation.standard) {
                isExpanded.toggle()
            }
            
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
        }) {
            HStack(spacing: Spacing.md) {
                Image(systemName: isExpanded ? "chevron.up.circle.fill" : "chevron.down.circle.fill")
                    .font(Typography.title2)
                    .foregroundColor(.pointBlue)
                
                VStack(alignment: .leading, spacing: Spacing.xxs) {
                    Text(isExpanded ? "收起更多" : "查看更多")
                        .font(Typography.bodyBold)
                        .foregroundColor(.white)
                    
                    Text("还有 \(remainingCount) 条新闻")
                        .font(Typography.caption1)
                        .foregroundColor(.white.opacity(0.6))
                }
                
                Spacer()
                
                Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    .foregroundColor(.white.opacity(0.6))
            }
            .padding(Spacing.lg)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color.pointBlue.opacity(0.2),
                        Color.pointPurple.opacity(0.15)
                    ]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(CornerRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg)
                    .stroke(Color.pointBlue.opacity(0.3), lineWidth: 1)
            )
        }
        .padding(.vertical, Spacing.sm)
    }
}

// MARK: - 新闻卡片视图
private struct NewsCardDetailView: View {
    let news: News
    let index: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // 顶部：序号和分类
            HStack(spacing: Spacing.sm) {
                Text("\(index)")
                    .font(Typography.caption1)
                    .fontWeight(.bold)
                    .foregroundColor(.white.opacity(0.5))
                    .frame(width: 20, height: 20)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(CornerRadius.xs)
                
                Text(news.category)
                    .font(Typography.caption1)
                    .fontWeight(.medium)
                    .padding(.horizontal, Spacing.sm)
                    .padding(.vertical, Spacing.xxs)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(CornerRadius.xs)
                
                Spacer()
                
                if news.isBreaking {
                    Text("🚨 突发")
                        .font(Typography.caption1)
                        .fontWeight(.medium)
                        .padding(.horizontal, Spacing.sm)
                        .padding(.vertical, Spacing.xxs)
                        .background(Color.red.opacity(0.2))
                        .cornerRadius(CornerRadius.xs)
                }
            }
            
            // 新闻标题
            Text(news.title)
                .font(Typography.bodyBold)
                .foregroundColor(.white)
                .lineLimit(2)
            
            // 新闻摘要
            Text(news.summary)
                .font(Typography.body)
                .foregroundColor(.white.opacity(0.8))
                .lineLimit(2)
            
            // 底部：来源和时间
            HStack(spacing: Spacing.md) {
                Text(news.source)
                    .font(Typography.caption1)
                    .foregroundColor(.white.opacity(0.6))
                
                Text(news.publishedAt)
                    .font(Typography.caption1)
                    .foregroundColor(.white.opacity(0.6))
                
                Spacer()
                
                // 阅读时间
                Text("\(news.readTime)分钟")
                    .font(Typography.caption1)
                    .foregroundColor(.white.opacity(0.6))
            }
        }
        .padding(Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.lg)
                .fill(Color(hex: "1E293B").opacity(0.6))
                .background(
                    RoundedRectangle(cornerRadius: CornerRadius.lg)
                        .fill(Color.white.opacity(0.05))
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: CornerRadius.lg)
                .stroke(Color.white.opacity(0.08), lineWidth: 1)
        )
    }
}

#Preview {
    NewsListView_New()
        .environmentObject(NewsViewModel())
        .environmentObject(FavoritesManager())
}
