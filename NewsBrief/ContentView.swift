//
//  ContentView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-01.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var newsViewModel: NewsViewModel
    @EnvironmentObject var favoritesManager: FavoritesManager
    @EnvironmentObject var noteManager: NoteManager
    
    // 检查是否已完成引导流程
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding: Bool = false
    
    var body: some View {
        Group {
            if let errorMessage = newsViewModel.errorMessage {
                ErrorView(
                    message: errorMessage,
                    retryAction: {
                        Task {
                            await newsViewModel.refreshNews()
                        }
                    }
                )
                .onAppear {
                    print("❌ ContentView: 显示错误页面 - \(errorMessage)")
                }
            } else if !hasCompletedOnboarding {
                // 显示引导流程
                OnboardingView()
                    .onAppear {
                        print("📱 ContentView: 显示引导页面")
                    }
                    .onDisappear {
                        // 当引导流程消失时，检查是否已完成
                        hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
                        print("✅ ContentView: 引导流程完成")
                    }
            } else {
                // 显示主界面
                TabBarView()
                    .onAppear {
                        print("✅ ContentView: 显示主界面，新闻数量: \(newsViewModel.news.count)")
                    }
            }
        }
        .task {
            print("🚀 ContentView: 开始加载新闻...")
            // 应用启动时加载新闻
            await newsViewModel.fetchNews()
            print("✅ ContentView: 新闻加载完成，共 \(newsViewModel.news.count) 条")
            if let error = newsViewModel.errorMessage {
                print("❌ ContentView: 加载出错 - \(error)")
            }
        }
        .refreshable {
            print("🔄 ContentView: 用户下拉刷新")
            await newsViewModel.refreshNews()
        }
        .overlay {
            if newsViewModel.isLoading {
                LoadingView()
            }
        }
        // 设置全局背景色为深海蓝渐变
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
        .edgesIgnoringSafeArea(.all)
    }
}

#Preview {
    ContentView()
        .environmentObject(NewsViewModel())
        .environmentObject(FavoritesManager())
}
