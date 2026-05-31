//
//  BrandHeaderView.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  品牌头部视图组件
//

import SwiftUI

// MARK: - 品牌头部视图
struct BrandHeaderView: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @State private var showSearch = false
    
    var body: some View {
        VStack(spacing: Spacing.md) {
            // Logo和品牌名
            HStack(spacing: Spacing.sm + 2) {
                // 品牌Logo
                BrandLogo()
                
                BrandTitle()
                
                Spacer()
                
                // 搜索按钮
                Button(action: {
                    showSearch = true
                }) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: IconSize.md, weight: .semibold))
                        .foregroundColor(.pointBlue)
                        .frame(width: 36, height: 36)
                        .background(
                            Circle()
                                .fill(Color.pointBlue.opacity(0.15))
                        )
                }
                
                // 今日日期
                DateDisplay()
            }
            .padding(.horizontal, Spacing.xl)
            .padding(.top, Spacing.sm)
            
            // 宣传语
            Text("帮你点透世界逻辑的新闻智库")
                .font(Typography.caption1)
                .foregroundColor(.primary.opacity(0.8))
                .padding(.horizontal, Spacing.xl)
                .padding(.bottom, Spacing.xs)
            
            // 分隔线
            Divider()
                .overlay(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.clear,
                            Color.pointBlue.opacity(0.3),
                            Color.clear
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 1)
                .padding(.horizontal, Spacing.xxxl + 8)
        }
        .sheet(isPresented: $showSearch) {
            GlobalSearchView()
                .environmentObject(viewModel)
        }
    }
}

// MARK: - 品牌Logo
private struct BrandLogo: View {
    var body: some View {
        ZStack {
            Circle()
                .fill(LinearGradient.pointBlueGradient)
                .frame(width: 44, height: 44)
                .shadow(
                    color: Shadow.glow(color: .pointBlue).color,
                    radius: Shadow.glow(color: .pointBlue).radius,
                    x: Shadow.glow(color: .pointBlue).x,
                    y: Shadow.glow(color: .pointBlue).y
                )
            
            Image(systemName: "arrow.up")
                .font(.system(size: IconSize.lg, weight: .bold))
                .foregroundColor(.white)
        }
    }
}

// MARK: - 品牌标题
private struct BrandTitle: View {
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xxs) {
            Text("点透")
                .font(Typography.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text("Point")
                .font(Typography.caption1)
                .foregroundColor(.primary.opacity(0.8))
        }
    }
}

// MARK: - 日期显示
private struct DateDisplay: View {
    var body: some View {
        VStack(alignment: .trailing, spacing: Spacing.xxs) {
            Text(currentDateString())
                .font(Typography.caption1)
                .foregroundColor(.primary.opacity(0.8))
            
            Text("周\(currentWeekday())")
                .font(Typography.caption1)
                .foregroundColor(.primary.opacity(0.7))
        }
    }
    
    private func currentDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy年MM月dd日"
        return formatter.string(from: Date())
    }
    
    private func currentWeekday() -> String {
        let weekdays = ["日", "一", "二", "三", "四", "五", "六"]
        let calendar = Calendar.current
        let weekday = calendar.component(.weekday, from: Date())
        return weekdays[weekday - 1]
    }
}

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        BrandHeaderView()
    }
}
