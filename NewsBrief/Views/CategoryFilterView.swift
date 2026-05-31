//
//  CategoryFilterView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-01.
//

import SwiftUI
import UIKit

// MARK: - 扩展：Color十六进制初始化
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt8
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, UInt8((int >> 8) * 17), UInt8((int >> 4 & 0xF) * 17), UInt8((int & 0xF) * 17))
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, UInt8(int >> 16), UInt8(int >> 8 & 0xFF), UInt8(int & 0xFF))
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (UInt8(int >> 24), UInt8(int >> 16 & 0xFF), UInt8(int >> 8 & 0xFF), UInt8(int & 0xFF))
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(uiColor: UIColor(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a) / 255))
    }
}

// MARK: - 分类筛选视图
struct CategoryFilterView: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @State private var selectedCategory: NewsCategory?
    
    // 预定义的分类列表
    private let categories: [NewsCategory] = [
        NewsCategory(name: "AI动态", icon: "brain.head.profile", color: .purple, count: 0),
        NewsCategory(name: "科技前沿", icon: "cpu", color: .orange, count: 0),
        NewsCategory(name: "VR/AR", icon: "visionpro", color: .green, count: 0),
        NewsCategory(name: "自动驾驶", icon: "car", color: .red, count: 0),
        NewsCategory(name: "量子计算", icon: "atom", color: .indigo, count: 0)
    ]
    
    // 深海蓝渐变色
    private let deepOceanGradient = LinearGradient(
        gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
        startPoint: .top,
        endPoint: .bottom
    )
    
    var body: some View {
        ZStack {
            // 深海蓝渐变背景
            deepOceanGradient
                .ignoresSafeArea()
            
            VStack(spacing: 16) {
                // 分类筛选栏
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        // 全部按钮
                        FilterChip(
                            title: "全部",
                            isSelected: selectedCategory == nil,
                            icon: "list.bullet"
                        ) {
                            selectedCategory = nil
                            // 添加触觉反馈
                            let generator = UIImpactFeedbackGenerator(style: .light)
                            generator.impactOccurred()
                        }
                        
                        // 分类按钮
                        ForEach(categories, id: \.id) { category in
                            FilterChip(
                                title: category.name,
                                isSelected: selectedCategory?.id == category.id,
                                icon: category.icon
                            ) {
                                selectedCategory = selectedCategory?.id == category.id ? nil : category
                                // 添加触觉反馈
                                let generator = UIImpactFeedbackGenerator(style: .light)
                                generator.impactOccurred()
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                
                // 新闻列表
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(filteredNews, id: \.id) { news in
                            NavigationLink(destination: NewsDetailView(news: news)) {
                                NewsCardView(news: news)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .navigationTitle("分类筛选")
            .tint(.white)
        }
    }
    
    // 根据选中分类筛选新闻
    private var filteredNews: [News] {
        guard let category = selectedCategory else {
            return viewModel.news
        }
        return viewModel.news.filter { $0.category == category.name }
    }
}

// MARK: - 新闻卡片视图
struct NewsCardView: View {
    let news: News
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // 分类标签
            Text(news.category)
                .font(.caption)
                .foregroundColor(.blue)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
            
            // 标题
            Text(news.title)
                .font(.headline)
                .foregroundColor(.white)
                .lineLimit(2)
            
            // 摘要
            Text(news.summary)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)
            
            // 底部信息
            HStack {
                Text(news.source)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                    Text("\(news.readTime)分钟")
                }
                .font(.caption)
                .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(
            // 玻璃拟态效果
            Color.white.opacity(0.1)
                .background(Material.thinMaterial)
        )
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.white.opacity(0.2), lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

// MARK: - 筛选芯片组件
struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let icon: String?
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.caption)
                }
                
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                Color.white.opacity(isSelected ? 0.2 : 0.1)
            )
            .foregroundColor(isSelected ? .white : .primary)
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? Color.clear : Color.white.opacity(0.2), lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    CategoryFilterView()
        .environmentObject(NewsViewModel())
}