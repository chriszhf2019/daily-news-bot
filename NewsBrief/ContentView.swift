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
            } else if !hasCompletedOnboarding {
                // 显示引导流程
                OnboardingView()
                    .onDisappear {
                        // 当引导流程消失时，检查是否已完成
                        hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
                    }
            } else {
                // 显示主界面
                TabBarView()
            }
        }
        .task {
            // 使用优化后的加载方法，防止重复加载
            await newsViewModel.loadInitialDataIfNeeded()
        }
        .refreshable {
            await newsViewModel.refreshNews()
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
