//
//  LoadingView.swift
//  点透 (Point)
//
//  Created by haifangzhao on 2025-01-01.
//

import SwiftUI

// MARK: - 点透品牌加载文案
struct PointLoadingMessages {
    static let messages = [
        "『点透』正在为你脱水 20 条无用噪音...",
        "『点透』正在帮你点透今日逻辑...",
        "『点透』正在复盘全球情绪...",
        "『点透』正在过滤信息噪音...",
        "『点透』正在提炼核心洞察...",
        "『点透』正在连接事件脉络...",
        "『点透』正在分析市场信号...",
        "『点透』正在整理情报要点..."
    ]
    
    static func randomMessage() -> String {
        messages.randomElement() ?? messages[0]
    }
}

// MARK: - 品牌化加载视图
struct LoadingView: View {
    @State private var loadingMessage = PointLoadingMessages.randomMessage()
    @State private var dotCount = 0
    @State private var isAnimating = false
    
    // 点透蓝
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        ZStack {
            // 半透明背景
            Color.black.opacity(0.6)
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // 品牌Logo动画
                ZStack {
                    // 外圈脉冲
                    Circle()
                        .stroke(pointBlue.opacity(0.3), lineWidth: 3)
                        .frame(width: 80, height: 80)
                        .scaleEffect(isAnimating ? 1.3 : 1.0)
                        .opacity(isAnimating ? 0 : 0.8)
                    
                    // 内圈
                    Circle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [pointBlue, Color.purple]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 60, height: 60)
                        .shadow(color: pointBlue.opacity(0.5), radius: 10)
                    
                    // 点透图标 - 句号里的箭头
                    Image(systemName: "arrow.up")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                        .offset(y: isAnimating ? -3 : 3)
                }
                .animation(
                    Animation.easeInOut(duration: 1.5).repeatForever(autoreverses: true),
                    value: isAnimating
                )
                
                // 品牌名称
                Text("点透")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                
                // 人格化加载文案
                Text(loadingMessage)
                    .font(.system(size: 15))
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
                
                // 进度指示器
                HStack(spacing: 8) {
                    ForEach(0..<3, id: \.self) { index in
                        Circle()
                            .fill(pointBlue)
                            .frame(width: 8, height: 8)
                            .opacity(dotCount > index ? 1.0 : 0.3)
                    }
                }
            }
            .padding(40)
            .background(
                RoundedRectangle(cornerRadius: 24)
                    .fill(Color(hex: "0F172A").opacity(0.95))
                    .shadow(color: pointBlue.opacity(0.3), radius: 20)
            )
        }
        .onAppear {
            isAnimating = true
            startDotAnimation()
            startMessageRotation()
        }
    }
    
    private func startDotAnimation() {
        Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
            withAnimation {
                dotCount = (dotCount + 1) % 4
            }
        }
    }
    
    private func startMessageRotation() {
        Timer.scheduledTimer(withTimeInterval: 3.0, repeats: true) { _ in
            withAnimation {
                loadingMessage = PointLoadingMessages.randomMessage()
            }
        }
    }
}

// MARK: - 小型加载指示器
struct PointLoadingIndicator: View {
    @State private var isAnimating = false
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        HStack(spacing: 12) {
            // 小型品牌动画
            ZStack {
                Circle()
                    .fill(pointBlue)
                    .frame(width: 24, height: 24)
                
                Image(systemName: "arrow.up")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.white)
                    .offset(y: isAnimating ? -1 : 1)
            }
            .animation(
                Animation.easeInOut(duration: 0.8).repeatForever(autoreverses: true),
                value: isAnimating
            )
            
            Text("点透正在工作中...")
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.8))
        }
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - 刷新加载视图
struct RefreshLoadingView: View {
    let message: String
    
    init(message: String = PointLoadingMessages.randomMessage()) {
        self.message = message
    }
    
    var body: some View {
        VStack(spacing: 12) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: Color(hex: "3B82F6")))
                .scaleEffect(1.2)
            
            Text(message)
                .font(.caption)
                .foregroundColor(.white.opacity(0.8))
        }
        .padding()
    }
}

#Preview {
    LoadingView()
}
