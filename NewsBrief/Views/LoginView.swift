//
//  LoginView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-15.
//

import SwiftUI

// MARK: - 登录方式枚举
enum LoginMethod {
    case wechat
    case phone
    case emailPassword
}

// MARK: - 登录状态枚举
enum LoginStatus: Equatable {
    case initial
    case loading
    case success
    case failure(String)
}

// MARK: - 登录视图
struct LoginView: View {
    @Binding var isPresented: Bool
    @EnvironmentObject private var loginManager: LoginManager
    
    @State private var selectedMethod: LoginMethod = .wechat
    @State private var phoneNumber: String = ""
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var verificationCode: String = ""
    @State private var isLoadingCode: Bool = false
    @State private var countdown: Int = 0
    @State private var loginStatus: LoginStatus = .initial
    @State private var showSuccessAnimation: Bool = false
    
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        ZStack {
            // 半透明背景
            if isPresented {
                Color.black.opacity(0.5)
                    .ignoresSafeArea()
                    .onTapGesture {
                        withAnimation {
                            isPresented = false
                        }
                    }
            }
            
            VStack {
                Spacer()
                
                // 底部抽屉
                ZStack {
                    // 抽屉背景
                    VStack(spacing: 0) {
                        // 顶部指示器
                        RoundedRectangle(cornerRadius: 2.5)
                            .frame(width: 40, height: 5)
                            .foregroundColor(.gray.opacity(0.5))
                            .padding(.top, 10)
                            .padding(.bottom, 20)
                        
                        // 登录标题
                        Text("登录新闻简报")
                            .font(.title2)
                            .fontWeight(.bold)
                            .padding(.bottom, 24)
                        
                        // 登录方式选择
                        LoginMethodSelector(selectedMethod: $selectedMethod)
                        
                        // 登录表单
                        LoginForm(
                            selectedMethod: $selectedMethod,
                            phoneNumber: $phoneNumber,
                            email: $email,
                            password: $password,
                            verificationCode: $verificationCode,
                            isLoadingCode: $isLoadingCode,
                            countdown: $countdown,
                            onGetCode: { getVerificationCode() }
                        )
                        .padding(.horizontal, 24)
                        .padding(.top, 20)
                        
                        // 登录按钮
                        Button(action: { login() }) {
                            HStack {
                                if loginStatus == .loading {
                                    ProgressView()
                                        .foregroundColor(.white)
                                        .scaleEffect(0.8)
                                } else {
                                    Text(loginButtonText)
                                        .font(.headline)
                                        .fontWeight(.bold)
                                }
                            }
                            .foregroundColor(.white)
                            .padding(.vertical, 14)
                            .frame(maxWidth: .infinity)
                            .background(
                                LinearGradient(
                                    gradient: Gradient(colors: [Color.blue, Color.purple]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                                .opacity(loginButtonEnabled ? 1.0 : 0.6)
                            )
                            .cornerRadius(25)
                            .shadow(radius: 5)
                        }
                        .disabled(!loginButtonEnabled || loginStatus == .loading)
                        .padding(.horizontal, 24)
                        .padding(.top, 20)
                        
                        // 用户协议和隐私政策
                        VStack(spacing: 4) {
                            Text("登录即代表你同意")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                            HStack(spacing: 4) {
                                NavigationLink(destination: MarkdownView(title: "用户协议", markdownFile: "UserAgreement")) {
                                    Text("《用户协议》")
                                        .font(.caption2)
                                        .foregroundColor(.blue)
                                }
                                Text("与")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                                NavigationLink(destination: MarkdownView(title: "隐私政策", markdownFile: "PrivacyPolicy")) {
                                    Text("《隐私政策》")
                                        .font(.caption2)
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                        .padding(.top, 10)
                        
                        // 注册链接
                        HStack(spacing: 4) {
                            Text("还没有账号？")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            
                            Button(action: { register() }) {
                                Text("立即注册")
                                    .font(.subheadline)
                                    .fontWeight(.bold)
                                    .foregroundColor(.blue)
                            }
                        }
                        .padding(.top, 20)
                        
                        Spacer(minLength: 40)
                    }
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [Color.white, Color.blue.opacity(0.05)]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .cornerRadius(20, corners: [.topLeft, .topRight])
                    
                    // 登录成功动画
                    if showSuccessAnimation {
                        LoginSuccessAnimation(onDismiss: { dismissAndLogin() })
                    }
                    
                    // 错误提示
                    if case .failure(let message) = loginStatus {
                        LoginErrorView(message: message)
                    }
                }
                .frame(maxWidth: .infinity, minHeight: 500, maxHeight: 600)
                .transition(.move(edge: .bottom))
                .animation(.spring(response: 0.4, dampingFraction: 0.8), value: isPresented)
            }
        }
        .onReceive(timer) {_ in
            if countdown > 0 {
                countdown -= 1
            }
        }
    }
    
    // MARK: - 计算属性：登录按钮文本
    private var loginButtonText: String {
        switch selectedMethod {
        case .wechat:
            return "微信一键登录"
        case .phone:
            return "手机号快捷登录"
        case .emailPassword:
            return "账号密码登录"
        }
    }
    
    // MARK: - 计算属性：登录按钮是否可用
    private var loginButtonEnabled: Bool {
        switch selectedMethod {
        case .wechat:
            return true
        case .phone:
            return !phoneNumber.isEmpty && !verificationCode.isEmpty
        case .emailPassword:
            return !email.isEmpty && !password.isEmpty
        }
    }
    
    // MARK: - 获取验证码
    private func getVerificationCode() {
        guard !phoneNumber.isEmpty else {
            loginStatus = .failure("请输入手机号")
            return
        }
        
        // 模拟发送验证码
        isLoadingCode = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isLoadingCode = false
            countdown = 60
            loginStatus = .initial
        }
    }
    
    // MARK: - 登录
    private func login() {
        guard loginButtonEnabled else { return }
        
        loginStatus = .loading
        
        // 模拟登录请求
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            // 登录成功
            withAnimation {
                showSuccessAnimation = true
            }
        }
    }
    
    // MARK: - 注册
    private func register() {
        // 这里可以添加注册逻辑
        print("注册功能待实现")
    }
    
    // MARK: - 登录成功后关闭弹窗
    private func dismissAndLogin() {
        // 模拟登录成功
        loginManager.mockLogin()
        
        // 关闭弹窗
        withAnimation {
            isPresented = false
            showSuccessAnimation = false
        }
    }
}

// MARK: - 登录方式选择器
struct LoginMethodSelector: View {
    @Binding var selectedMethod: LoginMethod
    
    var body: some View {
        HStack(spacing: 12) {
            LoginMethodOption(
                method: .wechat,
                selectedMethod: $selectedMethod,
                icon: Image(systemName: "qrcode"),
                title: "微信登录"
            )
            
            LoginMethodOption(
                method: .phone,
                selectedMethod: $selectedMethod,
                icon: Image(systemName: "phone"),
                title: "手机号"
            )
            
            LoginMethodOption(
                method: .emailPassword,
                selectedMethod: $selectedMethod,
                icon: Image(systemName: "envelope"),
                title: "账号密码"
            )
        }
        .padding(.horizontal, 24)
    }
}

// MARK: - 登录方式选项
struct LoginMethodOption: View {
    let method: LoginMethod
    @Binding var selectedMethod: LoginMethod
    let icon: Image
    let title: String
    
    var body: some View {
        Button(action: { selectedMethod = method }) {
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(selectedMethod == method ? Color.blue.opacity(0.1) : Color.gray.opacity(0.1))
                        .frame(width: 48, height: 48)
                    
                    icon
                        .font(.system(size: 24))
                        .foregroundColor(selectedMethod == method ? .blue : .gray)
                }
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(selectedMethod == method ? .blue : .gray)
            }
            .frame(maxWidth: .infinity)
        }
    }
}

// MARK: - 登录表单
struct LoginForm: View {
    @Binding var selectedMethod: LoginMethod
    @Binding var phoneNumber: String
    @Binding var email: String
    @Binding var password: String
    @Binding var verificationCode: String
    @Binding var isLoadingCode: Bool
    @Binding var countdown: Int
    let onGetCode: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            // 手机号登录表单
            if selectedMethod == .phone {
                TextField("请输入手机号", text: $phoneNumber)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.phonePad)
                
                HStack(spacing: 12) {
                    TextField("请输入验证码", text: $verificationCode)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.numberPad)
                    
                    Button(action: onGetCode) {
                        HStack {
                            if isLoadingCode {
                                ProgressView()
                                    .foregroundColor(.white)
                                    .scaleEffect(0.8)
                            } else if countdown > 0 {
                                Text("重新发送(\(countdown)s)")
                                    .font(.caption)
                            } else {
                                Text("获取验证码")
                                    .font(.caption)
                            }
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [Color.blue, Color.purple]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                            .opacity((!isLoadingCode && countdown == 0) ? 1.0 : 0.6)
                        )
                        .cornerRadius(8)
                    }
                    .disabled(isLoadingCode || countdown > 0)
                }
            }
            
            // 邮箱密码登录表单
            if selectedMethod == .emailPassword {
                TextField("请输入邮箱", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                
                SecureField("请输入密码", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
        }
    }
}

// MARK: - 登录成功动画
struct LoginSuccessAnimation: View {
    let onDismiss: () -> Void
    
    @State private var isAnimating = false
    @State private var showText = false
    
    var body: some View {
        ZStack {
            // 背景遮罩
            Color.black.opacity(0.7)
                .ignoresSafeArea()
            
            // 成功动画
            VStack(spacing: 20) {
                // 圆形动画
                ZStack {
                    Circle()
                        .stroke(Color.blue.opacity(0.3), lineWidth: 8)
                        .frame(width: 120, height: 120)
                    
                    Circle()
                        .trim(from: 0, to: isAnimating ? 1 : 0)
                        .stroke(
                            LinearGradient(
                                gradient: Gradient(colors: [Color.blue, Color.purple]),
                                startPoint: .leading,
                                endPoint: .trailing
                            ),
                            style: StrokeStyle(lineWidth: 8, lineCap: .round, lineJoin: .round)
                        )
                        .frame(width: 120, height: 120)
                        .rotationEffect(Angle(degrees: isAnimating ? 360 : 0))
                    
                    // 对勾
                    Image(systemName: "checkmark")
                        .font(.system(size: 60))
                        .foregroundColor(.white)
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [Color.blue, Color.purple]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(Circle())
                        .frame(width: 80, height: 80)
                }
                .onAppear {
                    withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                        isAnimating = true
                    }
                    
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        withAnimation {
                            showText = true
                        }
                    }
                    
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        onDismiss()
                    }
                }
                
                // 成功文本
                VStack(spacing: 8) {
                    Text("✅ 登录成功")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .opacity(showText ? 1 : 0)
                    
                    Text("正在同步你的私人智库")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.9))
                        .opacity(showText ? 1 : 0)
                }
            }
        }
    }
}

// MARK: - 登录错误提示
struct LoginErrorView: View {
    let message: String
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.circle.fill")
                .font(.system(size: 40))
                .foregroundColor(.red)
            
            Text(message)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.red)
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(15)
        .shadow(radius: 10)
        .padding()
        .transition(.opacity)
        .animation(.easeInOut, value: message)
    }
}

// MARK: - 圆角扩展
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

#Preview {
    LoginView(isPresented: .constant(true))
        .environmentObject(LoginManager())
}
