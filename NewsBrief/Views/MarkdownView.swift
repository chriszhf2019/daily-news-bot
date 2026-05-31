//
//  MarkdownView.swift
//  Point
//
//  Created by haifangzhao on 2025-01-15.
//

import SwiftUI
import WebKit

// MARK: - Markdown视图
struct MarkdownView: View {
    let title: String
    let markdownFile: String
    
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemBackground)
                    .ignoresSafeArea()
                
                MarkdownRenderer(markdownFile: markdownFile)
                    .padding()
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(.blue)
                    }
                }
            }
        }
    }
}

// MARK: - Markdown渲染器
struct MarkdownRenderer: UIViewRepresentable {
    let markdownFile: String
    
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.scrollView.showsVerticalScrollIndicator = true
        webView.scrollView.indicatorStyle = .black
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        if let url = Bundle.main.url(forResource: markdownFile, withExtension: "md") {
            do {
                let markdownContent = try String(contentsOf: url, encoding: .utf8)
                let htmlContent = convertMarkdownToHTML(markdownContent)
                uiView.loadHTMLString(htmlContent, baseURL: nil)
            } catch {
                print("Error loading markdown file: \(error)")
                let errorHTML = "<html><body><h1>加载失败</h1><p>无法加载协议内容，请稍后重试。</p></body></html>"
                uiView.loadHTMLString(errorHTML, baseURL: nil)
            }
        } else {
            print("Markdown file not found: \(markdownFile)")
            let errorHTML = "<html><body><h1>文件不存在</h1><p>协议文件未找到。</p></body></html>"
            uiView.loadHTMLString(errorHTML, baseURL: nil)
        }
    }
    
    // MARK: - 将Markdown转换为HTML
    private func convertMarkdownToHTML(_ markdown: String) -> String {
        // 简单的Markdown转换，实际项目中可以使用更完善的库
        var html = "<html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><style>"
        
        // CSS样式
        html += "body{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 800px; margin: 0 auto;}"
        html += "h1{font-size: 2em; margin-bottom: 0.5em; color: #2c3e50;}"
        html += "h2{font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; color: #34495e;}"
        html += "h3{font-size: 1.2em; margin-top: 1.2em; margin-bottom: 0.5em; color: #34495e;}"
        html += "p{margin-bottom: 1em;}"
        html += "ul, ol{margin-left: 20px; margin-bottom: 1em;}"
        html += "li{margin-bottom: 0.5em;}"
        html += "code{font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace; background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-size: 0.9em;}"
        html += "pre{background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; margin-bottom: 1em;}"
        html += "blockquote{border-left: 4px solid #3498db; padding-left: 15px; margin-left: 0; color: #7f8c8d;}"
        html += "hr{border: none; border-top: 1px solid #ecf0f1; margin: 2em 0;}"
        html += "table{border-collapse: collapse; width: 100%; margin-bottom: 1em;}"
        html += "th, td{border: 1px solid #ecf0f1; padding: 8px; text-align: left;}"
        html += "th{background-color: #f8f9fa;}"
        html += "a{color: #3498db; text-decoration: none;}"
        html += "a:hover{text-decoration: underline;}"
        html += "</style></head><body>"
        
        // 简单转换
        let lines = markdown.components(separatedBy: .newlines)
        
        for line in lines {
            if line.starts(with: "# ") {
                html += "<h1>\(line.dropFirst(2))</h1>"
            } else if line.starts(with: "## ") {
                html += "<h2>\(line.dropFirst(3))</h2>"
            } else if line.starts(with: "### ") {
                html += "<h3>\(line.dropFirst(4))</h3>"
            } else if line.starts(with: "- ") {
                html += "<ul><li>\(line.dropFirst(2))</li></ul>"
            } else if line.starts(with: "1. ") {
                html += "<ol><li>\(line.dropFirst(3))</li></ol>"
            } else if line.starts(with: "> ") {
                html += "<blockquote>\(line.dropFirst(2))</blockquote>"
            } else if line.starts(with: "---") {
                html += "<hr>"
            } else if line.contains("[") && line.contains("](") {
                // 简单处理链接 [text](url)
                let parts = line.components(separatedBy: "[")
                for part in parts {
                    if part.contains("]") {
                        let subParts = part.components(separatedBy: "]")
                        if subParts.count > 1 && subParts[1].starts(with: "(") {
                            let linkParts = subParts[1].components(separatedBy: ")")
                            let text = subParts[0]
                            let url = String(linkParts[0].dropFirst())
                            html += "<a href='\(url)'>\(text)</a>"
                            if linkParts.count > 1 {
                                html += linkParts[1]
                            }
                        } else {
                            html += part
                        }
                    } else {
                        html += part
                    }
                }
                html += "<br>"
            } else {
                html += "<p>\(line)</p>"
            }
        }
        
        html += "</body></html>"
        return html
    }
}

#Preview {
    MarkdownView(title: "隐私政策", markdownFile: "PrivacyPolicy")
}
