//
//  NewsDetailView.swift
//  NewsBrief
//
//  Created by haifangzhao on 2025-01-01.
//

import SwiftUI
import WebKit
import UIKit
import SafariServices

// MARK: - 新闻详情视图
struct NewsDetailView: View {
    let news: News
    @EnvironmentObject var favoritesManager: FavoritesManager
    @EnvironmentObject var noteManager: NoteManager
    @Environment(\.dismiss) private var dismiss
    @State private var showingShareSheet = false
    @State private var showingWebView = false
    @State private var webViewURL: URL?
    @State private var showingNoteView = false
    @State private var currentNote: Note?
    @State private var isAIProcessing = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // 标题区域
                headerSection
                
                // 新闻内容
                contentSection
                
                // AI分析
                if let aiAnalysis = news.aiAnalysis {
                    aiAnalysisSection(aiAnalysis)
                }
                
                // 标签
                if !news.tags.isEmpty {
                    tagsSection
                }
                
                // 统计数据
                statsSection
                
                Spacer(minLength: 20)
            }
            .padding()
        }
        .navigationTitle("新闻详情")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItemGroup(placement: .navigationBarTrailing) {
                Button(action: {
                    shareNews()
                    let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedbackgenerator.impactOccurred()
                }) {
                    Image(systemName: "square.and.arrow.up")
                        .foregroundColor(.white)
                }
                
                Button(action: {
                    saveImage()
                    let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedbackgenerator.impactOccurred()
                }) {
                    Image(systemName: "square.and.arrow.down")
                        .foregroundColor(.white)
                }
                
                Button(action: {
                    favoritesManager.toggleFavorite(newsID: news.id)
                    let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedbackgenerator.impactOccurred()
                }) {
                    Image(systemName: favoritesManager.isNewsFavorited(news.id) ? "heart.fill" : "heart")
                        .foregroundColor(favoritesManager.isNewsFavorited(news.id) ? .red : .white)
                }
                
                Button(action: {
                    showNoteView()
                    let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedbackgenerator.impactOccurred()
                }) {
                    Image(systemName: "pencil.and.outline")
                        .foregroundColor(.white)
                }
            }
        }
        .sheet(isPresented: $showingWebView) {
            if let url = webViewURL {
                SafariView(url: url)
            }
        }
        .sheet(isPresented: $showingNoteView) {
            NoteTakingView(news: news, currentNote: $currentNote, isAIProcessing: $isAIProcessing)
                .environmentObject(noteManager)
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
        .tint(.white)
    }
    
    // MARK: - 头部区域
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            // 分类和突发标签
            HStack {
                Text(news.category)
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(4)
                
                if news.isBreaking {
                    Text("🚨 突发")
                        .font(.caption)
                        .fontWeight(.medium)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.red.opacity(0.2))
                        .cornerRadius(4)
                }
                
                Spacer()
            }
            
            // 标题
            Text(news.title)
                .font(.title2)
                .fontWeight(.bold)
                .lineLimit(nil)
                .multilineTextAlignment(.leading)
            
            // 发布信息
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("来源: \(news.source)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(news.publishedAt)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
        }
    }
    
    // MARK: - 内容区域
    private var contentSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("内容摘要")
                .font(.headline)
                .fontWeight(.semibold)
            
            Text(news.summary)
                .font(.body)
                .foregroundColor(.primary)
                .lineSpacing(4)
            
            Divider()
            
            Text("详细内容")
                .font(.headline)
                .fontWeight(.semibold)
            
            Text(news.content)
                .font(.body)
                .foregroundColor(.primary)
                .lineSpacing(4)
            
            if let url = news.url {
                Divider()
                
                Button(action: {
                    webViewURL = URL(string: url)
                    showingWebView = true
                }) {
                    HStack {
                        Image(systemName: "link")
                        Text("查看原文")
                            .fontWeight(.medium)
                        Spacer()
                        Image(systemName: "arrow.up.right")
                    }
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)
                }
                .buttonStyle(PlainButtonStyle())
            }
        }
    }
    
    // MARK: - AI分析区域
    private func aiAnalysisSection(_ aiAnalysis: News.AIAnalysis) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "brain.head.profile")
                    .foregroundColor(.purple)
                Text("AI智能分析")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.purple)
            }
            
            // 情感分析
            HStack {
                Text("情感倾向:")
                    .font(.subheadline)
                    .fontWeight(.medium)
                Spacer()
                Text(aiAnalysis.sentiment)
                    .font(.subheadline)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(sentimentColor(aiAnalysis.sentiment).opacity(0.2))
                    .cornerRadius(4)
            }
            
            // 重要性评级
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("重要性评级:")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Spacer()
                    Text("\(aiAnalysis.importance)/100")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                }
                
                ProgressView(value: Double(aiAnalysis.importance), total: 100)
                    .progressViewStyle(LinearProgressViewStyle(tint: .yellow))
            }
            
            // 关键词
            if !aiAnalysis.keywords.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("关键词:")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    FlowLayout(items: aiAnalysis.keywords) { keyword in
                        Text(keyword)
                            .font(.caption)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.gray.opacity(0.2))
                            .cornerRadius(4)
                    }
                }
            }
            
            // 分析摘要
            VStack(alignment: .leading, spacing: 4) {
                Text("AI分析摘要:")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(aiAnalysis.summary)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .lineSpacing(4)
            }
            
            // 趋势分析
            if !aiAnalysis.trends.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("相关趋势:")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    ForEach(aiAnalysis.trends, id: \.self) { trend in
                        HStack {
                            Image(systemName: "trending.up")
                                .foregroundColor(.green)
                                .font(.caption)
                            Text(trend)
                                .font(.body)
                            Spacer()
                        }
                        .padding(.vertical, 2)
                    }
                }
            }
            
            // 影响评估
            VStack(alignment: .leading, spacing: 4) {
                Text("影响评估:")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(aiAnalysis.impact)
                    .font(.body)
                    .foregroundColor(.secondary)
            }
            
            // 预测浏览量
            HStack {
                Text("预测浏览量:")
                    .font(.subheadline)
                    .fontWeight(.medium)
                Spacer()
                Text(formatNumber(aiAnalysis.predictedViews))
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.blue)
            }
            
            // 推荐行动
            if !aiAnalysis.recommendedActions.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("推荐行动:")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    ForEach(aiAnalysis.recommendedActions, id: \.self) { action in
                        HStack {
                            Image(systemName: "checkmark.circle")
                                .foregroundColor(.green)
                                .font(.caption)
                            Text(action)
                                .font(.body)
                            Spacer()
                        }
                        .padding(.vertical, 2)
                    }
                }
            }
        }
        .padding()
        .background(Color.purple.opacity(0.05))
        .cornerRadius(12)
    }
    
    // MARK: - 标签区域
    private var tagsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("相关标签")
                .font(.headline)
                .fontWeight(.semibold)
            
            FlowLayout(items: news.tags) { tag in
                Text("#\(tag)")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(12)
            }
        }
    }
    
    // MARK: - 统计数据区域
    private var statsSection: some View {
        HStack {
            // 浏览量
            VStack {
                Image(systemName: "eye")
                    .foregroundColor(.blue)
                Text(formatNumber(news.views))
                    .font(.caption)
                    .fontWeight(.semibold)
                Text("浏览")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // 分享数
            VStack {
                Image(systemName: "square.and.arrow.up")
                    .foregroundColor(.green)
                Text(formatNumber(news.shares))
                    .font(.caption)
                    .fontWeight(.semibold)
                Text("分享")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // 阅读时间
            VStack {
                Image(systemName: "clock")
                    .foregroundColor(.orange)
                Text("\(news.readTime)分钟")
                    .font(.caption)
                    .fontWeight(.semibold)
                Text("阅读")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // 收藏数
            VStack {
                Image(systemName: "heart")
                    .foregroundColor(.red)
                Text("❤️")
                    .font(.caption)
                Text("收藏")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    // MARK: - 工具方法
    private func shareNews() {
        // 获取当前的UIViewController
        let shareText = "📰 \(news.title)\n\n\(news.summary)"
        let activityVC = UIActivityViewController(activityItems: [shareText], applicationActivities: nil)
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let viewController = windowScene.windows.first?.rootViewController {
            viewController.present(activityVC, animated: true)
        }
        
        print("分享新闻: \(news.title)")
    }
    
    private func saveImage() {
        // 生成图片并保存到相册
        generateImageAndSave()
    }
    
    private func generateImageAndSave() {
        // 使用viewModel生成分享图片
        let shareView = ShareImageView(news: news)
        let renderer = ImageRenderer(content: shareView)
        renderer.scale = 2.0
        
        if let image = renderer.uiImage {
            // 保存到相册
            UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
            
            // 显示保存成功提示
            let alert = UIAlertController(title: "保存成功", message: "图片已保存到相册", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "确定", style: .default))
            
            // 显示提示
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let viewController = windowScene.windows.first?.rootViewController {
                viewController.present(alert, animated: true)
            }
        }
    }
    
    private func sentimentColor(_ sentiment: String) -> Color {
        switch sentiment.lowercased() {
        case "positive", "very_positive", "excited":
            return .green
        case "negative", "very_negative":
            return .red
        case "neutral":
            return .gray
        default:
            return .blue
        }
    }
    
    private func formatNumber(_ number: Int) -> String {
        if number >= 1_000_000 {
            return String(format: "%.1fM", Double(number) / 1_000_000)
        } else if number >= 1_000 {
            return String(format: "%.1fK", Double(number) / 1_000)
        } else {
            return "\(number)"
        }
    }
    
    // MARK: - 笔记功能
    private func showNoteView() {
        // 检查是否已有笔记
        if let existingNote = noteManager.getNote(for: news.id) {
            currentNote = existingNote
        } else {
            currentNote = Note(newsID: news.id)
        }
        showingNoteView = true
    }
}

// MARK: - AI辅助笔记视图
struct NoteTakingView: View {
    let news: News
    @Binding var currentNote: Note?
    @Binding var isAIProcessing: Bool
    @EnvironmentObject var noteManager: NoteManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var noteContent: String
    @State private var noteSummary: String
    
    init(news: News, currentNote: Binding<Note?>, isAIProcessing: Binding<Bool>) {
        self.news = news
        self._currentNote = currentNote
        self._isAIProcessing = isAIProcessing
        self._noteContent = State(initialValue: currentNote.wrappedValue?.content ?? "")
        self._noteSummary = State(initialValue: currentNote.wrappedValue?.summary ?? "")
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                // 新闻标题
                Text(news.title)
                    .font(.headline)
                    .foregroundColor(.primary)
                    .lineLimit(2)
                    .padding(.horizontal)
                
                // 摘要
                Text(news.summary)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .lineLimit(3)
                    .padding(.horizontal)
                
                Divider()
                
                // 笔记内容编辑
                VStack(alignment: .leading, spacing: 8) {
                    Text("我的笔记")
                        .font(.title3)
                        .fontWeight(.bold)
                    
                    TextEditor(text: $noteContent)
                        .frame(height: 200)
                        .border(Color.gray.opacity(0.2), width: 1)
                        .cornerRadius(8)
                        .padding(.horizontal, 8)
                }
                
                // AI辅助功能
                HStack(spacing: 12) {
                    Button(action: {
                        aiPolish()
                    }) {
                        Label("AI润色", systemImage: "wand.and.stars")
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    .disabled(isAIProcessing)
                    
                    Button(action: {
                        aiSummarize()
                    }) {
                        Label("一键总结", systemImage: "text.badge.checkmark")
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    .disabled(isAIProcessing)
                    
                    Button(action: {
                        aiExtractKeyPoints()
                    }) {
                        Label("提取要点", systemImage: "doc.plaintext")
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.orange)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    .disabled(isAIProcessing)
                }
                .padding(.horizontal)
                
                if isAIProcessing {
                    HStack {
                        ProgressView()
                        Text("AI正在处理...")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
            }
            .padding(.top, 16)
            .navigationTitle("AI辅助笔记")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        dismiss()
                    }) {
                        Text("取消")
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        saveNote()
                    }) {
                        Text("保存")
                            .fontWeight(.bold)
                    }
                }
            }
        }
    }
    
    // MARK: - AI辅助功能实现
    private func aiPolish() {
        isAIProcessing = true
        
        // 模拟AI处理
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            // 这里应该调用实际的AI API
            noteContent = "AI润色后的笔记内容：\(noteContent)"
            isAIProcessing = false
        }
    }
    
    private func aiSummarize() {
        isAIProcessing = true
        
        // 模拟AI处理
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            // 这里应该调用实际的AI API
            noteSummary = "AI自动总结：\(news.summary)\n\n核心要点：\(news.tags.joined(separator: ", "))"
            isAIProcessing = false
        }
    }
    
    private func aiExtractKeyPoints() {
        isAIProcessing = true
        
        // 模拟AI处理
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            // 这里应该调用实际的AI API
            let keyPoints = news.tags.enumerated().map { "\($0.offset + 1). \($0.element)" }
            noteContent += "\n\nAI提取的关键要点：\n\(keyPoints.joined(separator: "\n"))"
            isAIProcessing = false
        }
    }
    
    // MARK: - 保存笔记
    private func saveNote() {
        guard var note = currentNote else { return }
        
        note.content = noteContent
        note.summary = noteSummary
        note.updatedAt = Date()
        
        noteManager.saveNote(note)
        dismiss()
    }
}

// MARK: - Safari视图
struct SafariView: UIViewControllerRepresentable {
    let url: URL
    
    func makeUIViewController(context: Context) -> SFSafariViewController {
        return SFSafariViewController(url: url)
    }
    
    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {
        // 无需更新
    }
}

// MARK: - 流式布局
struct FlowLayout<Data: RandomAccessCollection, Content: View>: View where Data.Element: Hashable {
    let items: Data
    let content: (Data.Element) -> Content
    
    var body: some View {
        GeometryReader { geometry in
            self.generateContent(in: geometry.size)
        }
        .frame(minHeight: 10)
    }
    
    func generateContent(in size: CGSize) -> some View {
        var width: CGFloat = 0
        var height: CGFloat = 0
        
        return ZStack(alignment: .topLeading) {
            ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                content(item)
                    .padding(4)
                    .alignmentGuide(.leading) { d in
                        if (abs(width - d.width) > size.width) {
                            width = 0
                            height -= d.height
                        }
                        let result = width
                        if item == items.last {
                            width = 0
                        } else {
                            width -= d.width
                        }
                        return result
                    }
                    .alignmentGuide(.top) { d in
                        let result = height
                        if item == items.last {
                            height = 0
                        }
                        return result
                    }
            }
        }
    }
}

#Preview {
    NewsDetailView(news: News.generateMockNews().first!)
        .environmentObject(FavoritesManager())
}
