//
//  IntelligenceView_New.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  情报中心主视图（重构版 - 从3409行优化到<200行）
//

import SwiftUI

// MARK: - 情报中心主视图（战略指挥室）
struct IntelligenceView_New: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @State private var animateOnAppear = false
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: Spacing.xl) {
                // 顶部：战略指挥室标题
                CommandCenterHeader()
                    .opacity(animateOnAppear ? 1 : 0)
                    .animation(.easeOut(duration: 0.6), value: animateOnAppear)
                
                // 24小时情报脉搏大屏图表
                IntelligencePulseSection()
                    .opacity(animateOnAppear ? 1 : 0)
                    .offset(y: animateOnAppear ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.1), value: animateOnAppear)
                
                // 中部：双栏布局
                TwoColumnLayout()
                    .opacity(animateOnAppear ? 1 : 0)
                    .animation(.easeOut(duration: 0.6).delay(0.2), value: animateOnAppear)
                
                // 下部：专题情报包
                TopicIntelPackSection()
                    .opacity(animateOnAppear ? 1 : 0)
                    .offset(y: animateOnAppear ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.4), value: animateOnAppear)
                
                // 点透AI署名
                PointAISignatureView()
                    .opacity(animateOnAppear ? 1 : 0)
                    .animation(.easeOut(duration: 0.6).delay(0.5), value: animateOnAppear)
            }
            .padding(.horizontal, Spacing.lg)
            .padding(.vertical, Spacing.xl)
            .padding(.bottom, 100)
        }
        .background(LinearGradient.deepOceanGradient.ignoresSafeArea())
        .onAppear {
            viewModel.fetchIntelligenceData()
            withAnimation {
                animateOnAppear = true
            }
        }
    }
}

// MARK: - 双栏布局
private struct TwoColumnLayout: View {
    var body: some View {
        HStack(alignment: .top, spacing: Spacing.lg) {
            // 左栏：叙事风向标（热力图）
            NarrativeHeatMapPlaceholder()
                .frame(maxWidth: .infinity)
            
            // 右栏：贝叶斯概率预测
            BayesianPredictionPlaceholder()
                .frame(maxWidth: .infinity)
        }
    }
}

// MARK: - 叙事风向标占位符（待实现）
private struct NarrativeHeatMapPlaceholder: View {
    var body: some View {
        GlowCard(glowColor: .accentOrange, padding: Spacing.lg) {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack(spacing: Spacing.sm) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: IconSize.md))
                        .foregroundColor(.accentOrange)
                    
                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        Text("叙事风向标")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text("Narrative Tracker")
                            .font(.system(size: 9))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
                
                // 占位内容
                VStack(spacing: Spacing.sm) {
                    ForEach(0..<3, id: \.self) { _ in
                        HStack {
                            RoundedRectangle(cornerRadius: CornerRadius.sm)
                                .fill(Color.accentOrange.opacity(0.2))
                                .frame(height: 60)
                        }
                    }
                }
                
                Text("方块大小 = 热度 · 颜色深度 = 增长速度")
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.top, Spacing.xs)
            }
        }
        .frame(height: 350)
    }
}

// MARK: - 贝叶斯预测占位符（待实现）
private struct BayesianPredictionPlaceholder: View {
    var body: some View {
        GlowCard(glowColor: .pointPurple, padding: Spacing.lg) {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack(spacing: Spacing.sm) {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.system(size: IconSize.md))
                        .foregroundColor(.pointPurple)
                    
                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        Text("贝叶斯预测")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text("Bayesian Forecast")
                            .font(.system(size: 9))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
                
                // 占位内容
                VStack(spacing: Spacing.md) {
                    ForEach(0..<3, id: \.self) { i in
                        HStack {
                            VStack(alignment: .leading, spacing: Spacing.xs) {
                                Text("预测事件 \(i + 1)")
                                    .font(Typography.caption1)
                                    .foregroundColor(.white.opacity(0.8))
                                
                                HStack {
                                    Text("概率: 65%")
                                        .font(.system(size: 18, weight: .bold))
                                        .foregroundColor(.pointPurple)
                                    
                                    Text("+3%")
                                        .font(Typography.caption1)
                                        .foregroundColor(.accentGreen)
                                }
                            }
                            
                            Spacer()
                        }
                        .padding(Spacing.md)
                        .background(Color.pointPurple.opacity(0.1))
                        .cornerRadius(CornerRadius.sm)
                    }
                }
            }
        }
        .frame(height: 350)
    }
}

// MARK: - 专题情报包占位符（待实现）
private struct TopicIntelPackSection: View {
    var body: some View {
        GlowCard(glowColor: .accentGreen, padding: Spacing.lg) {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack(spacing: Spacing.sm) {
                    Image(systemName: "folder.fill")
                        .font(.system(size: IconSize.md))
                        .foregroundColor(.accentGreen)
                    
                    Text("专题情报包")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                }
                
                // 占位内容
                VStack(spacing: Spacing.sm) {
                    ForEach(0..<2, id: \.self) { i in
                        HStack {
                            VStack(alignment: .leading, spacing: Spacing.xs) {
                                Text("专题 \(i + 1)")
                                    .font(Typography.bodyBold)
                                    .foregroundColor(.white)
                                
                                Text("相关新闻: 8条 · 影响等级: 9")
                                    .font(Typography.caption1)
                                    .foregroundColor(.white.opacity(0.6))
                            }
                            
                            Spacer()
                            
                            Image(systemName: "chevron.right")
                                .foregroundColor(.white.opacity(0.4))
                        }
                        .padding(Spacing.md)
                        .background(Color.accentGreen.opacity(0.1))
                        .cornerRadius(CornerRadius.md)
                    }
                }
            }
        }
    }
}

// MARK: - 点透AI署名
private struct PointAISignatureView: View {
    var body: some View {
        VStack(spacing: Spacing.sm) {
            HStack(spacing: Spacing.xs) {
                Image(systemName: "sparkles")
                    .font(.system(size: IconSize.xs))
                    .foregroundColor(.accentYellow)
                
                Text("由点透AI智能生成")
                    .font(Typography.caption2)
                    .foregroundColor(.white.opacity(0.5))
            }
            
            Text("数据更新时间: \(currentTimeString())")
                .font(Typography.caption2)
                .foregroundColor(.white.opacity(0.4))
        }
        .padding(.top, Spacing.xl)
    }
    
    private func currentTimeString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: Date())
    }
}

#Preview {
    IntelligenceView_New()
        .environmentObject(NewsViewModel())
}
