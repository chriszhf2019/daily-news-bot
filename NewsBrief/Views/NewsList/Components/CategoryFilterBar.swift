//
//  CategoryFilterBar.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  分类筛选栏组件
//

import SwiftUI

// MARK: - 分类筛选栏
struct CategoryFilterBar: View {
    let categories: [(String, String)]
    @Binding var selectedCategory: String
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Spacing.sm) {
                ForEach(categories, id: \.0) { category, icon in
                    CategoryFilterChip(
                        title: category,
                        icon: icon,
                        isSelected: selectedCategory == category
                    ) {
                        withAnimation(Animation.quick) {
                            selectedCategory = category
                        }
                        
                        // 触觉反馈
                        let generator = UIImpactFeedbackGenerator(style: .light)
                        generator.impactOccurred()
                    }
                }
            }
            .padding(.horizontal, Spacing.lg)
        }
    }
}

// MARK: - 分类筛选标签
struct CategoryFilterChip: View {
    let title: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.xs + 2) {
                Text(icon)
                    .font(.system(size: IconSize.md))
                
                Text(title)
                    .font(Typography.caption1)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .foregroundColor(isSelected ? .white : .white.opacity(0.7))
            .padding(.horizontal, Spacing.md + 2)
            .padding(.vertical, Spacing.sm + 2)
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.md)
                    .fill(isSelected ? Color.pointBlue : Color.white.opacity(0.08))
                    .overlay(
                        RoundedRectangle(cornerRadius: CornerRadius.md)
                            .stroke(
                                isSelected ? Color.clear : Color.white.opacity(0.1),
                                lineWidth: 1
                            )
                    )
            )
            .scaleEffect(isSelected ? 1.05 : 1.0)
        }
        .animation(Animation.spring, value: isSelected)
    }
}

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        CategoryFilterBar(
            categories: [
                ("全部", "📰"),
                ("AI动态", "🤖"),
                ("科技前沿", "🚀"),
                ("商业财经", "💰")
            ],
            selectedCategory: .constant("全部")
        )
    }
}
