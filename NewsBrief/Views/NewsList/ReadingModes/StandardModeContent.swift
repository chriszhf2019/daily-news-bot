//
//  StandardModeContent.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  深度看模式内容组件
//

import SwiftUI

// MARK: - 深度看模式内容
struct StandardModeContent: View {
    let news: News
    @State private var showRipples = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // 摘要区域
            SummarySection(summary: news.summary)
            
            // 元数据区域（出处、时间、可靠性）
            MetadataSection(news: news)
            
            // 标签
            if !news.tags.isEmpty {
                TagsSection(tags: news.tags)
            }
            
            // AI深度解读
            if let aiAnalysis = news.aiAnalysis {
                AIInsightSection(analysis: aiAnalysis)
                    .padding(.horizontal, Spacing.lg)
            }
            
            // "然后呢？"按钮 - 显示二阶效应
            if let intelPro = news.intelPro {
                RipplesButton(showRipples: $showRipples)
                
                // 涟漪图 - 二阶效应展示
                if showRipples {
                    RipplesVisualization(ripples: intelPro.ripples)
                        .padding(.horizontal, Spacing.lg)
                        .padding(.top, Spacing.sm)
                        .transition(.asymmetric(
                            insertion: .move(edge: .leading).combined(with: .opacity),
                            removal: .move(edge: .trailing).combined(with: .opacity)
                        ))
                }
            }
            
            // 涟漪效应
            if let rippleEffect = news.aiAnalysis?.rippleEffect {
                RippleEffectSection(rippleEffect: rippleEffect)
                    .padding(.horizontal, Spacing.lg)
            }
            
            // 未来前瞻
            if let futureOutlook = news.aiAnalysis?.futureOutlook {
                FutureOutlookSection(outlook: futureOutlook)
                    .padding(.horizontal, Spacing.lg)
            }
            
            // 与我何干
            if let personalRelevance = news.aiAnalysis?.personalRelevance {
                PersonalRelevanceSection(relevance: personalRelevance)
                    .padding(.horizontal, Spacing.lg)
            }
        }
    }
}

// MARK: - 摘要区域
private struct SummarySection: View {
    let summary: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs + 2) {
            HStack(spacing: 5) {
                Rectangle()
                    .fill(Color.pointBlue)
                    .frame(width: 3, height: 14)
                    .cornerRadius(1.5)
                
                Text("📋 摘要")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.pointBlue)
            }
            
            Text(summary)
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.85))
                .lineSpacing(5)
        }
        .padding(Spacing.md)
        .background(Color.white.opacity(0.04))
        .cornerRadius(CornerRadius.sm + 2)
        .padding(.horizontal, Spacing.lg)
        .padding(.top, Spacing.md)
    }
}

// MARK: - 元数据区域
private struct MetadataSection: View {
    let news: News
    
    var body: some View {
        VStack(spacing: Spacing.sm) {
            HStack(spacing: 0) {
                HStack(spacing: Spacing.xs) {
                    Text("出处:")
                        .font(Typography.caption1)
                        .foregroundColor(.white.opacity(0.5))
                    
                    Text(news.source)
                        .font(Typography.caption1)
                        .foregroundColor(.pointBlue)
                        .underline()
                }
                
                Spacer()
                
                // 可靠性评分
                if let reliability = news.aiAnalysis?.reliability {
                    ReliabilityStars(reliability: reliability)
                }
            }
            
            HStack {
                Text("发布时间: \(news.publishedAt)")
                    .font(Typography.caption1)
                    .foregroundColor(.white.opacity(0.5))
                
                Spacer()
                
                // 重要程度
                if let importance = news.aiAnalysis?.importance {
                    ImportanceBadge(importance: importance)
                }
            }
        }
        .padding(.horizontal, Spacing.lg)
    }
}

// MARK: - 可靠性星级
private struct ReliabilityStars: View {
    let reliability: Int
    
    var body: some View {
        HStack(spacing: Spacing.xs) {
            ForEach(0..<min(reliability / 20, 5), id: \.self) { _ in
                Image(systemName: "star.fill")
                    .font(.system(size: 8))
                    .foregroundColor(.accentYellow)
            }
            Text("\(reliability)分")
                .font(.system(size: 10))
                .foregroundColor(.accentYellow)
        }
    }
}

// MARK: - 重要性徽章
private struct ImportanceBadge: View {
    let importance: Int
    
    var body: some View {
        HStack(spacing: Spacing.xs) {
            Text("重要度:")
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.5))
            Text("\(importance)")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(importanceColor)
        }
    }
    
    private var importanceColor: Color {
        if importance >= 90 { return .accentRed }
        if importance >= 80 { return .accentOrange }
        if importance >= 70 { return .accentYellow }
        return .accentGreen
    }
}

// MARK: - 标签区域
private struct TagsSection: View {
    let tags: [String]
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Spacing.sm) {
                ForEach(tags.prefix(4), id: \.self) { tag in
                    Text("#\(tag)")
                        .font(Typography.caption1)
                        .foregroundColor(.pointBlue)
                        .padding(.horizontal, Spacing.sm + 2)
                        .padding(.vertical, 5)
                        .background(Color.pointBlue.opacity(0.12))
                        .cornerRadius(CornerRadius.xs + 2)
                }
            }
        }
        .padding(.horizontal, Spacing.lg)
    }
}

// MARK: - "然后呢？"按钮
private struct RipplesButton: View {
    @Binding var showRipples: Bool
    
    var body: some View {
        Button(action: {
            withAnimation(Animation.spring) {
                showRipples.toggle()
            }
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
        }) {
            HStack(spacing: Spacing.sm) {
                Image(systemName: showRipples ? "chevron.down.circle.fill" : "chevron.right.circle.fill")
                    .font(.system(size: IconSize.md))
                    .foregroundColor(.accentCyan)
                
                Text("然后呢？")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.accentCyan)
                
                Text("看看二阶效应")
                    .font(Typography.caption1)
                    .foregroundColor(.white.opacity(0.6))
                
                Spacer()
                
                Image(systemName: "waveform.path")
                    .font(.system(size: IconSize.sm))
                    .foregroundColor(.accentCyan.opacity(0.6))
            }
            .padding(.horizontal, Spacing.lg)
            .padding(.vertical, Spacing.md)
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.md)
                    .fill(Color.accentCyan.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: CornerRadius.md)
                            .stroke(Color.accentCyan.opacity(0.3), lineWidth: 1)
                    )
            )
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.top, Spacing.sm)
    }
}

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        ScrollView {
            StandardModeContent(news: News.generateMockNews()[0])
        }
    }
}
