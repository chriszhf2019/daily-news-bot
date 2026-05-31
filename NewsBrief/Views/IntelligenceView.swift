//
//  IntelligenceView.swift
//  Point - 战略指挥室
//
//  Created by haifangzhao on 2025-01-01.
//  Refactored: 2026-01-20 - 战略指挥室视觉升级
//

import SwiftUI
import UIKit

// MARK: - 情报中心主视图（战略指挥室）
struct IntelligenceView: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @State private var animateOnAppear = false
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                // 顶部：战略指挥室标题
                CommandCenterHeader()
                
                // 24小时情报脉搏大屏图表
                IntelligencePulseSection()
                    .opacity(animateOnAppear ? 1 : 0)
                    .offset(y: animateOnAppear ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.1), value: animateOnAppear)
                
                // 中部：双栏布局
                HStack(alignment: .top, spacing: 16) {
                    // 左栏：叙事风向标（热力图）
                    NarrativeHeatMapSection()
                        .frame(maxWidth: .infinity)
                        .opacity(animateOnAppear ? 1 : 0)
                        .offset(x: animateOnAppear ? 0 : -20)
                        .animation(.easeOut(duration: 0.6).delay(0.2), value: animateOnAppear)
                    
                    // 右栏：贝叶斯概率预测
                    BayesianPredictionSection()
                        .frame(maxWidth: .infinity)
                        .opacity(animateOnAppear ? 1 : 0)
                        .offset(x: animateOnAppear ? 0 : 20)
                        .animation(.easeOut(duration: 0.6).delay(0.3), value: animateOnAppear)
                }
                
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
            .padding(.horizontal, 16)
            .padding(.vertical, 20)
            .padding(.bottom, 100)
        }
        .background(
            // 深海蓝渐变背景
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
        .onAppear {
            viewModel.fetchIntelligenceData()
            withAnimation {
                animateOnAppear = true
            }
        }
    }
}

// MARK: - 战略指挥室标题
struct CommandCenterHeader: View {
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        VStack(spacing: 12) {
            // 主标题
            HStack(spacing: 12) {
                // 霓虹发光图标
                ZStack {
                    Circle()
                        .fill(pointBlue.opacity(0.2))
                        .frame(width: 50, height: 50)
                        .blur(radius: 8)
                    
                    Image(systemName: "chart.bar.doc.horizontal")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(pointBlue)
                        .shadow(color: pointBlue.opacity(0.8), radius: 10, x: 0, y: 0)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("战略指挥室")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Intelligence Command Center")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                        .tracking(1)
                }
                
                Spacer()
                
                // 实时状态指示器
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 8, height: 8)
                        .shadow(color: .green, radius: 4, x: 0, y: 0)
                    
                    Text("LIVE")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.green)
                        .tracking(1)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.green.opacity(0.15))
                .cornerRadius(12)
            }
            
            // 分隔线
            Rectangle()
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.clear,
                            pointBlue.opacity(0.5),
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

// MARK: - 24小时情报脉搏大屏图表（优化版）
struct IntelligencePulseSection: View {
    @State private var animatePulse = false
    private let cyanColor = Color(hex: "06B6D4") // 青色
    
    // 模拟24小时数据
    let hourlyData: [Double] = [
        0.3, 0.4, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9,  // 0-7点
        0.85, 0.75, 0.8, 0.9, 0.95, 0.9, 0.85, 0.8,  // 8-15点
        0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.4, 0.35   // 16-23点
    ]
    
    // 当前情绪指数 (0-100)
    let emotionIndex: Double = 72 // 72 = 偏乐观
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // 标题
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(cyanColor.opacity(0.2))
                        .frame(width: 36, height: 36)
                        .blur(radius: 6)
                    
                    Image(systemName: "waveform.path.ecg")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(cyanColor)
                        .shadow(color: cyanColor, radius: 8, x: 0, y: 0)
                }
                
                VStack(alignment: .leading, spacing: 2) {
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
            
            // 脉搏图表（光滑面积折线图）
            SmoothAreaChartView(data: hourlyData, animatePulse: $animatePulse)
                .frame(height: 180)
            
            // 情绪仪表盘
            EmotionGaugeSection(emotionIndex: emotionIndex)
            
            // 统计数据
            HStack(spacing: 12) {
                PulseStatItem(icon: "newspaper.fill", label: "今日情报", value: "127", color: cyanColor)
                PulseStatItem(icon: "flame.fill", label: "热点事件", value: "23", color: .orange)
                PulseStatItem(icon: "chart.line.uptrend.xyaxis", label: "趋势变化", value: "+15%", color: .green)
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Material.ultraThinMaterial)
                .opacity(0.6)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.white.opacity(0.05))
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            cyanColor.opacity(0.4),
                            cyanColor.opacity(0.1)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .shadow(color: cyanColor.opacity(0.2), radius: 15, x: 0, y: 8)
        .onAppear {
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                animatePulse = true
            }
        }
    }
}

// MARK: - 光滑面积折线图
struct SmoothAreaChartView: View {
    let data: [Double]
    @Binding var animatePulse: Bool
    private let cyanColor = Color(hex: "06B6D4")
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // 背景网格
                Path { path in
                    for i in 0...4 {
                        let y = geometry.size.height / 4 * CGFloat(i)
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: geometry.size.width, y: y))
                    }
                }
                .stroke(Color.white.opacity(0.08), style: StrokeStyle(lineWidth: 0.5, dash: [5, 5]))
                
                // 光滑曲线（使用贝塞尔曲线）
                Path { path in
                    let width = geometry.size.width
                    let height = geometry.size.height
                    let spacing = width / CGFloat(data.count - 1)
                    
                    var points: [CGPoint] = []
                    for (index, value) in data.enumerated() {
                        let x = spacing * CGFloat(index)
                        let y = height - (height * CGFloat(value))
                        points.append(CGPoint(x: x, y: y))
                    }
                    
                    if points.count > 1 {
                        path.move(to: points[0])
                        
                        for i in 1..<points.count {
                            let current = points[i]
                            let previous = points[i - 1]
                            
                            // 计算控制点（平滑曲线）
                            let controlPoint1 = CGPoint(
                                x: previous.x + (current.x - previous.x) * 0.5,
                                y: previous.y
                            )
                            let controlPoint2 = CGPoint(
                                x: previous.x + (current.x - previous.x) * 0.5,
                                y: current.y
                            )
                            
                            path.addCurve(to: current, control1: controlPoint1, control2: controlPoint2)
                        }
                    }
                }
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [cyanColor, cyanColor.opacity(0.8)]),
                        startPoint: .leading,
                        endPoint: .trailing
                    ),
                    style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round)
                )
                .shadow(color: cyanColor, radius: animatePulse ? 10 : 5, x: 0, y: 0)
                
                // 半透明渐变填充
                Path { path in
                    let width = geometry.size.width
                    let height = geometry.size.height
                    let spacing = width / CGFloat(data.count - 1)
                    
                    var points: [CGPoint] = []
                    for (index, value) in data.enumerated() {
                        let x = spacing * CGFloat(index)
                        let y = height - (height * CGFloat(value))
                        points.append(CGPoint(x: x, y: y))
                    }
                    
                    if points.count > 1 {
                        path.move(to: points[0])
                        
                        for i in 1..<points.count {
                            let current = points[i]
                            let previous = points[i - 1]
                            
                            let controlPoint1 = CGPoint(
                                x: previous.x + (current.x - previous.x) * 0.5,
                                y: previous.y
                            )
                            let controlPoint2 = CGPoint(
                                x: previous.x + (current.x - previous.x) * 0.5,
                                y: current.y
                            )
                            
                            path.addCurve(to: current, control1: controlPoint1, control2: controlPoint2)
                        }
                        
                        path.addLine(to: CGPoint(x: width, y: height))
                        path.addLine(to: CGPoint(x: 0, y: height))
                        path.closeSubpath()
                    }
                }
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            cyanColor.opacity(0.4),
                            cyanColor.opacity(0.1),
                            cyanColor.opacity(0.0)
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                
                // 时间标签
                HStack(spacing: 0) {
                    ForEach(Array(stride(from: 0, to: 24, by: 4)), id: \.self) { hour in
                        Text(String(format: "%02d:00", hour))
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundColor(.white.opacity(0.5))
                            .frame(maxWidth: .infinity)
                    }
                }
                .offset(y: geometry.size.height + 12)
            }
        }
    }
}

// MARK: - 情绪仪表盘区域
struct EmotionGaugeSection: View {
    let emotionIndex: Double // 0-100
    @State private var animateNeedle = false
    
    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "gauge.with.dots.needle.67percent")
                    .font(.system(size: 14))
                    .foregroundColor(.yellow)
                    .shadow(color: .yellow, radius: 4, x: 0, y: 0)
                
                Text("市场情绪指数")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                
                Spacer()
                
                Text(emotionLabel)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(emotionColor)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(emotionColor.opacity(0.15))
                    .cornerRadius(8)
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
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(emotionColor.opacity(0.3), lineWidth: 1)
                )
        )
    }
    
    private var emotionLabel: String {
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
        case 0..<20: return Color(hex: "3B82F6") // 冷蓝色
        case 20..<40: return Color(hex: "06B6D4") // 青色
        case 40..<60: return Color(hex: "10B981") // 绿色
        case 60..<80: return Color(hex: "F59E0B") // 橙色
        default: return Color(hex: "EF4444") // 红色（极度贪婪）
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
                            Color(hex: "3B82F6"), // 冷蓝色（极度悲观）
                            Color(hex: "06B6D4"), // 青色
                            Color(hex: "10B981"), // 绿色（中性）
                            Color(hex: "F59E0B"), // 橙色
                            Color(hex: "EF4444")  // 红色（极度贪婪）
                        ]),
                        center: .center,
                        startAngle: .degrees(180),
                        endAngle: .degrees(360)
                    ),
                    style: StrokeStyle(lineWidth: 20, lineCap: .round)
                )
                
                // 刻度线
                ForEach(0..<11, id: \.self) { i in
                    let angle = 180.0 + Double(i) * 18.0 // 每18度一个刻度
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
                    .stroke(Color.white.opacity(isMainTick ? 0.6 : 0.3), lineWidth: isMainTick ? 2 : 1)
                }
                
                // 指针
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
                
                // 中心圆点
                Circle()
                    .fill(Color.white)
                    .frame(width: 12, height: 12)
                    .position(center)
                    .shadow(color: .white, radius: 6, x: 0, y: 0)
                
                // 数值显示
                VStack(spacing: 4) {
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
    }
}

// MARK: - 脉搏图表视图
struct PulseChartView: View {
    let data: [Double]
    @Binding var animatePulse: Bool
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // 背景网格
                Path { path in
                    for i in 0...4 {
                        let y = geometry.size.height / 4 * CGFloat(i)
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: geometry.size.width, y: y))
                    }
                }
                .stroke(Color.white.opacity(0.1), style: StrokeStyle(lineWidth: 0.5, dash: [5, 5]))
                
                // 脉搏曲线
                Path { path in
                    let width = geometry.size.width
                    let height = geometry.size.height
                    let spacing = width / CGFloat(data.count - 1)
                    
                    for (index, value) in data.enumerated() {
                        let x = spacing * CGFloat(index)
                        let y = height - (height * CGFloat(value))
                        
                        if index == 0 {
                            path.move(to: CGPoint(x: x, y: y))
                        } else {
                            path.addLine(to: CGPoint(x: x, y: y))
                        }
                    }
                }
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [Color.cyan, Color.blue]),
                        startPoint: .leading,
                        endPoint: .trailing
                    ),
                    style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round)
                )
                .shadow(color: .cyan, radius: animatePulse ? 8 : 4, x: 0, y: 0)
                
                // 填充区域
                Path { path in
                    let width = geometry.size.width
                    let height = geometry.size.height
                    let spacing = width / CGFloat(data.count - 1)
                    
                    for (index, value) in data.enumerated() {
                        let x = spacing * CGFloat(index)
                        let y = height - (height * CGFloat(value))
                        
                        if index == 0 {
                            path.move(to: CGPoint(x: x, y: y))
                        } else {
                            path.addLine(to: CGPoint(x: x, y: y))
                        }
                    }
                    
                    path.addLine(to: CGPoint(x: geometry.size.width, y: height))
                    path.addLine(to: CGPoint(x: 0, y: height))
                    path.closeSubpath()
                }
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.cyan.opacity(0.3),
                            Color.cyan.opacity(0.05)
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                
                // 时间标签
                HStack(spacing: 0) {
                    ForEach(Array(stride(from: 0, to: 24, by: 4)), id: \.self) { hour in
                        Text(String(format: "%02d:00", hour))
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundColor(.white.opacity(0.5))
                            .frame(maxWidth: .infinity)
                    }
                }
                .offset(y: geometry.size.height + 12)
            }
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
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 16))
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
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(color.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(color.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

// MARK: - 叙事风向标（热力图 Treemap）- 左栏
struct NarrativeHeatMapSection: View {
    @State private var selectedNarrative: NarrativeItem?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            HStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.orange.opacity(0.2))
                        .frame(width: 32, height: 32)
                        .blur(radius: 6)
                    
                    Image(systemName: "flame.fill")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.orange)
                        .shadow(color: .orange, radius: 6, x: 0, y: 0)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("叙事风向标")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Narrative Tracker")
                        .font(.system(size: 9))
                        .foregroundColor(.white.opacity(0.5))
                        .tracking(0.5)
                }
            }
            
            // 方块热力图（Treemap）
            NarrativeTreemapView(narratives: narrativeItems, selectedNarrative: $selectedNarrative)
                .frame(height: 280)
            
            // 说明文字
            Text("方块大小 = 热度 · 颜色深度 = 增长速度")
                .font(.system(size: 10))
                .foregroundColor(.white.opacity(0.5))
                .padding(.top, 4)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Material.ultraThinMaterial)
                .opacity(0.6)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.white.opacity(0.05))
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.orange.opacity(0.4),
                            Color.orange.opacity(0.1)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .shadow(color: Color.orange.opacity(0.2), radius: 12, x: 0, y: 6)
        .sheet(item: $selectedNarrative) { narrative in
            NarrativeStorySheet(narrative: narrative)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
    }
    
    // 叙事数据
    private var narrativeItems: [NarrativeItem] {
        [
            NarrativeItem(
                id: UUID(),
                title: "AI革命",
                score: 92,
                trend: .rising,
                spreadRate: 4.5,
                industries: ["科技", "教育", "医疗"],
                description: "GPT-5的发布标志着AI技术进入新阶段，从技术圈快速扩散至大众金融圈，社交媒体讨论量24小时内增长300%",
                spreadPath: [
                    SpreadNode(industry: "科技圈", intensity: 95, time: "今日 08:00"),
                    SpreadNode(industry: "金融圈", intensity: 85, time: "今日 10:00"),
                    SpreadNode(industry: "教育圈", intensity: 78, time: "今日 12:00"),
                    SpreadNode(industry: "大众媒体", intensity: 72, time: "今日 14:00")
                ],
                relatedNews: ["OpenAI发布GPT-5"]
            ),
            NarrativeItem(
                id: UUID(),
                title: "自动驾驶商业化",
                score: 88,
                trend: .rising,
                spreadRate: 3.8,
                industries: ["汽车", "出行", "保险"],
                description: "Robotaxi在全球50城运营，正在从科技和金融圈扩散至政策制定者和普通消费者",
                spreadPath: [
                    SpreadNode(industry: "汽车行业", intensity: 90, time: "今日 09:00"),
                    SpreadNode(industry: "出行平台", intensity: 88, time: "今日 10:30"),
                    SpreadNode(industry: "保险公司", intensity: 75, time: "今日 12:00")
                ],
                relatedNews: ["特斯拉Robotaxi全球运营"]
            ),
            NarrativeItem(
                id: UUID(),
                title: "新能源转型",
                score: 90,
                trend: .rising,
                spreadRate: 4.2,
                industries: ["能源", "汽车", "环保"],
                description: "固态电池量产引发新能源革命，正在从汽车圈快速扩散至主流消费者",
                spreadPath: [
                    SpreadNode(industry: "汽车制造", intensity: 95, time: "今日 10:00"),
                    SpreadNode(industry: "能源行业", intensity: 85, time: "今日 11:00"),
                    SpreadNode(industry: "环保组织", intensity: 78, time: "今日 13:00")
                ],
                relatedNews: ["比亚迪固态电池量产"]
            ),
            NarrativeItem(
                id: UUID(),
                title: "货币政策转向",
                score: 75,
                trend: .stable,
                spreadRate: 2.8,
                industries: ["金融", "房地产"],
                description: "美联储维持利率，降息预期在金融圈保持高热度",
                spreadPath: [
                    SpreadNode(industry: "金融机构", intensity: 92, time: "今日 12:00"),
                    SpreadNode(industry: "房地产", intensity: 80, time: "今日 13:00")
                ],
                relatedNews: ["美联储维持利率"]
            ),
            NarrativeItem(
                id: UUID(),
                title: "量子计算突破",
                score: 68,
                trend: .rising,
                spreadRate: 3.2,
                industries: ["科技", "科研"],
                description: "IBM量子计算芯片突破，正在科研圈引发关注",
                spreadPath: [
                    SpreadNode(industry: "科研机构", intensity: 88, time: "今日 11:00"),
                    SpreadNode(industry: "科技公司", intensity: 75, time: "今日 13:00")
                ],
                relatedNews: ["IBM发布量子芯片"]
            )
        ]
    }
}

// MARK: - 方块热力图（Treemap）
struct NarrativeTreemapView: View {
    let narratives: [NarrativeItem]
    @Binding var selectedNarrative: NarrativeItem?
    
    var body: some View {
        GeometryReader { geometry in
            let layout = calculateTreemapLayout(narratives: narratives, size: geometry.size)
            
            ZStack {
                ForEach(Array(layout.enumerated()), id: \.offset) { index, rect in
                    let narrative = narratives[index]
                    
                    NarrativeTreemapBlock(
                        narrative: narrative,
                        frame: rect
                    )
                    .onTapGesture {
                        selectedNarrative = narrative
                        let generator = UIImpactFeedbackGenerator(style: .medium)
                        generator.impactOccurred()
                    }
                }
            }
        }
    }
    
    // 计算Treemap布局（简化版）
    private func calculateTreemapLayout(narratives: [NarrativeItem], size: CGSize) -> [CGRect] {
        var rects: [CGRect] = []
        let totalScore = narratives.reduce(0) { $0 + $1.score }
        
        var currentY: CGFloat = 0
        var currentX: CGFloat = 0
        let padding: CGFloat = 4
        
        // 简化布局：按行排列
        var rowNarratives: [[NarrativeItem]] = []
        var currentRow: [NarrativeItem] = []
        var currentRowScore = 0
        
        for narrative in narratives {
            if currentRowScore + narrative.score > totalScore / 2 && !currentRow.isEmpty {
                rowNarratives.append(currentRow)
                currentRow = [narrative]
                currentRowScore = narrative.score
            } else {
                currentRow.append(narrative)
                currentRowScore += narrative.score
            }
        }
        if !currentRow.isEmpty {
            rowNarratives.append(currentRow)
        }
        
        // 计算每行的高度和每个方块的宽度
        for row in rowNarratives {
            let rowScore = row.reduce(0) { $0 + $1.score }
            let rowHeight = size.height * CGFloat(rowScore) / CGFloat(totalScore) - padding
            
            currentX = 0
            for narrative in row {
                let blockWidth = size.width * CGFloat(narrative.score) / CGFloat(rowScore) - padding
                
                rects.append(CGRect(
                    x: currentX,
                    y: currentY,
                    width: blockWidth,
                    height: rowHeight
                ))
                
                currentX += blockWidth + padding
            }
            
            currentY += rowHeight + padding
        }
        
        return rects
    }
}

// MARK: - 方块热力图单元
struct NarrativeTreemapBlock: View {
    let narrative: NarrativeItem
    let frame: CGRect
    
    var body: some View {
        ZStack {
            // 背景（颜色深度代表增长速度）
            RoundedRectangle(cornerRadius: 8)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            blockColor.opacity(colorIntensity),
                            blockColor.opacity(colorIntensity * 0.7)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(blockColor.opacity(0.5), lineWidth: 1)
                )
                .shadow(color: blockColor.opacity(0.3), radius: 6, x: 0, y: 3)
            
            // 内容
            VStack(spacing: 4) {
                // 标题
                Text(narrative.title)
                    .font(.system(size: titleFontSize, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                
                // 热力值
                Text("\(narrative.score)")
                    .font(.system(size: scoreFontSize, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
                    .shadow(color: .white, radius: 4, x: 0, y: 0)
                
                // 趋势和速度
                HStack(spacing: 4) {
                    Text(narrative.trend.symbol)
                        .font(.system(size: 10))
                    
                    Text("×\(String(format: "%.1f", narrative.spreadRate))")
                        .font(.system(size: 10, weight: .medium, design: .monospaced))
                        .foregroundColor(.white.opacity(0.9))
                }
            }
            .padding(8)
        }
        .frame(width: frame.width, height: frame.height)
        .position(x: frame.midX, y: frame.midY)
    }
    
    // 根据增长速度计算颜色深度
    private var colorIntensity: Double {
        min(narrative.spreadRate / 5.0, 1.0)
    }
    
    // 根据趋势选择颜色
    private var blockColor: Color {
        switch narrative.trend {
        case .rising: return Color.orange
        case .stable: return Color.yellow
        case .falling: return Color.gray
        }
    }
    
    // 根据方块大小调整字体
    private var titleFontSize: CGFloat {
        if frame.width > 120 { return 13 }
        if frame.width > 80 { return 11 }
        return 9
    }
    
    private var scoreFontSize: CGFloat {
        if frame.width > 120 { return 24 }
        if frame.width > 80 { return 18 }
        return 14
    }
}

// MARK: - 叙事故事弹窗（口语化解释）
struct NarrativeStorySheet: View {
    let narrative: NarrativeItem
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            // 深海蓝渐变背景
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    // 顶部装饰
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.white.opacity(0.3))
                        .frame(width: 40, height: 5)
                        .padding(.top, 8)
                    
                    // 标题
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(
                                    RadialGradient(
                                        gradient: Gradient(colors: [
                                            narrative.trend.color.opacity(0.6),
                                            narrative.trend.color.opacity(0.3)
                                        ]),
                                        center: .center,
                                        startRadius: 0,
                                        endRadius: 40
                                    )
                                )
                                .frame(width: 80, height: 80)
                            
                            Text("\(narrative.score)")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.white)
                        }
                        
                        Text(narrative.title)
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)
                    }
                    
                    // 口语化解释
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(spacing: 8) {
                            Image(systemName: "bubble.left.and.bubble.right.fill")
                                .foregroundColor(.orange)
                            
                            Text("这个故事正在如何被大众点透？")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        
                        Text(generateStoryExplanation())
                            .font(.system(size: 15))
                            .foregroundColor(.white.opacity(0.9))
                            .lineSpacing(8)
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Material.ultraThinMaterial)
                            .opacity(0.5)
                    )
                    
                    // 传播路径
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(spacing: 8) {
                            Image(systemName: "arrow.triangle.branch")
                                .foregroundColor(.cyan)
                            
                            Text("传播路径")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        
                        ForEach(Array(narrative.spreadPath.enumerated()), id: \.offset) { index, node in
                            HStack(spacing: 12) {
                                // 连接线
                                VStack(spacing: 0) {
                                    Circle()
                                        .fill(Color.cyan)
                                        .frame(width: 10, height: 10)
                                    
                                    if index < narrative.spreadPath.count - 1 {
                                        Rectangle()
                                            .fill(Color.cyan.opacity(0.3))
                                            .frame(width: 2, height: 30)
                                    }
                                }
                                
                                // 节点信息
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(node.industry)
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundColor(.white)
                                        
                                        Spacer()
                                        
                                        Text("\(node.intensity)%")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(.cyan)
                                    }
                                    
                                    Text(node.time)
                                        .font(.caption2)
                                        .foregroundColor(.white.opacity(0.6))
                                }
                                .padding(12)
                                .frame(maxWidth: .infinity)
                                .background(Color.cyan.opacity(0.1))
                                .cornerRadius(10)
                            }
                        }
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Material.ultraThinMaterial)
                            .opacity(0.5)
                    )
                    
                    // 关闭按钮
                    Button(action: {
                        dismiss()
                        let generator = UIImpactFeedbackGenerator(style: .light)
                        generator.impactOccurred()
                    }) {
                        Text("关闭")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(
                                    gradient: Gradient(colors: [Color.orange, Color.red]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
    }
    
    // 生成口语化解释
    private func generateStoryExplanation() -> String {
        let speedDesc = narrative.spreadRate > 4.0 ? "超快速度" : narrative.spreadRate > 3.0 ? "快速" : "稳定"
        let trendDesc = narrative.trend == .rising ? "热度持续上升" : narrative.trend == .stable ? "热度保持稳定" : "热度开始下降"
        
        return """
        这个话题正在以\(speedDesc)在不同圈层传播，\(trendDesc)。
        
        它最早在\(narrative.spreadPath.first?.industry ?? "专业圈")引发关注（热度\(narrative.spreadPath.first?.intensity ?? 0)%），然后快速扩散到\(narrative.spreadPath.count > 1 ? narrative.spreadPath[1].industry : "其他领域")。
        
        现在，这个故事已经从小圈子走向大众视野，社交媒体上的讨论量激增，主流媒体也开始跟进报道。
        
        简单来说：\(narrative.description)
        """
    }
}

// MARK: - 叙事热力卡片（精简版）
struct NarrativeHeatCard: View {
    let narrative: NarrativeItem
    let rank: Int
    
    var body: some View {
        HStack(spacing: 12) {
            // 排名徽章
            ZStack {
                Circle()
                    .fill(rankGradient(rank))
                    .frame(width: 32, height: 32)
                    .shadow(color: rankColor(rank).opacity(0.5), radius: 6, x: 0, y: 0)
                
                Text("\(rank)")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }
            
            // 叙事信息
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(narrative.title)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Text(narrative.trend.symbol)
                        .font(.caption2)
                }
                
                // 行业标签
                HStack(spacing: 4) {
                    ForEach(narrative.industries.prefix(2), id: \.self) { industry in
                        Text(industry)
                            .font(.system(size: 9))
                            .foregroundColor(.white.opacity(0.7))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.white.opacity(0.15))
                            .cornerRadius(4)
                    }
                }
            }
            
            Spacer()
            
            // 热力值
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(narrative.score)")
                    .font(.system(size: 20, weight: .bold, design: .monospaced))
                    .foregroundColor(narrative.trend.color)
                    .shadow(color: narrative.trend.color, radius: 4, x: 0, y: 0)
                
                Text("×\(String(format: "%.1f", narrative.spreadRate))")
                    .font(.system(size: 9, design: .monospaced))
                    .foregroundColor(.white.opacity(0.5))
            }
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(narrative.trend.color.opacity(0.2), lineWidth: 1)
                )
        )
    }
    
    private func rankColor(_ rank: Int) -> Color {
        switch rank {
        case 1: return Color(hex: "FFD700")
        case 2: return Color(hex: "C0C0C0")
        case 3: return Color(hex: "CD7F32")
        default: return .gray
        }
    }
    
    private func rankGradient(_ rank: Int) -> LinearGradient {
        let color = rankColor(rank)
        return LinearGradient(
            gradient: Gradient(colors: [color, color.opacity(0.7)]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

// MARK: - 贝叶斯概率预测 - 右栏
struct BayesianPredictionSection: View {
    @State private var selectedPrediction: BayesianPrediction?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            HStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.purple.opacity(0.2))
                        .frame(width: 32, height: 32)
                        .blur(radius: 6)
                    
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.purple)
                        .shadow(color: .purple, radius: 6, x: 0, y: 0)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("贝叶斯预测")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Bayesian Meter")
                        .font(.system(size: 9))
                        .foregroundColor(.white.opacity(0.5))
                        .tracking(0.5)
                }
            }
            
            // 预测列表
            VStack(spacing: 10) {
                ForEach(bayesianPredictions.prefix(3)) { prediction in
                    BayesianPredictionCard(prediction: prediction)
                        .onTapGesture {
                            selectedPrediction = prediction
                            let generator = UIImpactFeedbackGenerator(style: .medium)
                            generator.impactOccurred()
                        }
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Material.ultraThinMaterial)
                .opacity(0.6)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.white.opacity(0.05))
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.purple.opacity(0.4),
                            Color.purple.opacity(0.1)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .shadow(color: Color.purple.opacity(0.2), radius: 12, x: 0, y: 6)
        .sheet(item: $selectedPrediction) { prediction in
            BayesianDetailSheet(prediction: prediction)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
    }
    
    // 贝叶斯预测数据
    private var bayesianPredictions: [BayesianPrediction] {
        [
            BayesianPrediction(
                id: UUID(),
                target: "AGI在2030年前实现",
                currentProb: 65,
                shift: 8,
                previousProb: 57,
                affectedBy: "OpenAI发布GPT-5",
                newsId: "1",
                trendData: [52, 54, 57, 58, 60, 62, 65],
                confidence: .high,
                category: "AI技术"
            ),
            BayesianPrediction(
                id: UUID(),
                target: "2028年Robotaxi市场突破1000亿美元",
                currentProb: 72,
                shift: 12,
                previousProb: 60,
                affectedBy: "特斯拉Robotaxi全球运营",
                newsId: "2",
                trendData: [55, 58, 60, 62, 65, 68, 72],
                confidence: .high,
                category: "自动驾驶"
            ),
            BayesianPrediction(
                id: UUID(),
                target: "2027年电动车渗透率突破50%",
                currentProb: 68,
                shift: 20,
                previousProb: 48,
                affectedBy: "比亚迪固态电池量产",
                newsId: "3",
                trendData: [40, 42, 45, 48, 52, 58, 68],
                confidence: .medium,
                category: "新能源"
            )
        ]
    }
}

// MARK: - 贝叶斯预测卡片（精简版）
struct BayesianPredictionCard: View {
    let prediction: BayesianPrediction
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // 分类标签
            Text(prediction.category)
                .font(.system(size: 9))
                .foregroundColor(pointBlue)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(pointBlue.opacity(0.15))
                .cornerRadius(4)
            
            // 预测目标
            Text(prediction.target)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(2)
            
            // 概率和趋势
            HStack(spacing: 12) {
                // 概率
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text("\(prediction.currentProb)")
                        .font(.system(size: 24, weight: .bold, design: .monospaced))
                        .foregroundColor(pointBlue)
                        .shadow(color: pointBlue, radius: 4, x: 0, y: 0)
                    
                    Text("%")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(pointBlue.opacity(0.8))
                }
                
                Spacer()
                
                // 变化
                HStack(spacing: 4) {
                    Image(systemName: prediction.isPositive ? "arrow.up.right" : "arrow.down.right")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(prediction.isPositive ? .green : .red)
                    
                    Text("\(prediction.isPositive ? "+" : "")\(prediction.shift)%")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundColor(prediction.isPositive ? .green : .red)
                }
            }
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(pointBlue.opacity(0.2), lineWidth: 1)
                )
        )
    }
}

// MARK: - 专题情报包（大卡片 + 微型时间线）
struct TopicIntelPackSection: View {
    @EnvironmentObject var viewModel: NewsViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            HStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.green.opacity(0.2))
                        .frame(width: 32, height: 32)
                        .blur(radius: 6)
                    
                    Image(systemName: "folder.fill.badge.gearshape")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.green)
                        .shadow(color: .green, radius: 6, x: 0, y: 0)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("专题情报包")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Topic Intelligence Packages")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.5))
                        .tracking(0.5)
                }
            }
            
            // 专题列表
            if let topics = viewModel.intelligenceData?.topics {
                ForEach(topics.prefix(3), id: \.id) { topic in
                    TopicIntelPackCard(topic: topic)
                }
            } else {
                // 加载占位符
                ForEach(0..<2, id: \.self) { _ in
                    TopicIntelPackPlaceholder()
                }
            }
        }
    }
}

// MARK: - 专题情报包卡片（完整版 - 带涟漪路径图和贝叶斯预测）
struct TopicIntelPackCard: View {
    let topic: News.Topic
    @EnvironmentObject var viewModel: NewsViewModel
    @State private var isExpanded = false
    
    // 从关联新闻中提取intel_pro数据
    private var relatedNewsWithIntelPro: [News] {
        viewModel.news.filter { news in
            topic.subNews.contains { $0.newsId == news.id }
        }
    }
    
    // 聚合涟漪效应数据
    private var aggregatedRipples: [(level: String, effects: [String])] {
        var firstOrder: [String] = []
        var secondOrder: [String] = []
        var thirdOrder: [String] = []
        
        for news in relatedNewsWithIntelPro {
            if let intelPro = news.intelPro {
                for ripple in intelPro.ripples {
                    if ripple.level.contains("一阶") {
                        firstOrder.append(ripple.content)
                    } else if ripple.level.contains("二阶") {
                        secondOrder.append(ripple.content)
                    } else if ripple.level.contains("三阶") {
                        thirdOrder.append(ripple.content)
                    }
                }
            }
        }
        
        return [
            ("一阶(直接)", firstOrder),
            ("二阶(联动)", secondOrder),
            ("三阶(长远)", thirdOrder)
        ]
    }
    
    // 聚合贝叶斯预测数据
    private var aggregatedBayesian: [(target: String, shift: String, prob: String)] {
        relatedNewsWithIntelPro.compactMap { news in
            if let intelPro = news.intelPro {
                return (
                    target: intelPro.bayesianUpdate.target,
                    shift: intelPro.bayesianUpdate.shift,
                    prob: intelPro.bayesianUpdate.currentProb
                )
            }
            return nil
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 顶部：分类和重要度
            HStack(spacing: 8) {
                Text(topic.category)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(Color(hex: "3B82F6"))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color(hex: "3B82F6").opacity(0.15))
                    .cornerRadius(6)
                
                Spacer()
                
                // 重要度指示器
                HStack(spacing: 4) {
                    ForEach(0..<min(topic.impactLevel / 2, 5), id: \.self) { _ in
                        Circle()
                            .fill(Color.orange)
                            .frame(width: 6, height: 6)
                            .shadow(color: .orange, radius: 3, x: 0, y: 0)
                    }
                }
            }
            
            // 专题标题
            Text(topic.title)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(2)
            
            // AI摘要
            Text(topic.aiSummary)
                .font(.system(size: 13))
                .foregroundColor(.white.opacity(0.85))
                .lineSpacing(5)
                .lineLimit(isExpanded ? nil : 3)
            
            // 微型时间线
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 6) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.system(size: 12))
                        .foregroundColor(.cyan)
                    
                    Text("关联事件时间线")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.cyan)
                }
                
                // 时间线节点
                VStack(spacing: 8) {
                    ForEach(Array(topic.subNews.prefix(3).enumerated()), id: \.offset) { index, subNews in
                        MiniTimelineNode(
                            title: subNews.title,
                            isLast: index == min(topic.subNews.count, 3) - 1
                        )
                    }
                }
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.cyan.opacity(0.08))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color.cyan.opacity(0.2), lineWidth: 1)
                    )
            )
            
            // 展开内容：涟漪路径图 + 贝叶斯预测
            if isExpanded {
                VStack(alignment: .leading, spacing: 16) {
                    // 涟漪路径图
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 6) {
                            Image(systemName: "water.waves")
                                .font(.system(size: 12))
                                .foregroundColor(.purple)
                            
                            Text("专题涟漪路径图")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.purple)
                        }
                        
                        // 三阶效应展示
                        ForEach(Array(aggregatedRipples.enumerated()), id: \.offset) { index, ripple in
                            if !ripple.effects.isEmpty {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack(spacing: 8) {
                                        // 圆点指示器
                                        Circle()
                                            .fill(rippleColor(for: index))
                                            .frame(width: 10, height: 10)
                                            .shadow(color: rippleColor(for: index), radius: index == 2 ? 6 : 3, x: 0, y: 0)
                                        
                                        Text(ripple.level)
                                            .font(.system(size: 11, weight: .semibold))
                                            .foregroundColor(.white)
                                    }
                                    
                                    // 效应列表
                                    ForEach(Array(ripple.effects.prefix(2).enumerated()), id: \.offset) { _, effect in
                                        Text("• \(effect)")
                                            .font(.system(size: 11))
                                            .foregroundColor(.white.opacity(0.8))
                                            .padding(.leading, 18)
                                    }
                                }
                                .padding(.vertical, 4)
                            }
                        }
                    }
                    .padding(14)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color.purple.opacity(0.08))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(Color.purple.opacity(0.2), lineWidth: 1)
                            )
                    )
                    .transition(.opacity.combined(with: .move(edge: .top)))
                    
                    // 贝叶斯预测概率
                    if !aggregatedBayesian.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(spacing: 6) {
                                Image(systemName: "chart.line.uptrend.xyaxis")
                                    .font(.system(size: 12))
                                    .foregroundColor(Color(hex: "3B82F6"))
                                
                                Text("预测概率调整")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(Color(hex: "3B82F6"))
                            }
                            
                            ForEach(Array(aggregatedBayesian.prefix(2).enumerated()), id: \.offset) { _, prediction in
                                HStack(spacing: 8) {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(prediction.target)
                                            .font(.system(size: 11))
                                            .foregroundColor(.white.opacity(0.9))
                                            .lineLimit(2)
                                        
                                        HStack(spacing: 8) {
                                            HStack(spacing: 4) {
                                                Text("当前概率:")
                                                    .font(.system(size: 10))
                                                    .foregroundColor(.white.opacity(0.6))
                                                
                                                Text(prediction.prob)
                                                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                                                    .foregroundColor(Color(hex: "3B82F6"))
                                            }
                                            
                                            HStack(spacing: 4) {
                                                Image(systemName: prediction.shift.contains("+") ? "arrow.up" : "arrow.down")
                                                    .font(.system(size: 9))
                                                    .foregroundColor(prediction.shift.contains("+") ? .green : .red)
                                                
                                                Text(prediction.shift)
                                                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                                                    .foregroundColor(prediction.shift.contains("+") ? .green : .red)
                                            }
                                        }
                                    }
                                    
                                    Spacer()
                                }
                                .padding(10)
                                .background(
                                    RoundedRectangle(cornerRadius: 8)
                                        .fill(Color.white.opacity(0.05))
                                )
                            }
                        }
                        .padding(14)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color(hex: "3B82F6").opacity(0.08))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color(hex: "3B82F6").opacity(0.2), lineWidth: 1)
                                )
                        )
                        .transition(.opacity.combined(with: .move(edge: .top)))
                    }
                }
            }
            
            // 底部：统计和操作
            HStack(spacing: 16) {
                HStack(spacing: 6) {
                    Image(systemName: "newspaper")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.6))
                    
                    Text("\(topic.relatedNewsCount) 条关联")
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.6))
                }
                
                Spacer()
                
                Button(action: {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        isExpanded.toggle()
                    }
                    let generator = UIImpactFeedbackGenerator(style: .light)
                    generator.impactOccurred()
                }) {
                    HStack(spacing: 4) {
                        Text(isExpanded ? "收起" : "展开详情")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(Color(hex: "3B82F6"))
                        
                        Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(Color(hex: "3B82F6"))
                    }
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Material.ultraThinMaterial)
                .opacity(0.6)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.white.opacity(0.05))
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.green.opacity(0.3),
                            Color.green.opacity(0.1)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .shadow(color: Color.green.opacity(0.15), radius: 10, x: 0, y: 5)
    }
    
    // 涟漪效应颜色
    private func rippleColor(for index: Int) -> Color {
        switch index {
        case 0: return Color(hex: "06B6D4") // 淡蓝色（一阶）
        case 1: return Color.purple // 紫色（二阶）
        case 2: return Color.orange // 橙色（三阶）
        default: return Color.gray
        }
    }
}

// MARK: - 微型时间线节点
struct MiniTimelineNode: View {
    let title: String
    let isLast: Bool
    
    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            // 时间线指示器
            VStack(spacing: 0) {
                Circle()
                    .fill(Color.cyan)
                    .frame(width: 8, height: 8)
                    .shadow(color: .cyan, radius: 3, x: 0, y: 0)
                
                if !isLast {
                    Rectangle()
                        .fill(Color.cyan.opacity(0.3))
                        .frame(width: 2, height: 20)
                }
            }
            
            // 事件标题
            Text(title)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.85))
                .lineLimit(2)
        }
    }
}

// MARK: - 专题占位符
struct TopicIntelPackPlaceholder: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Rectangle()
                .fill(Color.white.opacity(0.1))
                .frame(height: 20)
                .cornerRadius(4)
            
            Rectangle()
                .fill(Color.white.opacity(0.08))
                .frame(height: 60)
                .cornerRadius(4)
            
            Rectangle()
                .fill(Color.white.opacity(0.06))
                .frame(height: 40)
                .cornerRadius(4)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.05))
        )
    }
}

// MARK: - 点透AI署名组件
struct PointAISignatureView: View {
    @State private var showFeedback = false
    @State private var feedbackType: FeedbackType?
    
    enum FeedbackType {
        case like, question
    }
    
    var body: some View {
        VStack(spacing: 16) {
            // 分隔线
            Rectangle()
                .fill(Color.white.opacity(0.2))
                .frame(height: 1)
                .padding(.horizontal, 40)
            
            // 署名
            VStack(spacing: 8) {
                Text("—— 你的私人情报员：点透")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(Color(hex: "3B82F6"))
                
                Text("复杂的世界，点透给你看")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.6))
            }
            
            // 互动按钮
            HStack(spacing: 24) {
                // 点赞按钮
                Button(action: {
                    feedbackType = .like
                    showFeedback = true
                    let generator = UIImpactFeedbackGenerator(style: .light)
                    generator.impactOccurred()
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: feedbackType == .like ? "hand.thumbsup.fill" : "hand.thumbsup")
                            .foregroundColor(feedbackType == .like ? Color(hex: "3B82F6") : .white.opacity(0.7))
                        Text("有帮助")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(20)
                }
                
                // 提问按钮
                Button(action: {
                    feedbackType = .question
                    showFeedback = true
                    let generator = UIImpactFeedbackGenerator(style: .light)
                    generator.impactOccurred()
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: "questionmark.circle")
                            .foregroundColor(.white.opacity(0.7))
                        Text("有疑问？问问我")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(20)
                }
            }
            
            // 反馈提示
            if showFeedback {
                Text(feedbackType == .like ? "感谢你的认可！点透会继续努力 💪" : "功能开发中，敬请期待...")
                    .font(.caption)
                    .foregroundColor(Color(hex: "3B82F6"))
                    .transition(.opacity)
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            withAnimation {
                                showFeedback = false
                            }
                        }
                    }
            }
        }
        .padding(.vertical, 20)
    }
}

// MARK: - 今日综述组件
struct TodayBriefSection: View {
    @EnvironmentObject var viewModel: NewsViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            HStack(spacing: 8) {
                Text("📅 今日综述")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Spacer()
                Text("AI生成")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(Color.white.opacity(0.2))
                    .cornerRadius(12)
            }
            
            // 综述内容
            Text("今日重要新闻综述：AI技术持续突破，全球科技巨头加大投资力度，新能源领域发展迅速。")
                .font(.body)
                .foregroundColor(.white.opacity(0.9))
                .lineSpacing(6)
        }
        .padding(20)
        .background(
            // 深色背景
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "1E293B"), Color(hex: "334155")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .background(Material.regularMaterial)
        )
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
    }
}

// MARK: - 数据看板组件
struct TrendDashboardSection: View {
    @EnvironmentObject var viewModel: NewsViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            HStack(spacing: 8) {
                Text("📊 数据看板")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Spacer()
                Text("24小时")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
            }
            
            // 24小时密度图
            VStack(spacing: 12) {
                Text("新闻发布密度")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                
                // 24小时密度图
                DensityChartView()
                    .frame(height: 120)
            }
            
            // 情绪仪表盘
            VStack(spacing: 12) {
                Text("情绪仪表盘")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                
                HStack(spacing: 16) {
                    EmotionGaugeView(emotion: "积极", value: 0.65, color: .green)
                    EmotionGaugeView(emotion: "中性", value: 0.25, color: .gray)
                    EmotionGaugeView(emotion: "消极", value: 0.10, color: .red)
                }
            }
        }
        .padding(16)
        .background(
            // 玻璃拟态效果
            Color.white.opacity(0.1)
                .background(Material.thinMaterial)
        )
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
    }
}

// MARK: - 24小时密度图
struct DensityChartView: View {
    // 模拟数据
    let data: [Double] = Array(repeating: 0.0, count: 24).indices.map { index in
        // 生成模拟密度数据
        let hour = Double(index)
        let baseValue = sin(hour * 0.3) * 0.4 + 0.5
        let noise = Double.random(in: -0.1...0.1)
        return max(0, min(1, baseValue + noise))
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // 背景网格
                Path {
                    path in
                    for i in 0...4 {
                        let y = geometry.size.height - (geometry.size.height / 4) * Double(i)
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: geometry.size.width, y: y))
                    }
                }
                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                
                // 密度曲线
                Path {
                    path in
                    let width = geometry.size.width
                    let height = geometry.size.height
                    let spacing = width / 23
                    
                    for i in data.indices {
                        let x = spacing * Double(i)
                        let y = height - (height * data[i])
                        
                        if i == 0 {
                            path.move(to: CGPoint(x: x, y: y))
                        } else {
                            path.addLine(to: CGPoint(x: x, y: y))
                        }
                    }
                }
                .stroke(Color(hex: "3B82F6"), lineWidth: 2)
                
                // 填充区域
                Path {
                    path in
                    let width = geometry.size.width
                    let height = geometry.size.height
                    let spacing = width / 23
                    
                    for i in data.indices {
                        let x = spacing * Double(i)
                        let y = height - (height * data[i])
                        
                        if i == 0 {
                            path.move(to: CGPoint(x: x, y: y))
                        } else {
                            path.addLine(to: CGPoint(x: x, y: y))
                        }
                    }
                    
                    // 连接底部
                    path.addLine(to: CGPoint(x: width, y: height))
                    path.addLine(to: CGPoint(x: 0, y: height))
                    path.closeSubpath()
                }
                .fill(Color(hex: "3B82F6").opacity(0.3))
                
                // 小时标签
                HStack {
                    ForEach(Array(stride(from: 0, to: 24, by: 4)), id: \.self) {
                        hour in
                        Text("\(hour):00")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.7))
                            .frame(maxWidth: .infinity)
                    }
                }
                .padding(.horizontal, -8)
                .offset(y: geometry.size.height + 8)
            }
        }
    }
}

// MARK: - 情绪仪表盘
struct EmotionGaugeView: View {
    let emotion: String
    let value: Double
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Text(emotion)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.white.opacity(0.8))
            
            GeometryReader { geometry in
                VStack {
                    // 仪表盘
                    ZStack {
                        // 背景圆环
                        Circle()
                            .stroke(Color.secondary.opacity(0.2), lineWidth: 8)
                        
                        // 进度圆环
                        Circle()
                            .trim(from: 0.0, to: CGFloat(value))
                            .stroke(color, lineWidth: 8)
                            .rotationEffect(.degrees(-90))
                            .animation(.easeInOut(duration: 1), value: value)
                        
                        // 百分比文字
                        Text(String(format: "%.0f%%", value * 100))
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(color)
                    }
                    .frame(width: geometry.size.width, height: geometry.size.width)
                }
            }
            .aspectRatio(1, contentMode: .fit)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - 专题报告组件
struct TopicReportsSection: View {
    @EnvironmentObject var viewModel: NewsViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            Text("📌 专题报告")
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            // 专题报告列表
            if let topics = viewModel.intelligenceData?.topics {
                ForEach(topics, id: \.id) {
                    topic in
                    TopicReportCard(topic: topic)
                }
            } else {
                ProgressView()
                    .padding(.vertical, 20)
            }
        }
    }
}

// MARK: - 全球趋势概率仪组件（贝叶斯更新）
struct TrendPulseSection: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @State private var selectedTrend: BayesianPrediction?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            HStack(spacing: 8) {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 18))
                    .foregroundColor(Color(hex: "3B82F6"))
                
                Text("全球趋势概率仪")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Spacer()
                
                Text("Bayesian Meter")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.6))
            }
            
            // 副标题
            Text("长期重大预测 · 实时概率更新")
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
            
            // 趋势列表
            VStack(spacing: 12) {
                ForEach(bayesianPredictions) { prediction in
                    BayesianMeterCard(prediction: prediction)
                        .onTapGesture {
                            selectedTrend = prediction
                            let generator = UIImpactFeedbackGenerator(style: .light)
                            generator.impactOccurred()
                        }
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(hex: "1E293B").opacity(0.8),
                            Color(hex: "334155").opacity(0.6)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .background(Material.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(hex: "3B82F6").opacity(0.3),
                            Color.purple.opacity(0.2)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .shadow(color: Color(hex: "3B82F6").opacity(0.2), radius: 12, x: 0, y: 6)
        .sheet(item: $selectedTrend) { prediction in
            BayesianDetailSheet(prediction: prediction)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
    }
    
    // 贝叶斯预测数据（从新闻中聚合）
    private var bayesianPredictions: [BayesianPrediction] {
        [
            BayesianPrediction(
                id: UUID(),
                target: "AGI在2030年前实现",
                currentProb: 65,
                shift: 8,
                previousProb: 57,
                affectedBy: "OpenAI发布GPT-5",
                newsId: "1",
                trendData: [52, 54, 57, 58, 60, 62, 65],
                confidence: .high,
                category: "AI技术"
            ),
            BayesianPrediction(
                id: UUID(),
                target: "2028年全球Robotaxi市场规模突破1000亿美元",
                currentProb: 72,
                shift: 12,
                previousProb: 60,
                affectedBy: "特斯拉Robotaxi全球50城运营",
                newsId: "2",
                trendData: [55, 58, 60, 62, 65, 68, 72],
                confidence: .high,
                category: "自动驾驶"
            ),
            BayesianPrediction(
                id: UUID(),
                target: "2027年全球电动车渗透率突破50%",
                currentProb: 68,
                shift: 20,
                previousProb: 48,
                affectedBy: "比亚迪固态电池量产",
                newsId: "3",
                trendData: [40, 42, 45, 48, 52, 58, 68],
                confidence: .medium,
                category: "新能源"
            ),
            BayesianPrediction(
                id: UUID(),
                target: "2026年美国经济软着陆成功（避免衰退）",
                currentProb: 75,
                shift: 10,
                previousProb: 65,
                affectedBy: "美联储维持利率不变",
                newsId: "5",
                trendData: [60, 62, 65, 68, 70, 72, 75],
                confidence: .high,
                category: "宏观经济"
            ),
            BayesianPrediction(
                id: UUID(),
                target: "2027年实时光追成为游戏标配",
                currentProb: 80,
                shift: 15,
                previousProb: 65,
                affectedBy: "英伟达RTX 6090发布",
                newsId: "4",
                trendData: [58, 60, 65, 68, 72, 76, 80],
                confidence: .medium,
                category: "游戏技术"
            )
        ]
    }
}

// MARK: - 贝叶斯预测数据模型
struct BayesianPrediction: Identifiable {
    let id: UUID
    let target: String // 预测目标
    let currentProb: Int // 当前概率（百分比）
    let shift: Int // 变化值
    let previousProb: Int // 之前概率
    let affectedBy: String // 受影响的新闻
    let newsId: String // 关联新闻ID
    let trendData: [Int] // 趋势数据（7天）
    let confidence: Confidence // 置信度
    let category: String // 分类
    
    enum Confidence {
        case high, medium, low
        
        var text: String {
            switch self {
            case .high: return "高置信度"
            case .medium: return "中置信度"
            case .low: return "低置信度"
            }
        }
        
        var color: Color {
            switch self {
            case .high: return .green
            case .medium: return .yellow
            case .low: return .orange
            }
        }
    }
    
    var isPositive: Bool {
        shift > 0
    }
}

// MARK: - 贝叶斯概率仪卡片
struct BayesianMeterCard: View {
    let prediction: BayesianPrediction
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // 预测目标
            HStack(alignment: .top, spacing: 8) {
                // 分类标签
                Text(prediction.category)
                    .font(.caption2)
                    .fontWeight(.medium)
                    .foregroundColor(pointBlue)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(pointBlue.opacity(0.15))
                    .cornerRadius(6)
                
                Spacer()
                
                // 置信度
                HStack(spacing: 4) {
                    Circle()
                        .fill(prediction.confidence.color)
                        .frame(width: 6, height: 6)
                    
                    Text(prediction.confidence.text)
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            
            Text(prediction.target)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
            
            // 概率显示和趋势线
            HStack(spacing: 16) {
                // 当前概率
                VStack(alignment: .leading, spacing: 4) {
                    Text("发生概率")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.5))
                    
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text("\(prediction.currentProb)")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(pointBlue)
                        
                        Text("%")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(pointBlue.opacity(0.8))
                    }
                    
                    // 变化指示
                    HStack(spacing: 4) {
                        Image(systemName: prediction.isPositive ? "arrow.up.right" : "arrow.down.right")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(prediction.isPositive ? .green : .red)
                        
                        Text("\(prediction.isPositive ? "+" : "")\(prediction.shift)%")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(prediction.isPositive ? .green : .red)
                        
                        Text("(\(prediction.previousProb)% → \(prediction.currentProb)%)")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
                
                Spacer()
                
                // 微型趋势线
                MiniTrendLineView(data: prediction.trendData, color: pointBlue)
                    .frame(width: 100, height: 50)
            }
            
            // 影响说明
            HStack(spacing: 6) {
                Image(systemName: "info.circle.fill")
                    .font(.system(size: 12))
                    .foregroundColor(.cyan.opacity(0.8))
                
                Text("受今日")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                
                Text(prediction.affectedBy)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.cyan)
                
                Text("影响，概率\(prediction.isPositive ? "上调" : "下调")\(abs(prediction.shift))%")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color.cyan.opacity(0.08))
            .cornerRadius(8)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color.white.opacity(0.05))
                .background(Material.ultraThinMaterial.opacity(0.5))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
    }
}

// MARK: - 微型趋势线视图
struct MiniTrendLineView: View {
    let data: [Int]
    let color: Color
    
    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            let maxValue = data.max() ?? 100
            let minValue = data.min() ?? 0
            let range = maxValue - minValue
            
            ZStack {
                // 背景网格
                Path { path in
                    for i in 0...2 {
                        let y = height / 2 * CGFloat(i)
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: width, y: y))
                    }
                }
                .stroke(Color.white.opacity(0.1), lineWidth: 0.5)
                
                // 趋势线
                Path { path in
                    let spacing = width / CGFloat(data.count - 1)
                    
                    for (index, value) in data.enumerated() {
                        let x = spacing * CGFloat(index)
                        let normalizedValue = range > 0 ? CGFloat(value - minValue) / CGFloat(range) : 0.5
                        let y = height - (height * normalizedValue)
                        
                        if index == 0 {
                            path.move(to: CGPoint(x: x, y: y))
                        } else {
                            path.addLine(to: CGPoint(x: x, y: y))
                        }
                    }
                }
                .stroke(color, lineWidth: 2)
                
                // 填充区域
                Path { path in
                    let spacing = width / CGFloat(data.count - 1)
                    
                    for (index, value) in data.enumerated() {
                        let x = spacing * CGFloat(index)
                        let normalizedValue = range > 0 ? CGFloat(value - minValue) / CGFloat(range) : 0.5
                        let y = height - (height * normalizedValue)
                        
                        if index == 0 {
                            path.move(to: CGPoint(x: x, y: y))
                        } else {
                            path.addLine(to: CGPoint(x: x, y: y))
                        }
                    }
                    
                    path.addLine(to: CGPoint(x: width, y: height))
                    path.addLine(to: CGPoint(x: 0, y: height))
                    path.closeSubpath()
                }
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [color.opacity(0.3), color.opacity(0.05)]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                
                // 最后一个点
                if let lastValue = data.last {
                    let x = width
                    let normalizedValue = range > 0 ? CGFloat(lastValue - minValue) / CGFloat(range) : 0.5
                    let y = height - (height * normalizedValue)
                    
                    Circle()
                        .fill(color)
                        .frame(width: 6, height: 6)
                        .position(x: x, y: y)
                }
            }
        }
    }
}

// MARK: - 贝叶斯详情弹窗
struct BayesianDetailSheet: View {
    let prediction: BayesianPrediction
    @Environment(\.dismiss) var dismiss
    
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        ZStack {
            // 深海蓝渐变背景
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    // 顶部装饰
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.white.opacity(0.3))
                        .frame(width: 40, height: 5)
                        .padding(.top, 8)
                    
                    // 标题区域
                    VStack(spacing: 12) {
                        Text(prediction.category)
                            .font(.caption)
                            .foregroundColor(pointBlue)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 4)
                            .background(pointBlue.opacity(0.15))
                            .cornerRadius(8)
                        
                        Text(prediction.target)
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                    }
                    
                    // 概率大卡片
                    VStack(spacing: 16) {
                        HStack(alignment: .firstTextBaseline, spacing: 6) {
                            Text("\(prediction.currentProb)")
                                .font(.system(size: 64, weight: .bold))
                                .foregroundColor(pointBlue)
                            
                            Text("%")
                                .font(.system(size: 32, weight: .medium))
                                .foregroundColor(pointBlue.opacity(0.8))
                        }
                        
                        HStack(spacing: 8) {
                            Image(systemName: prediction.isPositive ? "arrow.up.right.circle.fill" : "arrow.down.right.circle.fill")
                                .font(.system(size: 20))
                                .foregroundColor(prediction.isPositive ? .green : .red)
                            
                            Text("\(prediction.isPositive ? "+" : "")\(prediction.shift)% 今日变化")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(prediction.isPositive ? .green : .red)
                        }
                        
                        // 趋势图
                        MiniTrendLineView(data: prediction.trendData, color: pointBlue)
                            .frame(height: 100)
                            .padding(.horizontal, 20)
                    }
                    .padding(24)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(Material.ultraThinMaterial)
                            .opacity(0.5)
                    )
                    
                    // 影响说明
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 8) {
                            Image(systemName: "newspaper.fill")
                                .foregroundColor(.cyan)
                            
                            Text("影响因素")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        
                        Text("受今日 \(prediction.affectedBy) 影响，该预测的发生概率从 \(prediction.previousProb)% \(prediction.isPositive ? "上调" : "下调")至 \(prediction.currentProb)%，变化幅度为 \(abs(prediction.shift))%。")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.85))
                            .lineSpacing(6)
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.cyan.opacity(0.1))
                    )
                    
                    // 置信度说明
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 8) {
                            Circle()
                                .fill(prediction.confidence.color)
                                .frame(width: 12, height: 12)
                            
                            Text(prediction.confidence.text)
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        
                        Text("基于历史数据和当前趋势分析，该预测具有\(prediction.confidence.text.replacingOccurrences(of: "置信度", with: ""))的可信度。")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.85))
                            .lineSpacing(6)
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(prediction.confidence.color.opacity(0.1))
                    )
                    
                    // 关闭按钮
                    Button(action: {
                        dismiss()
                        let generator = UIImpactFeedbackGenerator(style: .light)
                        generator.impactOccurred()
                    }) {
                        Text("关闭")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(
                                    gradient: Gradient(colors: [pointBlue, Color.purple]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
    }
}

// MARK: - 叙事热力榜组件（Narrative Tracker）
struct WindVaneSection: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @State private var selectedNarrative: NarrativeItem?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            HStack(spacing: 8) {
                Image(systemName: "flame.fill")
                    .font(.system(size: 18))
                    .foregroundColor(.orange)
                
                Text("叙事热力榜")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Spacer()
                
                Text("Narrative Tracker")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.6))
            }
            
            // 副标题
            Text("社会叙事 · 跨行业传播追踪")
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
            
            // 气泡图展示
            NarrativeBubbleChart(narratives: narrativeItems, selectedNarrative: $selectedNarrative)
                .frame(height: 280)
            
            // 热力列表
            VStack(spacing: 10) {
                ForEach(Array(narrativeItems.enumerated()), id: \.element.id) { index, narrative in
                    NarrativeHeatListItem(narrative: narrative, rank: index + 1)
                        .onTapGesture {
                            selectedNarrative = narrative
                            let generator = UIImpactFeedbackGenerator(style: .medium)
                            generator.impactOccurred()
                        }
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(hex: "1E293B").opacity(0.8),
                            Color(hex: "334155").opacity(0.6)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .background(Material.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.orange.opacity(0.3),
                            Color.red.opacity(0.2)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .shadow(color: Color.orange.opacity(0.2), radius: 12, x: 0, y: 6)
        .sheet(item: $selectedNarrative) { narrative in
            NarrativeDetailSheet(narrative: narrative)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
    }
    
    // 叙事数据
    private var narrativeItems: [NarrativeItem] {
        [
            NarrativeItem(
                id: UUID(),
                title: "AI革命",
                score: 92,
                trend: .rising,
                spreadRate: 4.5,
                industries: ["科技", "教育", "医疗", "金融", "制造业"],
                description: "GPT-5的发布标志着AI技术进入新阶段，从技术圈快速扩散至大众金融圈，社交媒体讨论量24小时内增长300%",
                spreadPath: [
                    SpreadNode(industry: "科技", intensity: 95, time: "今日 08:00"),
                    SpreadNode(industry: "金融", intensity: 85, time: "今日 10:00"),
                    SpreadNode(industry: "教育", intensity: 78, time: "今日 12:00"),
                    SpreadNode(industry: "医疗", intensity: 72, time: "今日 14:00"),
                    SpreadNode(industry: "制造业", intensity: 65, time: "今日 16:00")
                ],
                relatedNews: ["OpenAI发布GPT-5", "微软AI助手升级"]
            ),
            NarrativeItem(
                id: UUID(),
                title: "自动驾驶商业化",
                score: 88,
                trend: .rising,
                spreadRate: 3.8,
                industries: ["汽车", "出行", "保险", "城市规划"],
                description: "Robotaxi在全球50城运营，正在从科技和金融圈扩散至政策制定者和普通消费者",
                spreadPath: [
                    SpreadNode(industry: "汽车", intensity: 90, time: "今日 09:00"),
                    SpreadNode(industry: "出行", intensity: 88, time: "今日 10:30"),
                    SpreadNode(industry: "保险", intensity: 75, time: "今日 12:00"),
                    SpreadNode(industry: "城市规划", intensity: 68, time: "今日 15:00")
                ],
                relatedNews: ["特斯拉Robotaxi全球运营", "自动驾驶监管政策"]
            ),
            NarrativeItem(
                id: UUID(),
                title: "新能源转型",
                score: 90,
                trend: .rising,
                spreadRate: 4.2,
                industries: ["能源", "汽车", "制造业", "环保"],
                description: "固态电池量产引发新能源革命，正在从汽车圈快速扩散至主流消费者",
                spreadPath: [
                    SpreadNode(industry: "汽车", intensity: 95, time: "今日 10:00"),
                    SpreadNode(industry: "能源", intensity: 85, time: "今日 11:00"),
                    SpreadNode(industry: "制造业", intensity: 78, time: "今日 13:00"),
                    SpreadNode(industry: "环保", intensity: 72, time: "今日 15:00")
                ],
                relatedNews: ["比亚迪固态电池量产", "全球电动车销量激增"]
            ),
            NarrativeItem(
                id: UUID(),
                title: "货币政策转向",
                score: 87,
                trend: .stable,
                spreadRate: 3.2,
                industries: ["金融", "房地产", "制造业"],
                description: "美联储维持利率，降息预期在金融圈和投资者中保持高热度",
                spreadPath: [
                    SpreadNode(industry: "金融", intensity: 92, time: "今日 12:00"),
                    SpreadNode(industry: "房地产", intensity: 80, time: "今日 13:00"),
                    SpreadNode(industry: "制造业", intensity: 70, time: "今日 14:00")
                ],
                relatedNews: ["美联储维持利率", "全球降息预期升温"]
            ),
            NarrativeItem(
                id: UUID(),
                title: "游戏技术革命",
                score: 85,
                trend: .rising,
                spreadRate: 3.5,
                industries: ["游戏", "娱乐", "科技"],
                description: "RTX 6090发布，正在从游戏玩家和专业创作者圈层扩散至科技爱好者",
                spreadPath: [
                    SpreadNode(industry: "游戏", intensity: 90, time: "今日 11:00"),
                    SpreadNode(industry: "娱乐", intensity: 82, time: "今日 13:00"),
                    SpreadNode(industry: "科技", intensity: 75, time: "今日 15:00")
                ],
                relatedNews: ["英伟达RTX 6090发布", "游戏画质革命"]
            )
        ]
    }
}

// MARK: - 叙事数据模型
struct NarrativeItem: Identifiable {
    let id: UUID
    let title: String // 叙事标题
    let score: Int // 热力得分（0-100）
    let trend: Trend // 趋势
    let spreadRate: Double // 扩散速度
    let industries: [String] // 涉及行业
    let description: String // 描述
    let spreadPath: [SpreadNode] // 传播路径
    let relatedNews: [String] // 相关新闻
    
    enum Trend {
        case rising, stable, falling
        
        var symbol: String {
            switch self {
            case .rising: return "📈"
            case .stable: return "📊"
            case .falling: return "📉"
            }
        }
        
        var text: String {
            switch self {
            case .rising: return "快速上升"
            case .stable: return "稳定传播"
            case .falling: return "热度下降"
            }
        }
        
        var color: Color {
            switch self {
            case .rising: return .green
            case .stable: return .yellow
            case .falling: return .red
            }
        }
    }
}

// MARK: - 传播节点
struct SpreadNode {
    let industry: String
    let intensity: Int // 强度（0-100）
    let time: String
}

// MARK: - 叙事气泡图
struct NarrativeBubbleChart: View {
    let narratives: [NarrativeItem]
    @Binding var selectedNarrative: NarrativeItem?
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // 背景网格
                Path { path in
                    for i in 0...4 {
                        let y = geometry.size.height / 4 * CGFloat(i)
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: geometry.size.width, y: y))
                    }
                    
                    for i in 0...4 {
                        let x = geometry.size.width / 4 * CGFloat(i)
                        path.move(to: CGPoint(x: x, y: 0))
                        path.addLine(to: CGPoint(x: x, y: geometry.size.height))
                    }
                }
                .stroke(Color.white.opacity(0.1), lineWidth: 0.5)
                
                // 气泡
                ForEach(Array(narratives.enumerated()), id: \.element.id) { index, narrative in
                    let position = bubblePosition(for: index, in: geometry.size)
                    let size = bubbleSize(for: narrative.score)
                    
                    NarrativeBubble(narrative: narrative, size: size)
                        .position(position)
                        .onTapGesture {
                            selectedNarrative = narrative
                            let generator = UIImpactFeedbackGenerator(style: .medium)
                            generator.impactOccurred()
                        }
                }
            }
        }
    }
    
    private func bubblePosition(for index: Int, in size: CGSize) -> CGPoint {
        let positions: [(CGFloat, CGFloat)] = [
            (0.25, 0.3),  // 左上
            (0.7, 0.25),  // 右上
            (0.5, 0.5),   // 中间
            (0.3, 0.7),   // 左下
            (0.75, 0.7)   // 右下
        ]
        
        let pos = positions[min(index, positions.count - 1)]
        return CGPoint(x: size.width * pos.0, y: size.height * pos.1)
    }
    
    private func bubbleSize(for score: Int) -> CGFloat {
        return CGFloat(score) * 0.8 + 40
    }
}

// MARK: - 单个叙事气泡
struct NarrativeBubble: View {
    let narrative: NarrativeItem
    let size: CGFloat
    
    var body: some View {
        ZStack {
            // 气泡背景
            Circle()
                .fill(
                    RadialGradient(
                        gradient: Gradient(colors: [
                            narrative.trend.color.opacity(0.6),
                            narrative.trend.color.opacity(0.3)
                        ]),
                        center: .center,
                        startRadius: 0,
                        endRadius: size / 2
                    )
                )
                .frame(width: size, height: size)
                .shadow(color: narrative.trend.color.opacity(0.4), radius: 10, x: 0, y: 5)
            
            // 扩散动画圈
            Circle()
                .stroke(narrative.trend.color.opacity(0.3), lineWidth: 2)
                .frame(width: size + 10, height: size + 10)
            
            // 内容
            VStack(spacing: 4) {
                Text(narrative.title)
                    .font(.system(size: min(size / 6, 14), weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(1)
                
                Text("\(narrative.score)")
                    .font(.system(size: min(size / 4, 20), weight: .bold))
                    .foregroundColor(.white)
                
                Text("×\(String(format: "%.1f", narrative.spreadRate))")
                    .font(.system(size: min(size / 8, 10)))
                    .foregroundColor(.white.opacity(0.8))
            }
        }
    }
}

// MARK: - 叙事热力列表项
struct NarrativeHeatListItem: View {
    let narrative: NarrativeItem
    let rank: Int
    
    var body: some View {
        HStack(spacing: 12) {
            // 排名
            ZStack {
                Circle()
                    .fill(rankColor(rank))
                    .frame(width: 32, height: 32)
                
                Text("\(rank)")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
            }
            
            // 叙事信息
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(narrative.title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Text(narrative.trend.symbol)
                        .font(.caption)
                }
                
                // 行业标签
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(narrative.industries.prefix(3), id: \.self) { industry in
                            Text(industry)
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.7))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.white.opacity(0.15))
                                .cornerRadius(6)
                        }
                    }
                }
            }
            
            Spacer()
            
            // 热力得分和扩散速度
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(narrative.score)")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(narrative.trend.color)
                
                Text("×\(String(format: "%.1f", narrative.spreadRate))")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.05))
                .background(Material.ultraThinMaterial.opacity(0.3))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(narrative.trend.color.opacity(0.2), lineWidth: 1)
        )
    }
    
    private func rankColor(_ rank: Int) -> Color {
        switch rank {
        case 1: return Color(hex: "FFD700") // 金色
        case 2: return Color(hex: "C0C0C0") // 银色
        case 3: return Color(hex: "CD7F32") // 铜色
        default: return Color.white.opacity(0.3)
        }
    }
}

// MARK: - 叙事详情弹窗
struct NarrativeDetailSheet: View {
    let narrative: NarrativeItem
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            // 深海蓝渐变背景
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    // 顶部装饰
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.white.opacity(0.3))
                        .frame(width: 40, height: 5)
                        .padding(.top, 8)
                    
                    // 标题区域
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(
                                    RadialGradient(
                                        gradient: Gradient(colors: [
                                            narrative.trend.color.opacity(0.6),
                                            narrative.trend.color.opacity(0.3)
                                        ]),
                                        center: .center,
                                        startRadius: 0,
                                        endRadius: 40
                                    )
                                )
                                .frame(width: 80, height: 80)
                            
                            Text("\(narrative.score)")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.white)
                        }
                        
                        Text(narrative.title)
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)
                        
                        HStack(spacing: 12) {
                            HStack(spacing: 4) {
                                Text(narrative.trend.symbol)
                                Text(narrative.trend.text)
                                    .font(.caption)
                                    .foregroundColor(narrative.trend.color)
                            }
                            
                            Text("·")
                                .foregroundColor(.white.opacity(0.5))
                            
                            Text("扩散速度 ×\(String(format: "%.1f", narrative.spreadRate))")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                        }
                    }
                    
                    // 描述
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 8) {
                            Image(systemName: "text.alignleft")
                                .foregroundColor(.orange)
                            
                            Text("叙事描述")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        
                        Text(narrative.description)
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.85))
                            .lineSpacing(6)
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Material.ultraThinMaterial)
                            .opacity(0.5)
                    )
                    
                    // 传播路径
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(spacing: 8) {
                            Image(systemName: "arrow.triangle.branch")
                                .foregroundColor(.cyan)
                            
                            Text("跨行业传播路径")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        
                        ForEach(Array(narrative.spreadPath.enumerated()), id: \.offset) { index, node in
                            HStack(spacing: 12) {
                                // 连接线
                                VStack(spacing: 0) {
                                    Circle()
                                        .fill(Color.cyan)
                                        .frame(width: 10, height: 10)
                                    
                                    if index < narrative.spreadPath.count - 1 {
                                        Rectangle()
                                            .fill(Color.cyan.opacity(0.3))
                                            .frame(width: 2, height: 30)
                                    }
                                }
                                
                                // 节点信息
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(node.industry)
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundColor(.white)
                                        
                                        Spacer()
                                        
                                        Text("\(node.intensity)%")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(.cyan)
                                    }
                                    
                                    Text(node.time)
                                        .font(.caption2)
                                        .foregroundColor(.white.opacity(0.6))
                                }
                                .padding(12)
                                .frame(maxWidth: .infinity)
                                .background(Color.cyan.opacity(0.1))
                                .cornerRadius(10)
                            }
                        }
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Material.ultraThinMaterial)
                            .opacity(0.5)
                    )
                    
                    // 相关新闻
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 8) {
                            Image(systemName: "newspaper.fill")
                                .foregroundColor(.purple)
                            
                            Text("相关新闻")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        
                        ForEach(narrative.relatedNews, id: \.self) { news in
                            HStack(spacing: 8) {
                                Circle()
                                    .fill(Color.purple)
                                    .frame(width: 6, height: 6)
                                
                                Text(news)
                                    .font(.system(size: 13))
                                    .foregroundColor(.white.opacity(0.85))
                            }
                        }
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.purple.opacity(0.1))
                    )
                    
                    // 关闭按钮
                    Button(action: {
                        dismiss()
                        let generator = UIImpactFeedbackGenerator(style: .light)
                        generator.impactOccurred()
                    }) {
                        Text("关闭")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(
                                    gradient: Gradient(colors: [Color.orange, Color.red]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
    }
}

// MARK: - 专题报告卡片
struct TopicReportCard: View {
    let topic: News.Topic
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 专题标题
            HStack(spacing: 8) {
                Text("🔍")
                Text(topic.title)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Spacer()
                Text(topic.category)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(Color.white.opacity(0.2))
                    .cornerRadius(12)
            }
            
            // 专题描述
            Text(topic.aiSummary)
                .font(.body)
                .foregroundColor(.white.opacity(0.9))
                .lineSpacing(6)
                .lineLimit(3)
            
            // 底部信息
            HStack(spacing: 16) {
                HStack(spacing: 6) {
                    Image(systemName: "newspaper")
                        .foregroundColor(.white.opacity(0.8))
                    Text("\(topic.relatedNewsCount) 条关联新闻")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                }
                
                Spacer()
                
                HStack(spacing: 6) {
                    Text("DeepSeek 生成")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Image(systemName: "chevron.right")
                        .foregroundColor(.white.opacity(0.8))
                }
            }
        }
        .padding(20)
        .background(
            // 玻璃拟态效果
            Color.white.opacity(0.1)
                .background(Material.thinMaterial)
        )
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
        .onTapGesture {
            // 点击进入专题详情页
            let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
            impactFeedbackgenerator.impactOccurred()
        }
    }
}

// MARK: - 预览
#Preview {
    IntelligenceView()
        .environmentObject(NewsViewModel())
}
