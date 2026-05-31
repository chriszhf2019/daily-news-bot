//
//  CommandCenterHeader.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  战略指挥室头部组件
//

import SwiftUI

// MARK: - 战略指挥室标题
struct CommandCenterHeader: View {
    var body: some View {
        VStack(spacing: Spacing.md) {
            // 主标题
            HStack(spacing: Spacing.md) {
                // 霓虹发光图标
                NeonIcon()
                
                TitleSection()
                
                Spacer()
                
                // 实时状态指示器
                LiveIndicator()
            }
            
            // 分隔线
            Divider()
                .overlay(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.clear,
                            Color.pointBlue.opacity(0.5),
                            Color.clear
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 1)
        }
    }
}

// MARK: - 霓虹发光图标
private struct NeonIcon: View {
    var body: some View {
        ZStack {
            Circle()
                .fill(Color.pointBlue.opacity(0.2))
                .frame(width: 50, height: 50)
                .blur(radius: 8)
            
            Image(systemName: "chart.bar.doc.horizontal")
                .font(.system(size: IconSize.lg, weight: .bold))
                .foregroundColor(.pointBlue)
                .shadow(
                    color: Shadow.glow(color: .pointBlue, radius: 10).color,
                    radius: Shadow.glow(color: .pointBlue, radius: 10).radius,
                    x: 0,
                    y: 0
                )
        }
    }
}

// MARK: - 标题区域
private struct TitleSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text("战略指挥室")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)
            
            Text("Intelligence Command Center")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white.opacity(0.6))
                .tracking(1)
        }
    }
}

// MARK: - 实时状态指示器
private struct LiveIndicator: View {
    @State private var isPulsing = false
    
    var body: some View {
        HStack(spacing: Spacing.xs + 2) {
            Circle()
                .fill(Color.accentGreen)
                .frame(width: 8, height: 8)
                .shadow(color: .accentGreen, radius: isPulsing ? 6 : 4, x: 0, y: 0)
                .scaleEffect(isPulsing ? 1.2 : 1.0)
            
            Text("LIVE")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(.accentGreen)
                .tracking(1)
        }
        .padding(.horizontal, Spacing.sm + 2)
        .padding(.vertical, Spacing.xs + 2)
        .background(Color.accentGreen.opacity(0.15))
        .cornerRadius(CornerRadius.md)
        .onAppear {
            withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                isPulsing = true
            }
        }
    }
}

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        CommandCenterHeader()
            .padding()
    }
}
