//
//  TopDashboardSection.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  顶部仪表盘组件
//

import SwiftUI

// MARK: - 顶部仪表盘
struct TopDashboardSection: View {
    let newsCount: Int
    
    var body: some View {
        HStack(spacing: Spacing.md) {
            // 今日情报
            DashboardCard(
                icon: "📋",
                value: "\(newsCount)",
                label: "今日情报",
                gradient: [.oceanDark, .oceanMedium]
            )
            
            // 情绪指数
            DashboardCard(
                icon: "🧠",
                value: "68",
                label: "情绪指数",
                gradient: [Color.pointPurple.opacity(0.8), Color(hex: "4C1D95")]
            )
            
            // 重要信号
            DashboardCard(
                icon: "⚡",
                value: "5",
                label: "重要信号",
                gradient: [.accentGreen, Color(hex: "047857")]
            )
        }
        .padding(.horizontal, Spacing.lg)
    }
}

// MARK: - 仪表盘卡片
struct DashboardCard: View {
    let icon: String
    let value: String
    let label: String
    let gradient: [Color]
    
    var body: some View {
        VStack(spacing: Spacing.sm) {
            Text(icon)
                .font(Typography.title2)
            
            Text(value)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Text(label)
                .font(Typography.caption1)
                .foregroundColor(.white.opacity(0.8))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.lg)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: gradient),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: CornerRadius.lg)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
    }
}

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        TopDashboardSection(newsCount: 127)
    }
}
