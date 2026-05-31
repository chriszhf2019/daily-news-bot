//
//  SimpleModeContent.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  讲白话模式内容组件
//

import SwiftUI

// MARK: - 讲白话模式内容
struct SimpleModeContent: View {
    let news: News
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // 简化摘要
            WhiteTalkSection(summary: generateSimpleSummary(news))
            
            // 知识小百科
            if let aiAnalysis = news.aiAnalysis {
                KnowledgeSection(keywords: aiAnalysis.keywords)
            }
            
            // 来源信息
            SourceInfoSection(source: news.source, publishedAt: news.publishedAt)
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

// MARK: - 大白话解读区域
private struct WhiteTalkSection: View {
    let summary: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack(spacing: 5) {
                Text("🗣️")
                    .font(.system(size: IconSize.sm))
                Text("大白话解读")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.accentGreen)
            }
            
            Text(summary)
                .font(.system(size: 15))
                .foregroundColor(.white.opacity(0.9))
                .lineSpacing(6)
        }
        .padding(Spacing.md + 2)
        .background(Color.accentGreen.opacity(0.1))
        .cornerRadius(CornerRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: CornerRadius.md)
                .stroke(Color.accentGreen.opacity(0.2), lineWidth: 1)
        )
        .padding(.horizontal, Spacing.lg)
        .padding(.top, Spacing.md)
    }
}

// MARK: - 知识小百科
private struct KnowledgeSection: View {
    let keywords: [String]
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs + 2) {
            HStack(spacing: 5) {
                Text("💡")
                    .font(Typography.caption1)
                Text("小知识")
                    .font(Typography.caption1)
                    .fontWeight(.medium)
                    .foregroundColor(.accentYellow)
            }
            
            Text("关键词：\(keywords.prefix(3).joined(separator: "、"))")
                .font(Typography.caption1)
                .foregroundColor(.white.opacity(0.7))
        }
        .padding(Spacing.sm + 2)
        .background(Color.accentYellow.opacity(0.08))
        .cornerRadius(CornerRadius.sm)
        .padding(.horizontal, Spacing.lg)
    }
}

// MARK: - 来源信息
private struct SourceInfoSection: View {
    let source: String
    let publishedAt: String
    
    var body: some View {
        HStack {
            Text("来源: \(source)")
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.5))
            
            Spacer()
            
            Text(publishedAt)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.5))
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.top, Spacing.xs)
    }
}

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        ScrollView {
            SimpleModeContent(news: News.generateMockNews()[0])
        }
    }
}
