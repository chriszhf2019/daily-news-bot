//
//  SkeletonView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-20.
//

import SwiftUI

// MARK: - 骨架屏效果组件
struct SkeletonView: View {
    var body: some View {
        ZStack {
            // 基础颜色
            Color.gray.opacity(0.2)
            
            // 闪烁动画
            LinearGradient(
                gradient: Gradient(colors: [Color.gray.opacity(0.2), Color.gray.opacity(0.4), Color.gray.opacity(0.2)]),
                startPoint: .leading,
                endPoint: .trailing
            )
            .offset(x: -100)
            .animation(
                Animation.linear(duration: 1.5)
                    .repeatForever(autoreverses: false)
            )
            .mask(
                Rectangle()
                    .fill(LinearGradient(
                        gradient: Gradient(colors: [Color.black, Color.black.opacity(0), Color.black]),
                        startPoint: .leading,
                        endPoint: .trailing
                    ))
            )
        }
    }
}

// MARK: - 骨架屏卡片组件
struct SkeletonCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // 标题骨架
            SkeletonView()
                .frame(height: 20)
                .cornerRadius(8)
            
            // 副标题骨架
            SkeletonView()
                .frame(height: 16)
                .cornerRadius(8)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // 内容骨架 - 多行
            ForEach(0..<3, id: \.self) {
                _ in
                SkeletonView()
                    .frame(height: 14)
                    .cornerRadius(8)
            }
            
            // 底部信息骨架
            HStack {
                SkeletonView()
                    .frame(width: 80, height: 16)
                    .cornerRadius(8)
                Spacer()
                SkeletonView()
                    .frame(width: 60, height: 16)
                    .cornerRadius(8)
            }
        }
        .padding(16)
        .background(
            Color.white.opacity(0.1)
                .background(Material.thinMaterial)
        )
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)
    }
}

// MARK: - 首页骨架屏
struct HomeSkeletonView: View {
    var body: some View {
        VStack(spacing: 16) {
            // 顶部Stats Bar骨架
            HStack(spacing: 16) {
                ForEach(0..<3, id: \.self) {
                    _ in
                    SkeletonView()
                        .frame(height: 60)
                        .cornerRadius(16)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 16)
            
            // 阅读模式选择器骨架
            HStack(spacing: 16) {
                ForEach(0..<3, id: \.self) {
                    _ in
                    SkeletonView()
                        .frame(height: 32)
                        .cornerRadius(16)
                }
            }
            .padding(.horizontal, 16)
            
            // 搜索栏骨架
            SkeletonView()
                .frame(height: 40)
                .cornerRadius(20)
                .padding(.horizontal, 16)
            
            // 分类栏骨架
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(0..<6, id: \.self) {
                        _ in
                        SkeletonView()
                            .frame(width: 80, height: 36)
                            .cornerRadius(20)
                    }
                }
                .padding(.horizontal, 16)
            }
            
            // 新闻卡片列表骨架
            ScrollView {
                VStack(spacing: 16) {
                    // 明天点名功能区骨架
                    SkeletonView()
                        .frame(height: 80)
                        .cornerRadius(16)
                    
                    // 个性化标签骨架
                    HStack(spacing: 12) {
                        SkeletonView()
                            .frame(height: 24)
                            .cornerRadius(12)
                            .frame(width: 100)
                        
                        ForEach(0..<3, id: \.self) {
                            _ in
                            SkeletonView()
                                .frame(height: 24)
                                .cornerRadius(12)
                                .frame(width: 60)
                        }
                        
                        SkeletonView()
                            .frame(width: 24, height: 24)
                            .cornerRadius(12)
                    }
                    
                    // 新闻卡片骨架
                    ForEach(0..<5, id: \.self) {
                        _ in
                        SkeletonCard()
                    }
                }
                .padding(.horizontal, 16)
            }
        }
    }
}

// MARK: - 情报中心骨架屏
struct IntelligenceSkeletonView: View {
    var body: some View {
        VStack(spacing: 16) {
            // 顶部标题骨架
            SkeletonView()
                .frame(height: 40)
                .cornerRadius(8)
                .padding(.horizontal, 16)
            
            // 情报概览卡片骨架
            SkeletonView()
                .frame(height: 120)
                .cornerRadius(16)
                .padding(.horizontal, 16)
            
            // 分析卡片骨架
            ScrollView {
                VStack(spacing: 16) {
                    ForEach(0..<4, id: \.self) {
                        _ in
                        SkeletonCard()
                    }
                }
                .padding(.horizontal, 16)
            }
        }
    }
}