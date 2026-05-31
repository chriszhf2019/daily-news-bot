//
//  ReadingModeSelector.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  阅读模式选择器组件
//

import SwiftUI

// MARK: - 阅读模式选择器
struct ReadingModeSelector: View {
    @Binding var selectedMode: ReadingMode
    
    var body: some View {
        HStack(spacing: Spacing.sm + 2) {
            ForEach(ReadingMode.allCases) { mode in
                ReadingModeButton(
                    mode: mode,
                    isSelected: selectedMode == mode,
                    action: {
                        withAnimation(Animation.quick) {
                            selectedMode = mode
                        }
                        
                        // 触觉反馈
                        let generator = UIImpactFeedbackGenerator(style: .light)
                        generator.impactOccurred()
                    }
                )
            }
        }
        .padding(.horizontal, Spacing.lg)
    }
}

// MARK: - 阅读模式按钮
private struct ReadingModeButton: View {
    let mode: ReadingMode
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(mode.rawValue)
                .font(Typography.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundColor(isSelected ? .white : .white.opacity(0.6))
                .padding(.horizontal, Spacing.lg)
                .padding(.vertical, Spacing.sm + 2)
                .background(
                    RoundedRectangle(cornerRadius: CornerRadius.xl)
                        .fill(isSelected ? Color.pointBlue : Color.white.opacity(0.1))
                )
                .scaleEffect(isSelected ? 1.05 : 1.0)
        }
        .animation(Animation.spring, value: isSelected)
    }
}

#Preview {
    ZStack {
        LinearGradient.deepOceanGradient
            .ignoresSafeArea()
        
        ReadingModeSelector(selectedMode: .constant(.standard))
    }
}
