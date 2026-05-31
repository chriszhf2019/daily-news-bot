//
//  ErrorView.swift
//  点透 (Point)
//
//  Created by haifangzhao on 2025-01-01.
//

import SwiftUI

// MARK: - 点透蓝
private let pointBlue = Color(hex: "3B82F6")

// MARK: - 错误视图
struct ErrorView: View {
    let message: String
    let retryAction: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            // 品牌化错误图标
            ZStack {
                Circle()
                    .fill(Color.orange.opacity(0.2))
                    .frame(width: 80, height: 80)
                
                Image(systemName: "exclamationmark.triangle")
                    .font(.system(size: 36))
                    .foregroundColor(.orange)
            }
            
            Text("点透遇到了一点小问题")
                .font(.title3)
                .fontWeight(.medium)
                .foregroundColor(.white)
            
            Text(message)
                .font(.body)
                .foregroundColor(.white.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button(action: retryAction) {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.clockwise")
                    Text("让点透再试一次")
                }
                .font(.headline)
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(
                    LinearGradient(
                        gradient: Gradient(colors: [pointBlue, Color.purple]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(24)
                .shadow(color: pointBlue.opacity(0.4), radius: 8, x: 0, y: 4)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
    }
}

// MARK: - 网络错误视图
struct NetworkErrorView: View {
    let retryAction: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .fill(Color.red.opacity(0.2))
                    .frame(width: 80, height: 80)
                
                Image(systemName: "wifi.slash")
                    .font(.system(size: 36))
                    .foregroundColor(.red)
            }
            
            Text("点透暂时连不上网络")
                .font(.title3)
                .fontWeight(.medium)
                .foregroundColor(.white)
            
            Text("请检查网络连接后，让点透重新为你工作")
                .font(.body)
                .foregroundColor(.white.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button(action: retryAction) {
                HStack(spacing: 8) {
                    Image(systemName: "wifi")
                    Text("重新连接")
                }
                .font(.headline)
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(Color.green)
                .cornerRadius(24)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
    }
}

// MARK: - 服务器错误视图
struct ServerErrorView: View {
    let retryAction: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .fill(Color.orange.opacity(0.2))
                    .frame(width: 80, height: 80)
                
                Image(systemName: "server.rack")
                    .font(.system(size: 36))
                    .foregroundColor(.orange)
            }
            
            Text("点透的服务器正在休息")
                .font(.title3)
                .fontWeight(.medium)
                .foregroundColor(.white)
            
            Text("服务器暂时无法响应，点透正在努力恢复中...")
                .font(.body)
                .foregroundColor(.white.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button(action: retryAction) {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.clockwise")
                    Text("稍后重试")
                }
                .font(.headline)
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(pointBlue)
                .cornerRadius(24)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
    }
}

// MARK: - 未知错误视图
struct UnknownErrorView: View {
    let error: Error
    let retryAction: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .fill(Color.gray.opacity(0.2))
                    .frame(width: 80, height: 80)
                
                Image(systemName: "questionmark.circle")
                    .font(.system(size: 36))
                    .foregroundColor(.gray)
            }
            
            Text("点透遇到了未知情况")
                .font(.title3)
                .fontWeight(.medium)
                .foregroundColor(.white)
            
            VStack(spacing: 8) {
                Text("出现了意外错误，点透正在分析原因...")
                    .font(.body)
                    .foregroundColor(.white.opacity(0.7))
                
                Text(error.localizedDescription)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.5))
                    .multilineTextAlignment(.center)
                    .padding()
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(8)
            }
            .padding(.horizontal, 40)
            
            Button(action: retryAction) {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.clockwise")
                    Text("让点透再试一次")
                }
                .font(.headline)
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(pointBlue)
                .cornerRadius(24)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
    }
}

// MARK: - 错误处理扩展
extension Error {
    var isNetworkError: Bool {
        return (self as NSError).domain == NSURLErrorDomain
    }
    
    var isServerError: Bool {
        let error = self as NSError
        return error.code >= 500 && error.code <= 599
    }
    
    var localizedDescription: String {
        if isNetworkError {
            return "网络连接出现问题，请检查网络设置"
        } else if isServerError {
            return "服务器暂时无法响应，请稍后重试"
        } else {
            return "发生了未知错误，请稍后重试"
        }
    }
}

#Preview {
    ErrorView(message: "测试错误") {
        print("重试")
    }
}