//
//  ConciseModeContent.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  捞干货模式内容组件
//

import SwiftUI

// MARK: - 捞干货模式内容
struct ConciseModeContent: View {
    let news: News
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm + 2) {
            // 一句话总结
            OneSentenceSummary(summary: generateConciseSummary(news))
            
            // 关键数据
            if let aiAnalysis = news.aiAnalysis {
                KeyMetricsSection(aiAnalysis: aiAnalysis)
            }
            
            // 来源和时间（极简）
            MinimalSourceInfo(source: news.source, publishedAt: news.publishedAt)
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
}

// MARK: - 一句话总结
private struct OneSentenceSummary: View {
    let summary: String
    
    var body: some View {
        HStack(alignment: .top, spacing: Spacing.sm) {
            Text("💧")
                .font(.system(size: IconSize.md))
            
            Text(summary)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.white)
                .lineLimit(2)
        }
        .padding(Spacing.md)
        .background(Color.pointBlue.opacity(0.15))
        .cornerRadius(CornerRadius.sm + 2)
        .padding(.horizontal, Spacing.lg)
        .padding(.top, Spacing.md)
    }
}

// MARK: - 关键数据区域
private struct KeyMetricsSection: View {
    let aiAnalysis: News.AIAnalysis
    
    var body: some View {
        HStack(spacing: Spacing.lg) {
            // 重要性
            MetricItem(
                value: "\(aiAnalysis.importance)",
                label: "重要性",
                color: importanceColor(aiAnalysis.importance)
            )
            
            Divider()
                .frame(height: 30)
                .background(Color.white.opacity(0.2))
            
            // 情绪
            MetricItem(
                value: sentimentEmoji(aiAnalysis.sentiment),
                label: "情绪",
                color: .white
            )
            
            Divider()
                .frame(height: 30)
                .background(Color.white.opacity(0.2))
            
            // 趋势
            MetricItem(
                value: aiAnalysis.trends.first ?? "—",
                label: "趋势",
                color: .pointPurple,
                isText: true
            )
            
            Spacer()
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.top, Spacing.xs + 2)
    }
    
    private func importanceColor(_ importance: Int) -> Color {
        if importance >= 90 { return .accentRed }
        if importance >= 80 { return .accentOrange }
        if importance >= 70 { return .accentYellow }
        return .accentGreen
    }
    
    private func sentimentEmoji(_ sentiment: String) -> String {
        switch sentiment.lowercased() {
        case "positive", "very_positive": return "📈"
        case "negative": return "📉"
        case "breakthrough", "excited": return "🚀"
        default: return "➡️"
        }
    }
}

// MARK: - 指标项
private struct MetricItem: View {
    let value: String
    let label: String
    let color: Color
    var isText: Bool = false
    
    var body: some View {
        VStack(spacing: Spacing.xxs) {
            if isText {
                Text(value)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(color)
                    .lineLimit(1)
            } else {
                Text(value)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(color)
            }
            
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.white.opacity(0.5))
        }
    }
}

// MARK: - 极简来源信息
private struct MinimalSourceInfo: View {
    let source: String
    let publishedAt: String
    
    var body: some View {
        HStack {
            Text(source)
                .font(.system(size: 10))
                .foregroundColor(.white.opacity(0.4))
            
            Text("·")
                .foregroundColor(.white.opacity(0.3))
            
            Text(formatShortTime(publishedAt))
                .font(.system(size: 10))
                .foregroundColor(.white.opacity(0.4))
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.top, Spacing.xs)
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

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        ScrollView {
            ConciseModeContent(news: News.generateMockNews()[0])
        }
    }
}
