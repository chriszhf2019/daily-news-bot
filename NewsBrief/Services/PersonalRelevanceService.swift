//
//  PersonalRelevanceService.swift
//  NewsBrief
//
//  Created by Kiro on 2026-02-26.
//

import Foundation

// MARK: - 个人关联分析服务
class PersonalRelevanceService {
    static let shared = PersonalRelevanceService()
    
    private init() {}
    
    // MARK: - AI分析请求
    func analyzeNewsRelevance(
        title: String,
        summary: String,
        userIdentity: String,
        completion: @escaping (Result<AIAnalysisResult, Error>) -> Void
    ) {
        // 构建AI提示词
        let prompt = buildPrompt(title: title, summary: summary, userIdentity: userIdentity)
        
        // 根据配置决定使用模拟数据还是真实API
        if APIConfig.useMockData {
            // 使用模拟数据
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                let mockResult = self.generateMockResult(for: userIdentity, category: self.extractCategory(from: title))
                completion(.success(mockResult))
            }
        } else {
            // 调用真实API
            callDeepSeekAPI(prompt: prompt, completion: completion)
        }
    }
    
    // MARK: - 提取新闻类别
    private func extractCategory(from title: String) -> String {
        if title.contains("AI") || title.contains("人工智能") {
            return "AI"
        } else if title.contains("投资") || title.contains("股价") || title.contains("市场") {
            return "投资"
        } else if title.contains("教育") || title.contains("教学") {
            return "教育"
        } else if title.contains("管理") || title.contains("企业") {
            return "管理"
        } else {
            return "科技"
        }
    }
    
    // MARK: - 构建AI提示词
    private func buildPrompt(title: String, summary: String, userIdentity: String) -> String {
        return """
        角色：你是一位拥有 20 年经验的全行业咨询专家。
        
        输入：
        - 新闻标题：\(title)
        - 新闻摘要：\(summary)
        - 用户身份：\(userIdentity)
        
        任务：请精准分析这条新闻对该身份用户的具体影响。
        
        输出格式 (JSON)：
        {
            "impact": "一句话说明对该职业的核心利弊影响。",
            "suggestions": ["具体建议1", "具体建议2"],
            "timeframe": "即刻 / 短期(1个月) / 长期(半年以上)",
            "risk_level": "高 / 中 / 低"
        }
        
        要求：
        - 语气专业且务实，避开空话
        - 直接说钱、时间或效率的变化
        - 建议要具体可执行，包含数字和时间节点
        """
    }
    
    // MARK: - 调用DeepSeek API
    private func callDeepSeekAPI(prompt: String, completion: @escaping (Result<AIAnalysisResult, Error>) -> Void) {
        // 使用配置文件中的API Key
        let apiKey = APIConfig.deepSeekAPIKey
        
        guard let apiURL = URL(string: APIConfig.deepSeekAPIURL) else {
            completion(.failure(NSError(domain: "PersonalRelevanceService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid API URL"])))
            return
        }
        
        // 构建请求
        var request = URLRequest(url: apiURL)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = APIConfig.requestTimeout
        
        let requestBody: [String: Any] = [
            "model": APIConfig.deepSeekModel,
            "messages": [
                ["role": "user", "content": prompt]
            ],
            "temperature": APIConfig.temperature,
            "max_tokens": APIConfig.maxTokens,
            "response_format": ["type": "json_object"]
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        } catch {
            completion(.failure(error))
            return
        }
        
        // 发送请求
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    completion(.failure(error))
                    return
                }
                
                guard let httpResponse = response as? HTTPURLResponse else {
                    completion(.failure(NSError(domain: "PersonalRelevanceService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])))
                    return
                }
                
                guard (200...299).contains(httpResponse.statusCode) else {
                    completion(.failure(NSError(domain: "PersonalRelevanceService", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: "HTTP Error: \(httpResponse.statusCode)"])))
                    return
                }
                
                guard let data = data else {
                    completion(.failure(NSError(domain: "PersonalRelevanceService", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data received"])))
                    return
                }
                
                // 解析响应
                do {
                    if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                       let choices = json["choices"] as? [[String: Any]],
                       let firstChoice = choices.first,
                       let message = firstChoice["message"] as? [String: Any],
                       let content = message["content"] as? String {
                        
                        // 解析AI返回的JSON
                        if let contentData = content.data(using: .utf8) {
                            let result = try JSONDecoder().decode(AIAnalysisResult.self, from: contentData)
                            completion(.success(result))
                        } else {
                            completion(.failure(NSError(domain: "PersonalRelevanceService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to parse AI response"])))
                        }
                    } else {
                        completion(.failure(NSError(domain: "PersonalRelevanceService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid response format"])))
                    }
                } catch {
                    completion(.failure(error))
                }
            }
        }.resume()
    }
    
    // MARK: - 生成模拟结果
    private func generateMockResult(for identity: String, category: String) -> AIAnalysisResult {
        if identity.contains("程序员") || identity.contains("开发") {
            return AIAnalysisResult(
                impact: "这项技术将直接影响你的日常开发工作流程，预计可提升30%的编码效率，但需要投入约2周时间学习新工具链。短期内会增加学习成本，长期将显著提升个人竞争力。",
                suggestions: [
                    "立即在GitHub上关注相关开源项目，每天投入1小时学习新技术栈",
                    "在公司内部发起技术分享会，建立技术影响力，为晋升铺路"
                ],
                timeframe: "即刻",
                riskLevel: "中"
            )
        } else if identity.contains("投资") {
            return AIAnalysisResult(
                impact: "该新闻将在未来3个月内推动相关板块股价上涨15-25%，建议关注产业链上游芯片设计公司和下游应用开发商。当前估值处于合理区间，存在明显套利空间。",
                suggestions: [
                    "配置10-15%仓位在AI芯片龙头股，设置止损位-8%",
                    "关注二级市场情绪指标，在市场过热时（PE>50）分批减仓"
                ],
                timeframe: "短期(1个月)",
                riskLevel: "高"
            )
        } else if identity.contains("教师") {
            return AIAnalysisResult(
                impact: "AI辅助教学工具将在未来1年内普及，传统讲授式教学效率将下降40%。需要转型为"学习设计师"角色，否则面临被边缘化风险。但掌握新工具后，可将备课时间减少50%。",
                suggestions: [
                    "报名参加教育科技培训课程，获得AI教学工具认证",
                    "与科技公司合作开发课程内容，建立个人IP，开辟副业收入"
                ],
                timeframe: "长期(半年以上)",
                riskLevel: "中"
            )
        } else if identity.contains("管理") {
            return AIAnalysisResult(
                impact: "该技术将重构团队协作模式，预计可减少30%的沟通成本，但需要重新设计KPI体系和工作流程。未能及时转型的管理者将在6个月内失去竞争优势。",
                suggestions: [
                    "组织团队进行为期2周的技术培训，预算控制在人均5000元以内",
                    "与IT部门合作制定数字化转型路线图，申请专项预算50-100万"
                ],
                timeframe: "短期(1个月)",
                riskLevel: "中"
            )
        } else if identity.contains("学生") {
            return AIAnalysisResult(
                impact: "该技术将改变未来就业市场格局，掌握相关技能的毕业生起薪将高出30-50%。但学习曲线陡峭，需要投入至少200小时系统学习。越早开始，竞争优势越明显。",
                suggestions: [
                    "利用寒暑假参加相关实习项目，积累实战经验和人脉资源",
                    "在GitHub上贡献开源项目，建立个人技术品牌，提升简历竞争力"
                ],
                timeframe: "即刻",
                riskLevel: "低"
            )
        } else {
            return AIAnalysisResult(
                impact: "这条新闻将对你所在的行业产生深远影响，建议密切关注后续发展。技术变革将带来新的机遇和挑战，提前布局将获得先发优势。",
                suggestions: [
                    "深入研究该技术的应用场景，寻找与自身工作的结合点",
                    "建立行业人脉网络，获取一手信息和资源"
                ],
                timeframe: "短期(1个月)",
                riskLevel: "中"
            )
        }
    }
}
