//
//  AIAnalysisView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-16.
//

import SwiftUI

// MARK: - 情报中心视图（全局·宏观·推演）
struct AIAnalysisView: View {
    @EnvironmentObject var viewModel: NewsViewModel
    @State private var selectedTopic: News.Topic?
    
    var body: some View {
        VStack(spacing: 20) {
            // 顶部标题
            Text("情报中心")
                .font(.system(size: 32))
                .fontWeight(.bold)
                .padding(.top, 8)
                .gradientForeground(colors: [Color.blue, Color.purple])
            
            // 主要内容
            if viewModel.isLoading {
                loadingView
            } else if viewModel.intelligenceData == nil {
                emptyStateView
            } else {
                ScrollView {
                    VStack(spacing: 24) {
                        // 1. 宏观脉搏
                        macroPulseSection
                        
                        // 2. 专题情报包
                        topicAggregationSection
                        
                        // 3. 逻辑推演
                        futureScenariosSection
                    }
                    .padding()
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: {
                    viewModel.fetchIntelligenceData()
                }) {
                    Image(systemName: "arrow.clockwise.circle")
                }
            }
        }
        .onAppear {
            viewModel.fetchIntelligenceData()
        }
        .sheet(item: $selectedTopic) {
            TopicDetailView(topic: $0)
                .environmentObject(viewModel)
        }
    }
    
    // MARK: - 1. 宏观脉搏
    private var macroPulseSection: some View {
        VStack(spacing: 20) {
            HStack {
                Text("宏观脉搏")
                    .font(.title2)
                    .fontWeight(.bold)
                Spacer()
            }
            
            // 行业热力地图
            HStack(spacing: 16) {
                IndustryHeatMapItem(
                    name: "AI",
                    heat: viewModel.intelligenceData?.globalStats.aiIndustryHeat ?? 0,
                    color: Color.blue
                )
                IndustryHeatMapItem(
                    name: "财经",
                    heat: viewModel.intelligenceData?.globalStats.financeIndustryHeat ?? 0,
                    color: Color.green
                )
                IndustryHeatMapItem(
                    name: "国际",
                    heat: viewModel.intelligenceData?.globalStats.internationalIndustryHeat ?? 0,
                    color: Color.red
                )
                IndustryHeatMapItem(
                    name: "科技",
                    heat: viewModel.intelligenceData?.globalStats.techIndustryHeat ?? 0,
                    color: Color.purple
                )
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
            
            // 24小时密度图（简化版）
            VStack {
                HStack {
                    Text("24小时情报密度")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Spacer()
                    Text("今日")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                DensityChart()
                    .frame(height: 60)
                    .padding(.top, 8)
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
    
    // MARK: - 2. 专题情报包
    private var topicAggregationSection: some View {
        VStack(spacing: 20) {
            HStack {
                Text("专题情报包")
                    .font(.title2)
                    .fontWeight(.bold)
                Spacer()
            }
            
            // 专题卡片
            ForEach(viewModel.intelligenceData?.topics ?? []) { topic in
                TopicCard(topic: topic) {
                    selectedTopic = topic
                }
            }
        }
    }
    
    // MARK: - 3. 逻辑推演
    private var futureScenariosSection: some View {
        VStack(spacing: 20) {
            HStack {
                Text("逻辑推演")
                    .font(.title2)
                    .fontWeight(.bold)
                Spacer()
            }
            
            // 未来7天趋势预测
            VStack(spacing: 16) {
                Text("未来7天趋势预测")
                    .font(.headline)
                    .fontWeight(.medium)
                
                ForEach(viewModel.intelligenceData?.predictions ?? []) {
                    PredictionCard(prediction: $0)
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
    
    // MARK: - 加载视图
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
                .progressViewStyle(CircularProgressViewStyle())
            
            Text("正在生成情报中心...")
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
    
    // MARK: - 空状态视图
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "globe.americas")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
                .padding(.bottom, 8)
            
            Text("情报中心数据加载失败")
                .font(.headline)
                .foregroundColor(.primary)
            
            Button(action: {
                viewModel.fetchIntelligenceData()
            }) {
                Text("重新加载")
                    .fontWeight(.medium)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 10)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [Color.blue, Color.purple]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .foregroundColor(.white)
                    .cornerRadius(20)
            }
            .padding(.top, 8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

// MARK: - 行业热力图项
struct IndustryHeatMapItem: View {
    let name: String
    let heat: Int
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Rectangle()
                .fill(color)
                .opacity(Double(heat) / 100)
                .frame(width: (80 + CGFloat(heat) * 0.5), height: 80)
                .cornerRadius(12)
                .shadow(color: color.opacity(0.3), radius: 4, x: 0, y: 2)
            
            Text(name)
                .font(.headline)
                .fontWeight(.bold)
            
            Text("\(heat)")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - 密度图
struct DensityChart: View {
    let data: [Int] = Array(repeating: 0, count: 24)
        .enumerated()
        .map { index, _ in
            // 模拟24小时数据，高峰在早上8点和晚上8点
            let hour = index
            let morningPeak = max(0, 100 - abs(hour - 8) * 8)
            let eveningPeak = max(0, 80 - abs(hour - 20) * 6)
            return max(morningPeak, eveningPeak)
        }
    
    var body: some View {
        HStack(spacing: 3) {
            ForEach(data.indices, id: \.self) { index in
                VStack {
                    Spacer()
                    Rectangle()
                        .fill(LinearGradient(gradient: Gradient(colors: [Color.blue, Color.purple]), startPoint: .bottom, endPoint: .top))
                        .opacity(Double(data[index]) / 100)
                        .frame(height: CGFloat(data[index]) * 0.4)
                        .cornerRadius(2)
                }
            }
        }
    }
}

// MARK: - 专题卡片
struct TopicCard: View {
    let topic: News.Topic
    let onTap: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 16) {
                // AI生成图标
                ZStack {
                    Circle()
                        .fill(LinearGradient(gradient: Gradient(colors: [Color.blue, Color.purple]), startPoint: .leading, endPoint: .trailing))
                        .frame(width: 60, height: 60)
                    
                    Image(systemName: getIconForCategory(topic.category))
                        .font(.system(size: 30))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Text(topic.category)
                            .font(.caption)
                            .foregroundColor(.blue)
                            .fontWeight(.bold)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 4)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(12)
                        
                        HStack(spacing: 4) {
                            Image(systemName: "exclamationmark.triangle")
                            Text("影响等级: \(topic.impactLevel)/10")
                        }
                        .font(.caption)
                        .foregroundColor(.orange)
                    }
                    
                    Text(topic.title)
                        .font(.title3)
                        .fontWeight(.bold)
                }
            }
            
            // AI深度洞察逻辑
            Text(topic.logicInsight)
                .font(.body)
                .foregroundColor(.secondary)
                .lineLimit(3)
            
            // 底部信息
            HStack(spacing: 12) {
                HStack(spacing: 4) {
                    Image(systemName: "doc.plaintext")
                    Text("涉及 \(topic.relatedNewsCount) 篇关联情报 >")
                }
                .font(.subheadline)
                .foregroundColor(.blue)
                .fontWeight(.medium)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
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
        .onTapGesture {
            onTap()
        }
    }
    
    private func getIconForCategory(_ category: String) -> String {
        switch category {
        case "AI": return "brain.head.profile"
        case "芯片": return "cpu"
        case "宏观": return "chart.xyaxis.line"
        case "科技": return "laptopcomputer"
        case "财经": return "dollarsign.circle"
        case "国际": return "globe.americas"
        default: return "doc.text.magnifyingglass"
        }
    }
}

// MARK: - 预测卡片
struct PredictionCard: View {
    let prediction: News.Prediction
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(prediction.title)
                    .font(.headline)
                    .fontWeight(.medium)
                Spacer()
                Text("\(prediction.confidence)% 置信度")
                    .font(.caption)
                    .foregroundColor(.green)
                    .fontWeight(.bold)
            }
            
            // 逻辑链条
            VStack(spacing: 8) {
                ForEach(prediction.logicChain.indices, id: \.self) { index in
                    HStack(spacing: 8) {
                        Circle()
                            .fill(Color.blue)
                            .frame(width: 8, height: 8)
                        
                        Text(prediction.logicChain[index])
                            .font(.body)
                        
                        if index < prediction.logicChain.count - 1 {
                            VStack {
                                Rectangle()
                                    .fill(Color.blue.opacity(0.3))
                                    .frame(width: 1, height: 16)
                            }
                            .padding(.leading, -4)
                        }
                    }
                }
                
                // 结果
                HStack(spacing: 8) {
                    Image(systemName: "arrow.right")
                        .foregroundColor(.purple)
                        .font(.system(size: 16))
                    
                    Text("→ \(prediction.result)")
                        .font(.body)
                        .fontWeight(.bold)
                        .foregroundColor(.purple)
                }
                .padding(.leading, 4)
            }
        }
    }
}

// MARK: - 渐变色文本扩展
extension View {
    func gradientForeground(colors: [Color]) -> some View {
        self.overlay(
            LinearGradient(gradient: Gradient(colors: colors), startPoint: .leading, endPoint: .trailing)
                .mask(self)
        )
    }
}
