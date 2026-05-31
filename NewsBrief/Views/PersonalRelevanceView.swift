//
//  PersonalRelevanceView.swift
//  NewsBrief
//
//  Created by Kiro on 2026-02-26.
//

import SwiftUI

// MARK: - 用户身份类型
enum UserIdentity: String, CaseIterable {
    case teacher = "教师"
    case developer = "程序员"
    case investor = "投资者"
    case manager = "管理者"
    case student = "学生"
    
    var icon: String {
        switch self {
        case .teacher: return "�‍🏫"
        case .developer: return "💻"
        case .investor: return "📈"
        case .manager: return "👔"
        case .student: return "🎓"
        }
    }
}

// MARK: - AI分析结果
struct AIAnalysisResult: Codable {
    let impact: String           // 核心影响
    let suggestions: [String]    // 行动建议
    let timeframe: String        // 时间框架
    let riskLevel: String        // 风险等级
    
    enum CodingKeys: String, CodingKey {
        case impact
        case suggestions
        case timeframe
        case riskLevel = "risk_level"
    }
}

// MARK: - 这条新闻与我何干视图
struct PersonalRelevanceView: View {
    let news: News
    @Environment(\.dismiss) private var dismiss
    @State private var selectedIdentity: UserIdentity?
    @State private var customIdentity: String = ""
    @State private var analysisResult: AIAnalysisResult?
    @State private var isAnalyzing = false
    @State private var showResult = false
    @State private var errorMessage: String?
    @State private var showError = false
    
    var currentIdentity: String {
        if !customIdentity.isEmpty {
            return customIdentity
        } else if let selected = selectedIdentity {
            return selected.rawValue
        }
        return ""
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // 标题区域
                    headerSection
                    
                    // 身份标签网格
                    identityTagsSection
                    
                    // 输入与操作区
                    inputAndActionSection
                    
                    // 结果展示
                    if showResult, let result = analysisResult {
                        resultPanel(result)
                            .transition(.asymmetric(
                                insertion: .scale.combined(with: .opacity),
                                removal: .opacity
                            ))
                    }
                    
                    // 错误提示
                    if showError, let error = errorMessage {
                        errorPanel(error)
                            .transition(.asymmetric(
                                insertion: .scale.combined(with: .opacity),
                                removal: .opacity
                            ))
                    }
                }
                .padding()
            }
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        dismiss()
                    }) {
                        Image(systemName: "xmark")
                            .foregroundColor(.white)
                    }
                }
            }
        }
    }
    
    // MARK: - 标题区域
    private var headerSection: some View {
        HStack(spacing: 12) {
            Text("🎯")
                .font(.title)
            
            Text("这条新闻与我何干？")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
        }
        .padding(.bottom, 8)
    }
    
    // MARK: - 身份标签网格
    private var identityTagsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("选择你的身份")
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.7))
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(UserIdentity.allCases, id: \.self) { identity in
                    IdentityTag(
                        identity: identity,
                        isSelected: selectedIdentity == identity
                    ) {
                        selectIdentity(identity)
                    }
                }
            }
        }
    }
    
    // MARK: - 输入与操作区
    private var inputAndActionSection: some View {
        VStack(spacing: 16) {
            HStack(spacing: 12) {
                // 输入框
                TextField("或自定义身份...", text: $customIdentity)
                    .padding()
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(12)
                    .foregroundColor(.white)
                    .onChange(of: customIdentity) { _ in
                        if !customIdentity.isEmpty {
                            selectedIdentity = nil
                        }
                    }
                
                // 分析按钮
                Button(action: {
                    analyzeNews()
                }) {
                    HStack {
                        if isAnalyzing {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        } else {
                            Text("分析")
                                .fontWeight(.bold)
                        }
                    }
                    .frame(width: 80)
                    .padding()
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [Color(hex: "3B82F6"), Color(hex: "1D4ED8")]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(currentIdentity.isEmpty || isAnalyzing)
                .opacity(currentIdentity.isEmpty ? 0.5 : 1.0)
            }
            
            // 新闻标题预览
            VStack(alignment: .leading, spacing: 8) {
                Text("分析新闻")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.5))
                
                Text(news.title)
                    .font(.body)
                    .foregroundColor(.white.opacity(0.8))
                    .lineLimit(2)
            }
            .padding()
            .background(Color.white.opacity(0.05))
            .cornerRadius(12)
        }
    }
    
    // MARK: - 结果面板
    private func resultPanel(_ result: AIAnalysisResult) -> some View {
        VStack(alignment: .leading, spacing: 20) {
            // 直接影响
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("⚡")
                        .font(.title3)
                    Text("直接影响")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                
                Text(result.impact)
                    .font(.body)
                    .foregroundColor(.white.opacity(0.9))
                    .lineSpacing(4)
            }
            
            Divider()
                .background(Color.white.opacity(0.2))
            
            // 行动建议
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("💡")
                        .font(.title3)
                    Text("行动建议")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                
                ForEach(result.suggestions.indices, id: \.self) { index in
                    HStack(alignment: .top, spacing: 8) {
                        Text("\(index + 1).")
                            .font(.body)
                            .foregroundColor(Color(hex: "3B82F6"))
                            .fontWeight(.bold)
                        
                        Text(result.suggestions[index])
                            .font(.body)
                            .foregroundColor(.white.opacity(0.9))
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            
            Divider()
                .background(Color.white.opacity(0.2))
            
            // 预警时钟和风险等级
            HStack(spacing: 24) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("🕒")
                        Text("预警时钟")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white.opacity(0.7))
                    }
                    
                    Text(result.timeframe)
                        .font(.body)
                        .fontWeight(.bold)
                        .foregroundColor(timeframeColor(result.timeframe))
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    HStack {
                        Text("风险等级")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white.opacity(0.7))
                        Text(riskIcon(result.riskLevel))
                    }
                    
                    Text(result.riskLevel)
                        .font(.body)
                        .fontWeight(.bold)
                        .foregroundColor(riskColor(result.riskLevel))
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(hex: "1E3A8A").opacity(0.3))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color(hex: "3B82F6").opacity(0.3), lineWidth: 1)
                )
        )
        .shadow(color: Color(hex: "3B82F6").opacity(0.2), radius: 10, x: 0, y: 4)
    }
    
    // MARK: - 错误面板
    private func errorPanel(_ message: String) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.title2)
                    .foregroundColor(Color(hex: "EF4444"))
                
                Text("分析失败")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }
            
            Text(message)
                .font(.body)
                .foregroundColor(.white.opacity(0.9))
                .lineSpacing(4)
            
            Button(action: {
                showError = false
                analyzeNews()
            }) {
                HStack {
                    Image(systemName: "arrow.clockwise")
                    Text("重新分析")
                }
                .font(.body)
                .fontWeight(.medium)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(hex: "EF4444"))
                .cornerRadius(12)
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(hex: "7F1D1D").opacity(0.3))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color(hex: "EF4444").opacity(0.3), lineWidth: 1)
                )
        )
        .shadow(color: Color(hex: "EF4444").opacity(0.2), radius: 10, x: 0, y: 4)
    }
    
    // MARK: - 辅助方法
    private func selectIdentity(_ identity: UserIdentity) {
        selectedIdentity = identity
        customIdentity = ""
        
        // 触觉反馈
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    private func analyzeNews() {
        guard !currentIdentity.isEmpty else { return }
        
        isAnalyzing = true
        showResult = false
        showError = false
        
        // 触觉反馈
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
        
        // 调用AI分析服务
        PersonalRelevanceService.shared.analyzeNewsRelevance(
            title: news.title,
            summary: news.summary,
            userIdentity: currentIdentity
        ) { result in
            isAnalyzing = false
            
            switch result {
            case .success(let analysis):
                analysisResult = analysis
                withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                    showResult = true
                }
                
                // 成功反馈
                let notificationFeedback = UINotificationFeedbackGenerator()
                notificationFeedback.notificationOccurred(.success)
                
            case .failure(let error):
                errorMessage = "分析失败：\(error.localizedDescription)"
                withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                    showError = true
                }
                
                // 错误反馈
                let notificationFeedback = UINotificationFeedbackGenerator()
                notificationFeedback.notificationOccurred(.error)
            }
        }
    }
    
    private func timeframeColor(_ timeframe: String) -> Color {
        if timeframe.contains("即刻") {
            return Color(hex: "EF4444") // 红色
        } else if timeframe.contains("短期") {
            return Color(hex: "F59E0B") // 橙色
        } else {
            return Color(hex: "10B981") // 绿色
        }
    }
    
    private func riskColor(_ risk: String) -> Color {
        switch risk {
        case "高":
            return Color(hex: "EF4444")
        case "中":
            return Color(hex: "F59E0B")
        case "低":
            return Color(hex: "10B981")
        default:
            return .gray
        }
    }
    
    private func riskIcon(_ risk: String) -> String {
        switch risk {
        case "高":
            return "⚠️"
        case "中":
            return "⚡"
        case "低":
            return "✅"
        default:
            return "ℹ️"
        }
    }
}

// MARK: - 身份标签组件
struct IdentityTag: View {
    let identity: UserIdentity
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 6) {
                Text(identity.icon)
                    .font(.body)
                
                Text(identity.rawValue)
                    .font(.subheadline)
                    .fontWeight(isSelected ? .bold : .medium)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(isSelected ? Color(hex: "3B82F6") : Color.white.opacity(0.1))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(
                        isSelected ? Color(hex: "3B82F6") : Color.white.opacity(0.2),
                        lineWidth: isSelected ? 2 : 1
                    )
            )
            .foregroundColor(.white)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    PersonalRelevanceView(news: News.generateMockNews().first!)
}
