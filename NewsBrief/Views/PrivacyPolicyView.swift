//
//  PrivacyPolicyView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-20.
//

import SwiftUI

// MARK: - 隐私政策和用户协议视图
enum PrivacyContentType {
    case privacyPolicy
    case userAgreement
    
    var title: String {
        switch self {
        case .privacyPolicy:
            return "隐私政策"
        case .userAgreement:
            return "用户协议"
        }
    }
    
    var content: String {
        switch self {
        case .privacyPolicy:
            return "隐私政策内容\n\n1. 我们重视您的隐私\n我们致力于保护您的个人隐私，确保您的个人信息安全。\n\n2. 我们收集的信息\n我们可能收集您的账号信息、使用数据等，用于提供更好的服务。\n\n3. 信息的使用\n您的信息将仅用于提供服务、改进产品和发送重要通知。\n\n4. 信息的保护\n我们采取严格的安全措施保护您的信息，防止未经授权的访问和使用。\n\n5. 信息的共享\n我们不会向第三方共享您的个人信息，除非法律要求或您明确同意。\n\n6. 您的权利\n您有权访问、修改或删除您的个人信息。\n\n7. 隐私政策的更新\n我们可能会更新隐私政策，更新后的政策将在应用内公布。\n\n8. 联系方式\n如有任何问题，请联系我们。"
        case .userAgreement:
            return "用户协议内容\n\n1. 协议的接受\n使用本应用即表示您接受本用户协议的所有条款和条件。\n\n2. 账号注册\n您需要注册账号才能使用本应用的全部功能。\n\n3. 账号安全\n您有责任维护账号的安全，不得将账号转让或共享给他人。\n\n4. 服务内容\n我们提供新闻资讯、情报分析等服务，服务内容可能会随时更新。\n\n5. 用户行为规范\n您不得使用本应用从事违法活动，不得发布有害信息。\n\n6. 知识产权\n本应用的所有内容和技术均受知识产权法律保护。\n\n7. 服务的变更和终止\n我们有权随时变更或终止服务，无需提前通知。\n\n8. 责任限制\n我们不对因使用本应用而产生的任何损失承担责任。\n\n9. 协议的修改\n我们可能会修改本协议，修改后的协议将在应用内公布。\n\n10. 法律适用\n本协议受中华人民共和国法律管辖。"
        }
    }
}

struct PrivacyPolicyView: View {
    let contentType: PrivacyContentType
    
    var body: some View {
        ZStack {
            // 深海蓝渐变色背景
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 20) {
                    Text(contentType.title)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text(contentType.content)
                        .font(.body)
                        .foregroundColor(.white.opacity(0.8))
                        .lineSpacing(8)
                }
                .padding()
            }
        }
        .navigationTitle(contentType.title)
        .navigationBarTitleDisplayMode(.inline)
        .tint(.white)
    }
}