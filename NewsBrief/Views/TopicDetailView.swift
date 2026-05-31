//
//  TopicDetailView.swift
//  NewsBrief
//
//  Created by haifangzhao on 2025-01-16.
//

import SwiftUI

// MARK: - 专题详情页
struct TopicDetailView: View {
    let topic: News.Topic
    @EnvironmentObject var viewModel: NewsViewModel
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // 专题全貌
                topicOverviewSection
                
                // 原始新闻卡片
                Text("构成专题的原始新闻")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal)
                    .padding(.top, 8)
                
                // 这里需要根据专题获取相关新闻，现在使用模拟数据
                ForEach(viewModel.getNewsForTopic(topic), id: \.id) {
                    news in
                    PersonalizedNewsCard(news: news)
                }
            }
            .padding()
        }
        .navigationTitle(topic.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: {
                    // 分享功能
                    let impactFeedbackgenerator = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedbackgenerator.impactOccurred()
                }) {
                    Image(systemName: "square.and.arrow.up")
                        .foregroundColor(.white)
                }
            }
        }
        .background(
            // 深海蓝渐变色
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
        .tint(.white)
    }
    
    // MARK: - 专题全貌
    private var topicOverviewSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 专题标题和影响等级
            HStack(spacing: 8) {
                Text(topic.title)
                    .font(.title)
                    .fontWeight(.bold)
                    .lineLimit(2)
                
                Spacer()
                
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.triangle.fill")
                    Text("影响等级: \(topic.impactLevel)/10")
                }
                .font(.caption)
                .foregroundColor(.orange)
                .fontWeight(.bold)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.orange.opacity(0.1))
                .cornerRadius(12)
            }
            
            // 分类
            HStack {
                Text(topic.category)
                    .font(.subheadline)
                    .foregroundColor(.blue)
                    .fontWeight(.bold)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(16)
                
                Spacer()
            }
            
            // AI总结
            VStack(alignment: .leading, spacing: 8) {
                Text("专题全貌")
                    .font(.headline)
                    .fontWeight(.bold)
                
                Text(topic.aiSummary)
                    .font(.body)
                    .foregroundColor(.primary)
                    .lineSpacing(6)
            }
            .padding(16)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color.white, Color.blue.opacity(0.05)]),
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
    }
    
    // MARK: - 个性化新闻卡片（复用首页样式）
    private func PersonalizedNewsCard(news: News) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // 标题
            Text(news.title)
                .font(.title3)
                .fontWeight(.bold)
                .lineLimit(2)
            
            // 来源和时间
            HStack {
                Text(news.source)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text(news.publishedAt)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // 摘要
            Text(news.summary)
                .font(.body)
                .foregroundColor(.secondary)
                .lineLimit(3)
            
            // 标签
            HStack {
                ForEach(news.tags.prefix(3), id: \.self) {
                    tag in
                    Text(tag)
                        .font(.caption2)
                        .foregroundColor(.blue)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                }
                
                Spacer()
            }
        }
        .padding()
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color.white, Color.blue.opacity(0.05)]),
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}
