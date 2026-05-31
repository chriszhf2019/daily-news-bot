//
//  SmoothAreaChartView.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  光滑面积折线图组件
//

import SwiftUI

// MARK: - 光滑面积折线图
struct SmoothAreaChartView: View {
    let data: [Double]
    @Binding var animatePulse: Bool
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // 背景网格
                BackgroundGrid(geometry: geometry)
                
                // 光滑曲线（使用贝塞尔曲线）
                SmoothCurvePath(data: data, geometry: geometry)
                    .stroke(
                        LinearGradient.cyanGradient,
                        style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round)
                    )
                    .shadow(color: .accentCyan, radius: animatePulse ? 10 : 5, x: 0, y: 0)
                
                // 半透明渐变填充
                SmoothAreaPath(data: data, geometry: geometry)
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.accentCyan.opacity(0.4),
                                Color.accentCyan.opacity(0.1),
                                Color.accentCyan.opacity(0.0)
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                
                // 时间标签
                TimeLabels(geometry: geometry)
            }
        }
    }
}

// MARK: - 背景网格
private struct BackgroundGrid: View {
    let geometry: GeometryProxy
    
    var body: some View {
        Path { path in
            for i in 0...4 {
                let y = geometry.size.height / 4 * CGFloat(i)
                path.move(to: CGPoint(x: 0, y: y))
                path.addLine(to: CGPoint(x: geometry.size.width, y: y))
            }
        }
        .stroke(Color.white.opacity(0.08), style: StrokeStyle(lineWidth: 0.5, dash: [5, 5]))
    }
}

// MARK: - 光滑曲线路径
private struct SmoothCurvePath: Shape {
    let data: [Double]
    let geometry: GeometryProxy
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let width = geometry.size.width
        let height = geometry.size.height
        let spacing = width / CGFloat(data.count - 1)
        
        var points: [CGPoint] = []
        for (index, value) in data.enumerated() {
            let x = spacing * CGFloat(index)
            let y = height - (height * CGFloat(value))
            points.append(CGPoint(x: x, y: y))
        }
        
        guard points.count > 1 else { return path }
        
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
        
        return path
    }
}

// MARK: - 面积填充路径
private struct SmoothAreaPath: Shape {
    let data: [Double]
    let geometry: GeometryProxy
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let width = geometry.size.width
        let height = geometry.size.height
        let spacing = width / CGFloat(data.count - 1)
        
        var points: [CGPoint] = []
        for (index, value) in data.enumerated() {
            let x = spacing * CGFloat(index)
            let y = height - (height * CGFloat(value))
            points.append(CGPoint(x: x, y: y))
        }
        
        guard points.count > 1 else { return path }
        
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
        
        return path
    }
}

// MARK: - 时间标签
private struct TimeLabels: View {
    let geometry: GeometryProxy
    
    var body: some View {
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

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        SmoothAreaChartView(
            data: [0.3, 0.4, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 0.85, 0.75, 0.8, 0.9, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.4, 0.35],
            animatePulse: .constant(true)
        )
        .frame(height: 180)
        .padding()
    }
}
