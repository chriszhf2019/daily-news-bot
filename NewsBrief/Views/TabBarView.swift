//
//  TabBarView.swift
//  点透 (Point)
//
//  Created by haifangzhao on 2025-01-01.
//

import SwiftUI
import UIKit

// MARK: - 主标签栏视图
struct TabBarView: View {
    @State private var selectedTab = 0
    
    // 深海蓝渐变色
    private let deepOceanGradient = LinearGradient(
        gradient: Gradient(colors: [Color(hex: "0F172A"), Color(hex: "1E293B")]),
        startPoint: .top,
        endPoint: .bottom
    )
    
    // 点透蓝
    private let pointBlue = Color(hex: "3B82F6")
    
    var body: some View {
        ZStack {
            // 深海蓝渐变背景
            deepOceanGradient
                .ignoresSafeArea()
            
            TabView(selection: $selectedTab) {
            // 1. 首页 - 微观侦察中心
            NavigationView {
                NewsListView()
                    .navigationBarHidden(true)
            }
            .tabItem {
                VStack {
                    Image(systemName: "house.fill")
                    Text("首页")
                }
            }
            .tag(0)
            
            // 2. 情报 - 宏观研判中心
            NavigationView {
                IntelligenceView()
                    .navigationTitle("📊 情报")
            }
            .navigationBarTitleDisplayMode(.large)
            .tabItem {
                VStack {
                    Image(systemName: "chart.bar.fill")
                    Text("情报")
                }
            }
            .tag(1)
                
                // 3. 智库 - 个人知识库
                NavigationView {
                    FavoritesView()
                        .navigationTitle("📚 智库")
                }
                .navigationBarTitleDisplayMode(.large)
                .tabItem {
                    VStack {
                        Image(systemName: "books.vertical.fill")
                        Text("智库")
                    }
                }
                .tag(2)
                
                // 4. 我的 - 设置与人设定义
                NavigationView {
                    PersonalCenterView()
                        .navigationTitle("👤 我的")
                }
                .navigationBarTitleDisplayMode(.large)
                .tabItem {
                    VStack {
                        Image(systemName: "person.fill")
                        Text("我的")
                    }
                }
                .tag(3)
            }
            .accentColor(pointBlue)
            .background(deepOceanGradient)
        }
        .onAppear {
            // 设置全局导航栏样式
            UINavigationBar.appearance().backgroundColor = UIColor(Color(hex: "0F172A"))
            UINavigationBar.appearance().tintColor = .white
            UINavigationBar.appearance().titleTextAttributes = [.foregroundColor: UIColor.white]
        }
    }
}



#Preview {
    TabBarView()
}