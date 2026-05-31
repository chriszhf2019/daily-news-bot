//
//  IntelligencePulseSection.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  24小时情报脉搏组件
//

import SwiftUI

// MARK: - 24小时情报脉搏大屏图表
struct IntelligencePulseSection: View {
    @State private var animatePulse = false
    
    // 模拟24小时数据
    let hourlyData: [Double] = [
        0.3, 0.4, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9,  // 0-7点
        0.85, 0.75, 0.8, 0.9, 0.95, 0.9, 0.85, 0.8,  // 8-15点
        0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.4, 0.35   // 16-23点
    ]
    
    // 当前情绪指数 (0-100)
    let emotionIndex: Double = 72
    
    var body: some View {
        GlowCard(glowColor: .accentCyan, padding: Spacing.xl) {
            VStack(alignment: .leading, spacing: Spacing.xl) {
                // 标题
                PulseSectionHeader()
                
                // 脉搏图表（光滑面积折线图）
                SmoothAreaChartView(data: hourlyData, animatePulse: $animatePulse)
                    .frame(height: 180)
                
                // 情绪仪表盘
                EmotionGaugeSection(emotionIndex: emotionIndex)
                
                // 统计数据
                PulseStatistics()
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                animatePulse = true
            }
        }
    }
}

// MARK: - 脉搏区域标题
private struct PulseSectionHeader: View {
    var body: some View {
        HStack(spacing: Spacing.sm + 2) {
            ZStack {
                Circle()
                    .fill(Color.accentCyan.opacity(0.2))
                    .frame(width: 36, height: 36)
                    .blur(radius: 6)
                
                Image(systemName: "waveform.path.ecg")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.accentCyan)
                    .shadow(color: .accentCyan, radius: 8, x: 0, y: 0)
            }
            
            VStack(alignment: .leading, spacing: Spacing.xxs) {
                Text("24小时情报脉搏")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                
                Text("Intelligence Pulse · Real-time Monitoring")
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.6))
                    .tracking(0.5)
            }
            
            Spacer()
        }
    }
}

// MARK: - 统计数据
private struct PulseStatistics: View {
    var body: some View {
        HStack(spacing: Spacing.md) {
            PulseStatItem(
                icon: "newspaper.fill",
                label: "今日情报",
                value: "127",
                color: .accentCyan
            )
            
            PulseStatItem(
                icon: "flame.fill",
                label: "热点事件",
                value: "23",
                color: .accentOrange
            )
            
            PulseStatItem(
                icon: "chart.line.uptrend.xyaxis",
                label: "趋势变化",
                value: "+15%",
                color: .accentGreen
            )
        }
    }
}

// MARK: - 脉搏统计项
struct PulseStatItem: View {
    let icon: String
    let label: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: icon)
                .font(.system(size: IconSize.md))
                .foregroundColor(color)
                .shadow(color: color, radius: 6, x: 0, y: 0)
            
            Text(value)
                .font(.system(size: 18, weight: .bold, design: .monospaced))
                .foregroundColor(.white)
            
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.md)
                .fill(color.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: CornerRadius.md)
                        .stroke(color.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        ScrollView {
            IntelligencePulseSection()
                .padding()
        }
    }
}
