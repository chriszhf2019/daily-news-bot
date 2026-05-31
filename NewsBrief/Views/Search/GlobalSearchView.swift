//
//  GlobalSearchView.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  全局搜索视图
//

import SwiftUI

// MARK: - 全局搜索视图
struct GlobalSearchView: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var searchText = ""
    @State private var searchResults: [News] = []
    @State private var isSearching = false
    @State private var searchHistory: [String] = []
    @State private var showHistory = true
    
    var body: some View {
        NavigationView {
            ZStack {
                LinearGradient.deepOceanGradient
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // 搜索栏
                    SearchBar(
                        searchText: $searchText,
                        isSearching: $isSearching,
                        onSearch: performSearch,
                        onClear: clearSearch
                    )
                    .padding(.horizontal, Spacing.lg)
                    .padding(.top, Spacing.md)
                    
                    // 内容区域
                    if searchText.isEmpty {
                        // 搜索历史和热门搜索
                        SearchSuggestionsView(
                            searchHistory: searchHistory,
                            onSelectHistory: { keyword in
                                searchText = keyword
                                performSearch()
                            },
                            onClearHistory: clearHistory
                        )
                    } else if isSearching {
                        // 搜索中
                        LoadingView()
                    } else if searchResults.isEmpty {
                        // 无结果
                        EmptySearchResultView(searchText: searchText)
                    } else {
                        // 搜索结果
                        SearchResultsView(
                            results: searchResults,
                            searchText: searchText
                        )
                    }
                }
            }
            .navigationTitle("搜索")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("取消") {
                        dismiss()
                    }
                    .foregroundColor(.pointBlue)
                }
            }
        }
        .onAppear {
            loadSearchHistory()
        }
    }
    
    // MARK: - 执行搜索
    private func performSearch() {
        guard !searchText.isEmpty else { return }
        
        isSearching = true
        showHistory = false
        
        // 添加到搜索历史
        addToSearchHistory(searchText)
        
        Task {
            do {
                let results = try await viewModel.newsServicePublic.searchNews(searchText)
                await MainActor.run {
                    searchResults = results
                    isSearching = false
                }
            } catch {
                await MainActor.run {
                    searchResults = []
                    isSearching = false
                }
            }
        }
    }
    
    // MARK: - 清除搜索
    private func clearSearch() {
        searchText = ""
        searchResults = []
        showHistory = true
    }
    
    // MARK: - 加载搜索历史
    private func loadSearchHistory() {
        if let history = UserDefaults.standard.stringArray(forKey: "search_history") {
            searchHistory = history
        }
    }
    
    // MARK: - 添加到搜索历史
    private func addToSearchHistory(_ keyword: String) {
        // 去重
        searchHistory.removeAll { $0 == keyword }
        // 添加到开头
        searchHistory.insert(keyword, at: 0)
        // 最多保留20条
        if searchHistory.count > 20 {
            searchHistory = Array(searchHistory.prefix(20))
        }
        // 保存
        UserDefaults.standard.set(searchHistory, forKey: "search_history")
    }
    
    // MARK: - 清除历史
    private func clearHistory() {
        searchHistory.removeAll()
        UserDefaults.standard.removeObject(forKey: "search_history")
    }
}

// MARK: - 搜索栏
struct SearchBar: View {
    @Binding var searchText: String
    @Binding var isSearching: Bool
    let onSearch: () -> Void
    let onClear: () -> Void
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        HStack(spacing: Spacing.md) {
            // 搜索输入框
            HStack(spacing: Spacing.sm) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.white.opacity(0.5))
                    .font(.system(size: IconSize.md))
                
                TextField("搜索新闻、关键词...", text: $searchText)
                    .foregroundColor(.white)
                    .focused($isFocused)
                    .submitLabel(.search)
                    .onSubmit {
                        onSearch()
                    }
                
                if !searchText.isEmpty {
                    Button(action: onClear) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.white.opacity(0.5))
                            .font(.system(size: IconSize.md))
                    }
                }
            }
            .padding(.horizontal, Spacing.lg)
            .padding(.vertical, Spacing.md)
            .background(Color.white.opacity(0.1))
            .cornerRadius(CornerRadius.md)
            
            // 搜索按钮
            if !searchText.isEmpty {
                Button(action: onSearch) {
                    Text("搜索")
                        .font(Typography.bodyBold)
                        .foregroundColor(.white)
                        .padding(.horizontal, Spacing.lg)
                        .padding(.vertical, Spacing.md)
                        .background(Color.pointBlue)
                        .cornerRadius(CornerRadius.md)
                }
            }
        }
        .onAppear {
            isFocused = true
        }
    }
}

// MARK: - 搜索建议视图
struct SearchSuggestionsView: View {
    let searchHistory: [String]
    let onSelectHistory: (String) -> Void
    let onClearHistory: () -> Void
    
    // 热门搜索
    private let hotSearches = ["AI", "芯片", "新能源", "量子计算", "自动驾驶", "元宇宙"]
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.xl) {
                // 搜索历史
                if !searchHistory.isEmpty {
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        HStack {
                            Text("搜索历史")
                                .font(Typography.bodyBold)
                                .foregroundColor(.white)
                            
                            Spacer()
                            
                            Button(action: onClearHistory) {
                                HStack(spacing: Spacing.xs) {
                                    Image(systemName: "trash")
                                        .font(.system(size: IconSize.xs))
                                    Text("清空")
                                        .font(Typography.caption1)
                                }
                                .foregroundColor(.white.opacity(0.6))
                            }
                        }
                        
                        FlowLayout(spacing: Spacing.sm) {
                            ForEach(searchHistory.prefix(10), id: \.self) { keyword in
                                SearchHistoryChip(keyword: keyword) {
                                    onSelectHistory(keyword)
                                }
                            }
                        }
                    }
                }
                
                // 热门搜索
                VStack(alignment: .leading, spacing: Spacing.md) {
                    HStack(spacing: Spacing.xs) {
                        Image(systemName: "flame.fill")
                            .font(.system(size: IconSize.sm))
                            .foregroundColor(.accentOrange)
                        
                        Text("热门搜索")
                            .font(Typography.bodyBold)
                            .foregroundColor(.white)
                    }
                    
                    FlowLayout(spacing: Spacing.sm) {
                        ForEach(hotSearches, id: \.self) { keyword in
                            HotSearchChip(keyword: keyword) {
                                onSelectHistory(keyword)
                            }
                        }
                    }
                }
            }
            .padding(Spacing.lg)
        }
    }
}

// MARK: - 搜索历史标签
struct SearchHistoryChip: View {
    let keyword: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.xs) {
                Image(systemName: "clock.arrow.circlepath")
                    .font(.system(size: IconSize.xs))
                
                Text(keyword)
                    .font(Typography.caption1)
            }
            .foregroundColor(.white.opacity(0.8))
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.sm)
            .background(Color.white.opacity(0.1))
            .cornerRadius(CornerRadius.lg)
        }
    }
}

// MARK: - 热门搜索标签
struct HotSearchChip: View {
    let keyword: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(keyword)
                .font(Typography.caption1)
                .foregroundColor(.accentOrange)
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.sm)
                .background(Color.accentOrange.opacity(0.15))
                .cornerRadius(CornerRadius.lg)
        }
    }
}

// MARK: - 流式布局
struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.replacingUnspecifiedDimensions().width,
            subviews: subviews,
            spacing: spacing
        )
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            subviews: subviews,
            spacing: spacing
        )
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.frames[index].minX, y: bounds.minY + result.frames[index].minY), proposal: .unspecified)
        }
    }
    
    struct FlowResult {
        var size: CGSize = .zero
        var frames: [CGRect] = []
        
        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var currentX: CGFloat = 0
            var currentY: CGFloat = 0
            var lineHeight: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)
                
                if currentX + size.width > maxWidth && currentX > 0 {
                    currentX = 0
                    currentY += lineHeight + spacing
                    lineHeight = 0
                }
                
                frames.append(CGRect(x: currentX, y: currentY, width: size.width, height: size.height))
                lineHeight = max(lineHeight, size.height)
                currentX += size.width + spacing
            }
            
            self.size = CGSize(width: maxWidth, height: currentY + lineHeight)
        }
    }
}

// MARK: - 搜索结果视图
struct SearchResultsView: View {
    let results: [News]
    let searchText: String
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.md) {
                // 结果统计
                Text("找到 \(results.count) 条相关新闻")
                    .font(Typography.subheadline)
                    .foregroundColor(.white.opacity(0.6))
                    .padding(.horizontal, Spacing.lg)
                    .padding(.top, Spacing.md)
                
                // 结果列表
                LazyVStack(spacing: Spacing.lg) {
                    ForEach(results) { news in
                        SearchResultCard(news: news, searchText: searchText)
                    }
                }
                .padding(.horizontal, Spacing.lg)
            }
            .padding(.bottom, 100)
        }
    }
}

// MARK: - 搜索结果卡片
struct SearchResultCard: View {
    let news: News
    let searchText: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            // 标题（高亮搜索词）
            HighlightedText(text: news.title, highlight: searchText)
                .font(Typography.bodyBold)
                .foregroundColor(.white)
                .lineLimit(2)
            
            // 摘要
            Text(news.summary)
                .font(Typography.caption1)
                .foregroundColor(.white.opacity(0.7))
                .lineLimit(2)
            
            // 元数据
            HStack(spacing: Spacing.md) {
                Label(news.source, systemImage: "newspaper")
                    .font(Typography.caption2)
                    .foregroundColor(.white.opacity(0.5))
                
                Label(news.publishedAt, systemImage: "clock")
                    .font(Typography.caption2)
                    .foregroundColor(.white.opacity(0.5))
            }
        }
        .padding(Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.md)
                .fill(Color.white.opacity(0.05))
        )
    }
}

// MARK: - 高亮文本
struct HighlightedText: View {
    let text: String
    let highlight: String
    
    var body: some View {
        let parts = text.components(separatedBy: highlight)
        
        if parts.count > 1 {
            Text(parts.joined(separator: "[\(highlight)]"))
                .foregroundColor(.white)
        } else {
            Text(text)
        }
    }
}

// MARK: - 空结果视图
struct EmptySearchResultView: View {
    let searchText: String
    
    var body: some View {
        VStack(spacing: Spacing.xl) {
            Spacer()
            
            Image(systemName: "magnifyingglass")
                .font(.system(size: 60))
                .foregroundColor(.white.opacity(0.3))
            
            VStack(spacing: Spacing.sm) {
                Text("未找到相关结果")
                    .font(Typography.title3)
                    .foregroundColor(.white)
                
                Text("试试搜索其他关键词")
                    .font(Typography.subheadline)
                    .foregroundColor(.white.opacity(0.6))
            }
            
            Spacer()
        }
    }
}

#Preview {
    GlobalSearchView()
        .environmentObject(NewsViewModel())
}
