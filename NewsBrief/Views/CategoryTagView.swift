//
//  CategoryTagView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-01.
//

import SwiftUI

// MARK: - 分类标签视图
struct CategoryTagView: View {
    // 分类和标签数据
    let categories: [String]
    let tags: [String]
    
    // 选择回调
    let onCategorySelected: (String) -> Void
    let onTagSelected: (String) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 分类筛选
            VStack(alignment: .leading, spacing: 12) {
                Text("分类筛选")
                    .font(.headline)
                    .fontWeight(.medium)
                    .padding(.leading, 16)
                
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(categories, id: \.self) { category in
                            CategoryChip(category: category) {
                                onCategorySelected(category)
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
            .padding(.top, 8)
            
            // 热门标签
            if !tags.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    Text("热门标签")
                        .font(.headline)
                        .fontWeight(.medium)
                        .padding(.leading, 16)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(tags, id: \.self) { tag in
                                TagChip(tag: tag) {
                                    onTagSelected(tag)
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                }
                .padding(.top, 8)
            }
        }
        .padding(.vertical, 8)
    }
}

// MARK: - 分类标签
struct CategoryChip: View {
    let category: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(category)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.blue.opacity(0.1))
                .foregroundColor(Color.blue)
                .clipShape(Capsule())
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - 标签
struct TagChip: View {
    let tag: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text("#\(tag)")
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.gray.opacity(0.1))
                .foregroundColor(Color.gray)
                .clipShape(Capsule())
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    CategoryTagView(
        categories: ["科技", "体育", "娱乐", "财经", "国际"],
        tags: ["AI", "人工智能", "iPhone", "科技公司", "投资"]
    ) { category in
        print("选择了分类: \(category)")
    } onTagSelected: { tag in
        print("选择了标签: \(tag)")
    }
}