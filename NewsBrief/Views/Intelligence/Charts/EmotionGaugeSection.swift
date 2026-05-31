//
//  EmotionGaugeSection.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  情绪仪表盘组件
//

import SwiftUI

// MARK: - 情绪仪表盘区域
struct EmotionGaugeSection: View {
    let emotionIndex: Double // 0-100
    @State private var animateNeedle = false
    
    var body: some View {
        VStack(spacing: Spacing.md) {
            HStack(spacing: Spacing.sm) {
                Image(systemName: "gauge.with.dots.needle.67percent")
                    .font(.system(size: IconSize.sm))
                    .foregroundColor(.accentYellow)
                    .shadow(color: .accentYellow, radius: 4, x: 0, y: 0)
                
                Text("市场情绪指数")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                
                Spacer()
                
                EmotionLabel(emotionIndex: emotionIndex)
            }
            
            // 半圆形仪表盘
            SemicircleGaugeView(value: emotionIndex, animateNeedle: $animateNeedle)
                .frame(height: 120)
                .onAppear {
                    withAnimation(.easeOut(duration: 1.5)) {
                        animateNeedle = true
                    }
                }
        }
        .padding(Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.md)
                .fill(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: CornerRadius.md)
                        .stroke(emotionColor.opacity(0.3), lineWidth: 1)
                )
        )
    }
    
    private var emotionColor: Color {
        switch emotionIndex {
        case 0..<20: return .pointBlue
        case 20..<40: return .accentCyan
        case 40..<60: return .accentGreen
        case 60..<80: return .accentOrange
        default: return .accentRed
        }
    }
}

// MARK: - 情绪标签
private struct EmotionLabel: View {
    let emotionIndex: Double
    
    var body: some View {
        Text(emotionText)
            .font(Typography.caption1)
            .fontWeight(.medium)
            .foregroundColor(emotionColor)
            .padding(.horizontal, Spacing.sm + 2)
            .padding(.vertical, Spacing.xs)
            .background(emotionColor.opacity(0.15))
            .cornerRadius(CornerRadius.sm)
    }
    
    private var emotionText: String {
        switch emotionIndex {
        case 0..<20: return "极度悲观"
        case 20..<40: return "悲观"
        case 40..<60: return "中性"
        case 60..<80: return "乐观"
        default: return "极度贪婪"
        }
    }
    
    private var emotionColor: Color {
        switch emotionIndex {
        case 0..<20: return .pointBlue
        case 20..<40: return .accentCyan
        case 40..<60: return .accentGreen
        case 60..<80: return .accentOrange
        default: return .accentRed
        }
    }
}

// MARK: - 半圆形仪表盘
struct SemicircleGaugeView: View {
    let value: Double // 0-100
    @Binding var animateNeedle: Bool
    
    var body: some View {
        GeometryReader { geometry in
            let center = CGPoint(x: geometry.size.width / 2, y: geometry.size.height)
            let radius = min(geometry.size.width, geometry.size.height * 2) / 2 - 20
            
            ZStack {
                // 背景半圆（渐变色）
                GaugeBackground(center: center, radius: radius)
                
                // 刻度线
                GaugeTicks(center: center, radius: radius)
                
                // 指针
                GaugeNeedle(
                    center: center,
                    radius: radius,
                    value: value,
                    animateNeedle: animateNeedle
                )
                
                // 中心圆点
                Circle()
                    .fill(Color.white)
                    .frame(width: 12, height: 12)
                    .position(center)
                    .shadow(color: .white, radius: 6, x: 0, y: 0)
                
                // 数值显示
                GaugeValueDisplay(value: value, center: center, radius: radius)
            }
        }
    }
}

// MARK: - 仪表盘背景
private struct GaugeBackground: View {
    let center: CGPoint
    let radius: CGFloat
    
    var body: some View {
        Path { path in
            path.addArc(
                center: center,
                radius: radius,
                startAngle: .degrees(180),
                endAngle: .degrees(0),
                clockwise: false
            )
        }
        .stroke(
            AngularGradient(
                gradient: Gradient(colors: [
                    Color.pointBlue,
                    Color.accentCyan,
                    Color.accentGreen,
                    Color.accentOrange,
                    Color.accentRed
                ]),
                center: .center,
                startAngle: .degrees(180),
                endAngle: .degrees(360)
            ),
            style: StrokeStyle(lineWidth: 20, lineCap: .round)
        )
    }
}

// MARK: - 仪表盘刻度
private struct GaugeTicks: View {
    let center: CGPoint
    let radius: CGFloat
    
    var body: some View {
        ForEach(0..<11, id: \.self) { i in
            let angle = 180.0 + Double(i) * 18.0
            let isMainTick = i % 2 == 0
            
            Path { path in
                let startRadius = radius - (isMainTick ? 15 : 10)
                let endRadius = radius + 5
                
                let startPoint = CGPoint(
                    x: center.x + startRadius * cos(angle * .pi / 180),
                    y: center.y + startRadius * sin(angle * .pi / 180)
                )
                let endPoint = CGPoint(
                    x: center.x + endRadius * cos(angle * .pi / 180),
                    y: center.y + endRadius * sin(angle * .pi / 180)
                )
                
                path.move(to: startPoint)
                path.addLine(to: endPoint)
            }
            .stroke(
                Color.white.opacity(isMainTick ? 0.6 : 0.3),
                lineWidth: isMainTick ? 2 : 1
            )
        }
    }
}

// MARK: - 仪表盘指针
private struct GaugeNeedle: View {
    let center: CGPoint
    let radius: CGFloat
    let value: Double
    let animateNeedle: Bool
    
    var body: some View {
        let needleAngle = 180.0 + (animateNeedle ? value : 0) * 1.8
        
        Path { path in
            let needleLength = radius - 10
            let needleEnd = CGPoint(
                x: center.x + needleLength * cos(needleAngle * .pi / 180),
                y: center.y + needleLength * sin(needleAngle * .pi / 180)
            )
            
            path.move(to: center)
            path.addLine(to: needleEnd)
        }
        .stroke(Color.white, style: StrokeStyle(lineWidth: 3, lineCap: .round))
        .shadow(color: .white, radius: 6, x: 0, y: 0)
    }
}

// MARK: - 数值显示
private struct GaugeValueDisplay: View {
    let value: Double
    let center: CGPoint
    let radius: CGFloat
    
    var body: some View {
        VStack(spacing: Spacing.xs) {
            Text(String(format: "%.0f", value))
                .font(.system(size: 32, weight: .bold, design: .monospaced))
                .foregroundColor(.white)
            
            Text("情绪指数")
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.6))
        }
        .position(x: center.x, y: center.y - radius / 2)
    }
}

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        EmotionGaugeSection(emotionIndex: 72)
            .padding()
    }
}
