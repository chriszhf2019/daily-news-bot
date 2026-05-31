//
//  SevenElementsView.swift
//  NewsBrief
//
//  Created by Kiro on 2026-03-04.
//  7要素分析：剥离杂质，还原真相
//

import SwiftUI

// MARK: - 7要素分析视图
struct SevenElementsView: View {
    let news: News
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 0) {
                    // 顶部标题区
                    headerSection
                    
                    if let sevenElements = news.aiAnalysis?.sevenElements {
                        VStack(spacing: 24) {
                            // 1. 信源矩阵
                            sourceMatrixSection(sevenElements.sourceMatrix)
                            
                            // 2. 共识与冲突审计
                            consensusGapsSection(sevenElements.consensusGaps)
                            
                            // 3. 事实核查清单
                            factCheckSection(sevenElements.factCheckList)
                            
                            // 4. 底层原理拆解
                            baseLogicSection(sevenElements.baseLogic)
                            
                            // 5. 证伪预警
                            falsificationSection(sevenElements.falsification)
                            
                            // 6. 置信度印章
                            trustScoreSection(sevenElements.trustScore)
                            
                            // 7. 情报时间轴
                            originSection(sevenElements.origin)
                        }
                        .padding()
                    } else {
                        emptyStateView
                    }
                }
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
    }
    
    // MARK: - 顶部标题区
    private var headerSection: some View {
        VStack(spacing: 16) {
            // 核心理念
            VStack(spacing: 8) {
                Text("7要素分析")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.primary)
                
                Text("剥离杂质 · 还原真相")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .padding(.top, 24)
            
            // 核心价值说明
            Text("建立信任，消除假象。只讲事实，不带观点，解决安全感。")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            // 新闻标题
            Text(news.title)
                .font(.headline)
                .foregroundColor(.primary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
                .padding(.top, 8)
        }
        .padding(.bottom, 24)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.blue.opacity(0.05),
                    Color.purple.opacity(0.05)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
    
    // MARK: - 1. 信源矩阵
    private func sourceMatrixSection(_ matrix: News.AIAnalysis.SevenElements.SourceMatrix) -> some View {
        ElementCard(
            number: "1",
            title: "信源矩阵",
            subtitle: "Source Matrix",
            icon: "network",
            color: .blue
        ) {
            VStack(alignment: .leading, spacing: 16) {
                // 交叉验证状态
                HStack {
                    Image(systemName: matrix.crossVerified ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                        .foregroundColor(matrix.crossVerified ? .green : .orange)
                    Text(matrix.crossVerified ? "已完成交叉验证" : "待交叉验证")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(matrix.crossVerified ? .green : .orange)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    (matrix.crossVerified ? Color.green : Color.orange)
                        .opacity(0.1)
                )
                .cornerRadius(8)
                
                // 首发媒体
                SourceTypeRow(
                    icon: "star.fill",
                    title: "首发媒体",
                    sources: [matrix.firstSource],
                    color: .yellow
                )
                
                // 官方来源
                if !matrix.official.isEmpty {
                    SourceTypeRow(
                        icon: "building.2.fill",
                        title: "官方来源",
                        sources: matrix.official,
                        color: .blue
                    )
                }
                
                // 权威媒体
                if !matrix.authoritative.isEmpty {
                    SourceTypeRow(
                        icon: "newspaper.fill",
                        title: "权威媒体",
                        sources: matrix.authoritative,
                        color: .purple
                    )
                }
                
                // 社交爆料
                if !matrix.social.isEmpty {
                    SourceTypeRow(
                        icon: "bubble.left.and.bubble.right.fill",
                        title: "社交爆料",
                        sources: matrix.social,
                        color: .orange
                    )
                }
            }
        }
    }
    
    // MARK: - 2. 共识与冲突审计
    private func consensusGapsSection(_ consensusGaps: News.AIAnalysis.SevenElements.ConsensusGaps) -> some View {
        ElementCard(
            number: "2",
            title: "共识与冲突审计",
            subtitle: "Consensus & Gaps",
            icon: "scale.3d",
            color: .green
        ) {
            VStack(alignment: .leading, spacing: 20) {
                // 全网公认的事实
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("全网公认的事实")
                            .font(.headline)
                            .fontWeight(.semibold)
                    }
                    
                    ForEach(consensusGaps.consensus.indices, id: \.self) { index in
                        HStack(alignment: .top, spacing: 8) {
                            Text("✓")
                                .foregroundColor(.green)
                                .fontWeight(.bold)
                            Text(consensusGaps.consensus[index])
                                .font(.subheadline)
                                .foregroundColor(.primary)
                        }
                        .padding(.leading, 8)
                    }
                }
                .padding()
                .background(Color.green.opacity(0.05))
                .cornerRadius(12)
                
                // 各方说法不一的漏洞
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.orange)
                        Text("各方说法不一的漏洞")
                            .font(.headline)
                            .fontWeight(.semibold)
                    }
                    
                    ForEach(consensusGaps.gaps.indices, id: \.self) { index in
                        HStack(alignment: .top, spacing: 8) {
                            Text("?")
                                .foregroundColor(.orange)
                                .fontWeight(.bold)
                            Text(consensusGaps.gaps[index])
                                .font(.subheadline)
                                .foregroundColor(.primary)
                        }
                        .padding(.leading, 8)
                    }
                }
                .padding()
                .background(Color.orange.opacity(0.05))
                .cornerRadius(12)
            }
        }
    }
    
    // MARK: - 3. 事实核查清单
    private func factCheckSection(_ items: [News.AIAnalysis.SevenElements.FactCheckItem]) -> some View {
        ElementCard(
            number: "3",
            title: "事实核查清单",
            subtitle: "Fact-Check List",
            icon: "checklist",
            color: .purple
        ) {
            VStack(spacing: 12) {
                ForEach(items.indices, id: \.self) { index in
                    FactCheckRow(item: items[index])
                }
            }
        }
    }
    
    // MARK: - 4. 底层原理拆解
    private func baseLogicSection(_ logic: String) -> some View {
        ElementCard(
            number: "4",
            title: "底层原理拆解",
            subtitle: "Base Logic",
            icon: "gearshape.2.fill",
            color: .indigo
        ) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Image(systemName: "lightbulb.fill")
                        .foregroundColor(.yellow)
                    Text("回归技术或经济常识，解释这件事在物理/法律层面为何能发生")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.bottom, 4)
                
                Text(logic)
                    .font(.body)
                    .foregroundColor(.primary)
                    .lineSpacing(6)
            }
            .padding()
            .background(Color.indigo.opacity(0.05))
            .cornerRadius(12)
        }
    }
    
    // MARK: - 5. 证伪预警
    private func falsificationSection(_ falsification: News.AIAnalysis.SevenElements.Falsification) -> some View {
        ElementCard(
            number: "5",
            title: "证伪预警",
            subtitle: "Falsification",
            icon: "exclamationmark.shield.fill",
            color: .red
        ) {
            VStack(alignment: .leading, spacing: 16) {
                // 证伪条件
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.red)
                        Text("如果发生以下情况，则证明本新闻为假")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                    }
                    
                    ForEach(falsification.conditions.indices, id: \.self) { index in
                        HStack(alignment: .top, spacing: 8) {
                            Text("\(index + 1).")
                                .foregroundColor(.red)
                                .fontWeight(.bold)
                            Text(falsification.conditions[index])
                                .font(.subheadline)
                                .foregroundColor(.primary)
                        }
                        .padding(.leading, 8)
                    }
                }
                .padding()
                .background(Color.red.opacity(0.05))
                .cornerRadius(12)
                
                // 观察点
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: "eye.fill")
                            .foregroundColor(.orange)
                        Text("观察点")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                    }
                    
                    ForEach(falsification.observationPoints.indices, id: \.self) { index in
                        HStack(alignment: .top, spacing: 8) {
                            Circle()
                                .fill(Color.orange)
                                .frame(width: 6, height: 6)
                                .padding(.top, 6)
                            Text(falsification.observationPoints[index])
                                .font(.subheadline)
                                .foregroundColor(.primary)
                        }
                        .padding(.leading, 8)
                    }
                }
                .padding()
                .background(Color.orange.opacity(0.05))
                .cornerRadius(12)
            }
        }
    }
    
    // MARK: - 6. 置信度印章
    private func trustScoreSection(_ trustScore: News.AIAnalysis.SevenElements.TrustScore) -> some View {
        ElementCard(
            number: "6",
            title: "置信度印章",
            subtitle: "Trust Score",
            icon: "seal.fill",
            color: .cyan
        ) {
            VStack(spacing: 20) {
                // 总分
                VStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .stroke(Color.cyan.opacity(0.2), lineWidth: 12)
                            .frame(width: 120, height: 120)
                        
                        Circle()
                            .trim(from: 0, to: CGFloat(trustScore.score) / 100)
                            .stroke(
                                LinearGradient(
                                    gradient: Gradient(colors: [Color.cyan, Color.blue]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                style: StrokeStyle(lineWidth: 12, lineCap: .round)
                            )
                            .frame(width: 120, height: 120)
                            .rotationEffect(.degrees(-90))
                        
                        VStack(spacing: 4) {
                            Text("\(trustScore.score)")
                                .font(.system(size: 40, weight: .bold))
                                .foregroundColor(.cyan)
                            Text("/ 100")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Text(getTrustLevel(trustScore.score))
                        .font(.headline)
                        .foregroundColor(getTrustColor(trustScore.score))
                }
                
                // 细分指标
                VStack(spacing: 12) {
                    TrustMetricRow(
                        title: "证据链完整性",
                        score: trustScore.evidenceCompleteness,
                        color: .blue
                    )
                    TrustMetricRow(
                        title: "信源可靠性",
                        score: trustScore.sourceReliability,
                        color: .green
                    )
                    TrustMetricRow(
                        title: "逻辑一致性",
                        score: trustScore.logicConsistency,
                        color: .purple
                    )
                }
                
                // 评分说明
                Text(trustScore.summary)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding()
                    .background(Color.cyan.opacity(0.05))
                    .cornerRadius(12)
            }
        }
    }
    
    // MARK: - 7. 情报时间轴
    private func originSection(_ origin: News.AIAnalysis.SevenElements.Origin) -> some View {
        ElementCard(
            number: "7",
            title: "情报时间轴",
            subtitle: "The Origin",
            icon: "timeline.selection",
            color: .orange
        ) {
            VStack(alignment: .leading, spacing: 0) {
                ForEach(origin.milestones.indices, id: \.self) { index in
                    TimelineMilestone(
                        milestone: origin.milestones[index],
                        isLast: index == origin.milestones.count - 1
                    )
                }
            }
        }
    }
    
    // MARK: - 空状态
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            
            Text("暂无7要素分析数据")
                .font(.headline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
    
    // MARK: - 辅助方法
    private func getTrustLevel(_ score: Int) -> String {
        switch score {
        case 90...100: return "高度可信"
        case 70..<90: return "基本可信"
        case 50..<70: return "谨慎对待"
        default: return "存疑"
        }
    }
    
    private func getTrustColor(_ score: Int) -> Color {
        switch score {
        case 90...100: return .green
        case 70..<90: return .cyan
        case 50..<70: return .orange
        default: return .red
        }
    }
}

// MARK: - 要素卡片容器
struct ElementCard<Content: View>: View {
    let number: String
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let content: Content
    
    init(
        number: String,
        title: String,
        subtitle: String,
        icon: String,
        color: Color,
        @ViewBuilder content: () -> Content
    ) {
        self.number = number
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
        self.color = color
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [color, color.opacity(0.7)]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 44, height: 44)
                    
                    Text(number)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
            }
            
            // 内容
            content
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 2)
    }
}

// MARK: - 信源类型行
struct SourceTypeRow: View {
    let icon: String
    let title: String
    let sources: [String]
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }
            
            ForEach(sources, id: \.self) { source in
                HStack(spacing: 8) {
                    Circle()
                        .fill(color)
                        .frame(width: 4, height: 4)
                    Text(source)
                        .font(.subheadline)
                        .foregroundColor(.primary)
                }
                .padding(.leading, 8)
            }
        }
    }
}

// MARK: - 事实核查行
struct FactCheckRow: View {
    let item: News.AIAnalysis.SevenElements.FactCheckItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top, spacing: 8) {
                // 状态标签
                Text(item.status)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(item.status == "[已证实]" ? .green : .orange)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        (item.status == "[已证实]" ? Color.green : Color.orange)
                            .opacity(0.15)
                    )
                    .cornerRadius(6)
                
                // 声明
                Text(item.claim)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
            }
            
            // 证据
            if let evidence = item.evidence {
                Text(evidence)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.leading, 8)
            }
        }
        .padding()
        .background(Color(UIColor.tertiarySystemGroupedBackground))
        .cornerRadius(10)
    }
}

// MARK: - 置信度指标行
struct TrustMetricRow: View {
    let title: String
    let score: Int
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.primary)
                Spacer()
                Text("\(score)")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(color)
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(color.opacity(0.2))
                        .frame(height: 6)
                        .cornerRadius(3)
                    
                    Rectangle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [color, color.opacity(0.7)]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geometry.size.width * CGFloat(score) / 100, height: 6)
                        .cornerRadius(3)
                }
            }
            .frame(height: 6)
        }
    }
}

// MARK: - 时间轴里程碑
struct TimelineMilestone: View {
    let milestone: News.AIAnalysis.SevenElements.Origin.Milestone
    let isLast: Bool
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // 时间轴线
            VStack(spacing: 0) {
                Circle()
                    .fill(Color.orange)
                    .frame(width: 12, height: 12)
                
                if !isLast {
                    Rectangle()
                        .fill(Color.orange.opacity(0.3))
                        .frame(width: 2)
                }
            }
            
            // 内容
            VStack(alignment: .leading, spacing: 8) {
                Text(milestone.date)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.orange)
                
                Text(milestone.event)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Text(milestone.significance)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineSpacing(4)
            }
            .padding(.bottom, isLast ? 0 : 20)
        }
    }
}

// MARK: - 预览
struct SevenElementsView_Previews: PreviewProvider {
    static var previews: some View {
        SevenElementsView(news: News.generateMockNews()[0])
    }
}
