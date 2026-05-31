//
//  DesignSystem.swift
//  NewsBrief
//
//  Created by Kiro on 2025-01-20.
//  统一的设计系统 - 颜色、间距、圆角、字体等
//

import SwiftUI

// MARK: - 颜色系统
extension Color {
    // 品牌色
    static let pointBlue = Color(hex: "3B82F6")
    static let pointPurple = Color(hex: "7C3AED")
    
    // 背景色
    static let deepOcean = Color(hex: "0F172A")
    static let oceanDark = Color(hex: "1E293B")
    static let oceanMedium = Color(hex: "334155")
    
    // 功能色
    static let accentCyan = Color(hex: "06B6D4")
    static let accentOrange = Color(hex: "F59E0B")
    static let accentGreen = Color(hex: "10B981")
    static let accentRed = Color(hex: "EF4444")
    static let accentPink = Color(hex: "EC4899")
    static let accentYellow = Color(hex: "FBBF24")
    
    // 辅助方法：从十六进制创建颜色
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - 渐变色
extension LinearGradient {
    // 深海蓝渐变（主背景）
    static let deepOceanGradient = LinearGradient(
        gradient: Gradient(colors: [.deepOcean, .oceanDark]),
        startPoint: .top,
        endPoint: .bottom
    )
    
    // 点透蓝渐变
    static let pointBlueGradient = LinearGradient(
        gradient: Gradient(colors: [.pointBlue, .pointPurple]),
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // 青色渐变
    static let cyanGradient = LinearGradient(
        gradient: Gradient(colors: [.accentCyan, .pointBlue]),
        startPoint: .leading,
        endPoint: .trailing
    )
}

// MARK: - 间距系统
enum Spacing {
    static let xxs: CGFloat = 2
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24
    static let xxxl: CGFloat = 32
}

// MARK: - 圆角系统
enum CornerRadius {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24
    static let circle: CGFloat = 999
}

// MARK: - 字体系统
enum Typography {
    // 标题
    static let largeTitle = Font.system(size: 34, weight: .bold)
    static let title1 = Font.system(size: 28, weight: .bold)
    static let title2 = Font.system(size: 22, weight: .bold)
    static let title3 = Font.system(size: 20, weight: .semibold)
    
    // 正文
    static let body = Font.system(size: 17, weight: .regular)
    static let bodyBold = Font.system(size: 17, weight: .semibold)
    static let callout = Font.system(size: 16, weight: .regular)
    
    // 辅助文字
    static let subheadline = Font.system(size: 15, weight: .regular)
    static let footnote = Font.system(size: 13, weight: .regular)
    static let caption1 = Font.system(size: 12, weight: .regular)
    static let caption2 = Font.system(size: 11, weight: .regular)
    
    // 等宽字体（用于数字）
    static let monospacedDigit = Font.system(size: 17, weight: .regular, design: .monospaced)
}

// MARK: - 阴影系统
enum Shadow {
    static let small = (color: Color.black.opacity(0.1), radius: CGFloat(4), x: CGFloat(0), y: CGFloat(2))
    static let medium = (color: Color.black.opacity(0.15), radius: CGFloat(8), x: CGFloat(0), y: CGFloat(4))
    static let large = (color: Color.black.opacity(0.2), radius: CGFloat(12), x: CGFloat(0), y: CGFloat(6))
    
    // 发光效果
    static func glow(color: Color, radius: CGFloat = 8) -> (color: Color, radius: CGFloat, x: CGFloat, y: CGFloat) {
        return (color: color.opacity(0.6), radius: radius, x: 0, y: 0)
    }
}

// MARK: - 图标尺寸
enum IconSize {
    static let xs: CGFloat = 12
    static let sm: CGFloat = 16
    static let md: CGFloat = 20
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 40
}

// MARK: - 动画配置
enum Animation {
    static let quick = SwiftUI.Animation.easeInOut(duration: 0.2)
    static let standard = SwiftUI.Animation.easeInOut(duration: 0.3)
    static let slow = SwiftUI.Animation.easeInOut(duration: 0.5)
    static let spring = SwiftUI.Animation.spring(response: 0.4, dampingFraction: 0.8)
}

// MARK: - 可复用的卡片组件
struct GlassCard<Content: View>: View {
    let content: Content
    let padding: CGFloat
    let cornerRadius: CGFloat
    
    init(
        padding: CGFloat = Spacing.xl,
        cornerRadius: CGFloat = CornerRadius.lg,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.padding = padding
        self.cornerRadius = cornerRadius
    }
    
    var body: some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Material.ultraThinMaterial)
                    .opacity(0.6)
                    .background(
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .fill(Color.white.opacity(0.05))
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(Color.white.opacity(0.08), lineWidth: 1)
            )
            .shadow(
                color: Shadow.medium.color,
                radius: Shadow.medium.radius,
                x: Shadow.medium.x,
                y: Shadow.medium.y
            )
    }
}

// MARK: - 发光卡片组件
struct GlowCard<Content: View>: View {
    let content: Content
    let glowColor: Color
    let padding: CGFloat
    let cornerRadius: CGFloat
    
    init(
        glowColor: Color = .pointBlue,
        padding: CGFloat = Spacing.xl,
        cornerRadius: CGFloat = CornerRadius.lg,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.glowColor = glowColor
        self.padding = padding
        self.cornerRadius = cornerRadius
    }
    
    var body: some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Material.ultraThinMaterial)
                    .opacity(0.6)
                    .background(
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .fill(Color.white.opacity(0.05))
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                glowColor.opacity(0.4),
                                glowColor.opacity(0.1)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .shadow(
                color: glowColor.opacity(0.2),
                radius: 12,
                x: 0,
                y: 6
            )
    }
}
