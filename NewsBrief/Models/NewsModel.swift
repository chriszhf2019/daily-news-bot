//
//  NewsModel.swift
//  Point
//
//  Created by haifangzhao on 2025-01-01.
//

import Foundation
import SwiftUI

// MARK: - 新闻模型
struct News: Identifiable, Codable, Hashable {
    let id: String
    let title: String
    let content: String
    let summary: String
    let source: String
    let publishedAt: String
    let category: String
    let imageURL: String?
    let url: String?
    let tags: [String]
    let readTime: Int
    let aiAnalysis: AIAnalysis?
    let intelPro: IntelPro? // 新增的高级情报分析字段
    let isBreaking: Bool
    let views: Int
    let shares: Int
    
    // MARK: - 自定义编码和解码键
    enum CodingKeys: String, CodingKey {
        case id
        case title
        case content
        case summary
        case source
        case publishedAt
        case category
        case imageURL = "imageUrl"
        case url
        case tags
        case readTime
        case aiAnalysis
        case intelPro = "intel_pro" // JSON字段名使用下划线格式
        case isBreaking
        case views
        case shares
    }
    
    // MARK: - AI分析数据
    struct AIAnalysis: Codable, Hashable {
        let sentiment: String
        let importance: Int
        let keywords: [String]
        let summary: String
        let trends: [String]
        let impact: String
        let predictedViews: Int
        let recommendedActions: [String]
        let reliability: Int? // 可靠性评分 0-100
        let rippleEffect: RippleEffect? // 涟漪效应
        let futureOutlook: String? // 未来前瞻
        let personalRelevance: String? // 与我何干
        let proConViews: ProConViews? // 正反观点
        let aiLogicTrace: AILogicTrace? // AI逻辑溯源
        let sevenElements: SevenElements? // 7要素分析（剥离杂质，还原真相）
        
        // 涟漪效应
        struct RippleEffect: Codable, Hashable {
            let industries: [String] // 影响的行业
            let description: String // 描述
        }
        
        // 正反观点
        struct ProConViews: Codable, Hashable {
            let pros: [String] // 正面观点
            let cons: [String] // 负面观点
            let balance: String? // 平衡分析
        }
        
        // AI逻辑溯源
        struct AILogicTrace: Codable, Hashable {
            let logicChain: [String] // 逻辑链
            let reasoning: String // 推理过程
            let sources: [String]? // 参考来源
        }
        
        // 7要素分析：剥离杂质，还原真相
        struct SevenElements: Codable, Hashable {
            let sourceMatrix: SourceMatrix // 1. 信源矩阵
            let consensusGaps: ConsensusGaps // 2. 共识与冲突审计
            let factCheckList: [FactCheckItem] // 3. 事实核查清单
            let baseLogic: String // 4. 底层原理拆解
            let falsification: Falsification // 5. 证伪预警
            let trustScore: TrustScore // 6. 置信度印章
            let origin: Origin // 7. 情报时间轴
            
            // 1. 信源矩阵
            struct SourceMatrix: Codable, Hashable {
                let official: [String] // 官方来源
                let authoritative: [String] // 权威媒体
                let social: [String] // 社交爆料
                let firstSource: String // 首发媒体
                let crossVerified: Bool // 是否交叉验证
            }
            
            // 2. 共识与冲突审计
            struct ConsensusGaps: Codable, Hashable {
                let consensus: [String] // 全网公认的事实
                let gaps: [String] // 各方说法不一的漏洞
            }
            
            // 3. 事实核查清单项
            struct FactCheckItem: Codable, Hashable {
                let claim: String // 核心数据/声明
                let status: String // [已证实] 或 [待对证]
                let evidence: String? // 证据说明
            }
            
            // 5. 证伪预警
            struct Falsification: Codable, Hashable {
                let conditions: [String] // 如果发生A，则证明本新闻为假
                let observationPoints: [String] // 观察点
            }
            
            // 6. 置信度印章
            struct TrustScore: Codable, Hashable {
                let score: Int // 0-100
                let evidenceCompleteness: Int // 证据链完整性 0-100
                let sourceReliability: Int // 信源可靠性 0-100
                let logicConsistency: Int // 逻辑一致性 0-100
                let summary: String // 评分说明
            }
            
            // 7. 情报时间轴
            struct Origin: Codable, Hashable {
                let milestones: [Milestone] // 历史关键节点
                
                struct Milestone: Codable, Hashable {
                    let date: String // 时间
                    let event: String // 事件
                    let significance: String // 意义
                }
            }
        }
    }
    
    // MARK: - 高级情报分析字段（DeepSeek新增）
    struct IntelPro: Codable, Hashable {
        // "然后呢？" - 二阶效应数组
        let ripples: [RippleEffect]
        
        // "逻辑挂钩" - 思维模型
        let mentalModel: MentalModel
        
        // "趋势脉搏" - 贝叶斯更新
        let bayesianUpdate: BayesianUpdate
        
        // "风向标" - 叙事热度
        let narrativeHeat: NarrativeHeat
        
        // 记忆测验
        let memoryQuiz: MemoryQuiz
        
        // "然后呢？" - 二阶效应
        struct RippleEffect: Codable, Hashable {
            let level: String // 一阶(直接), 二阶(联动), 三阶(长远)
            let content: String // 影响描述
            
            enum CodingKeys: String, CodingKey {
                case level
                case content
            }
        }
        
        // "逻辑挂钩" - 思维模型
        struct MentalModel: Codable, Hashable {
            let name: String
            let logic: String
        }
        
        // "趋势脉搏" - 贝叶斯更新
        struct BayesianUpdate: Codable, Hashable {
            let target: String
            let shift: String // 如 "+3%", "-5%"
            let currentProb: String // 如 "65%"
        }
        
        // "风向标" - 叙事热度
        struct NarrativeHeat: Codable, Hashable {
            let score: Int // 0-100
            let trend: String // rising, stable, falling
            let description: String
        }
        
        // 记忆测验
        struct MemoryQuiz: Codable, Hashable {
            let question: String
            let answer: String
        }
    }
    
    // MARK: - 全球统计数据
    struct GlobalStats: Codable, Hashable {
        let globalSentiment: Double
        let aiIndustryHeat: Int
        let chipIndustryHeat: Int
        let macroIndustryHeat: Int
        let techIndustryHeat: Int
        let financeIndustryHeat: Int
        let internationalIndustryHeat: Int
        
        enum CodingKeys: String, CodingKey {
            case globalSentiment
            case aiIndustryHeat
            case chipIndustryHeat
            case macroIndustryHeat
            case techIndustryHeat
            case financeIndustryHeat
            case internationalIndustryHeat
        }
    }
    
    // MARK: - 专题
    struct Topic: Identifiable, Codable, Hashable {
        let id = UUID()
        let title: String
        let logicInsight: String
        let impactLevel: Int
        let relatedNewsCount: Int
        let subNews: [SubNews]
        let category: String
        let aiSummary: String
        let keywords: [String]
        
        struct SubNews: Codable, Hashable {
            let newsId: String
            let title: String
        }
        
        enum CodingKeys: String, CodingKey {
            case title
            case logicInsight
            case impactLevel
            case relatedNewsCount
            case subNews
            case category
            case aiSummary
            case keywords
        }
    }
    
    // MARK: - 预测
    struct Prediction: Identifiable, Codable, Hashable {
        let id = UUID()
        let title: String
        let logicChain: [String]
        let result: String
        let confidence: Int
        
        enum CodingKeys: String, CodingKey {
            case title
            case logicChain
            case result
            case confidence
        }
    }
    
    // MARK: - 情报数据
    struct IntelligenceData: Codable, Hashable {
        let globalStats: GlobalStats
        let topics: [Topic]
        let predictions: [Prediction]
        
        enum CodingKeys: String, CodingKey {
            case globalStats
            case topics
            case predictions
        }
    }
    
    // MARK: - 生成模拟情报数据
    static func generateMockIntelligenceData() -> IntelligenceData {
        let globalStats = GlobalStats(
            globalSentiment: 0.75,
            aiIndustryHeat: 92,
            chipIndustryHeat: 85,
            macroIndustryHeat: 78,
            techIndustryHeat: 88,
            financeIndustryHeat: 80,
            internationalIndustryHeat: 75
        )
        
        let topics = [
            Topic(
                title: "全球 AI 监管法案竞赛",
                logicInsight: "美国、欧盟和中国正在加速制定AI监管框架，争夺AI治理话语权。欧盟《AI法案》已进入最后阶段，美国发布了总统行政命令，中国推出了一系列监管政策。这种竞争将影响全球AI技术发展方向和市场格局。",
                impactLevel: 9,
                relatedNewsCount: 8,
                subNews: [
                    Topic.SubNews(newsId: "news_001", title: "欧盟《AI法案》即将生效"),
                    Topic.SubNews(newsId: "news_002", title: "美国发布AI监管行政命令"),
                    Topic.SubNews(newsId: "news_003", title: "中国深化AI伦理治理")
                ],
                category: "AI",
                aiSummary: "全球主要经济体正在加速制定AI监管框架，形成了欧盟《AI法案》、美国行政命令和中国监管政策三大体系。这种竞争将重塑全球AI治理格局，影响技术发展方向和市场准入规则。",
                keywords: ["AI监管", "欧盟AI法案", "美国行政命令", "AI治理", "地缘政治"]
            ),
            Topic(
                title: "芯片供应链重构与地缘政治",
                logicInsight: "全球芯片供应链正经历重大重构，美国对华芯片出口限制推动中国加速自主研发，台积电在美国建厂，欧盟推出芯片法案。这种重构将导致全球芯片产业格局发生深刻变化，影响科技、汽车等多个行业。",
                impactLevel: 8,
                relatedNewsCount: 6,
                subNews: [
                    Topic.SubNews(newsId: "news_004", title: "美国扩大对华芯片出口限制"),
                    Topic.SubNews(newsId: "news_005", title: "台积电美国工厂开始量产"),
                    Topic.SubNews(newsId: "news_006", title: "中国芯片设计公司取得突破")
                ],
                category: "芯片",
                aiSummary: "全球芯片供应链正经历深刻重构，美国限制、台积电扩产和中国自主研发共同推动产业格局变化。这种重构将影响全球科技、汽车等多个行业的发展，加速区域化供应链体系形成。",
                keywords: ["芯片供应链", "台积电", "中国芯片", "地缘政治", "自主研发"]
            ),
            Topic(
                title: "全球降息周期开启与经济复苏",
                logicInsight: "美联储、欧洲央行等主要央行已开始降息，全球进入宽松货币政策周期。这将降低企业融资成本，刺激消费和投资，有望推动全球经济从低迷中复苏。但同时也可能引发通货膨胀压力和资产泡沫风险。",
                impactLevel: 10,
                relatedNewsCount: 10,
                subNews: [
                    Topic.SubNews(newsId: "news_007", title: "美联储宣布降息25个基点"),
                    Topic.SubNews(newsId: "news_008", title: "欧洲央行跟随降息"),
                    Topic.SubNews(newsId: "news_009", title: "全球股市应声上涨")
                ],
                category: "宏观",
                aiSummary: "全球主要央行已开始降息，标志着宽松货币政策周期开启。这将降低融资成本，刺激经济活动，有望推动全球经济复苏，但也可能带来通胀压力和资产泡沫风险。投资者应关注货币政策变化对不同资产类别的影响。",
                keywords: ["降息周期", "美联储", "经济复苏", "货币政策", "通货膨胀"]
            )
        ]
        
        let predictions = [
            Prediction(
                title: "AI监管差异将导致技术分化",
                logicChain: ["欧盟实施严格AI监管", "美国采取宽松监管态度", "中国推动AI与国家安全结合"],
                result: "未来三年内，全球将形成三大AI技术体系：欧洲的伦理优先型、美国的创新优先型和中国的安全优先型。",
                confidence: 85
            ),
            Prediction(
                title: "芯片自主化将加速",
                logicChain: ["地缘政治紧张持续", "全球芯片短缺风险存在", "主要国家加大芯片投资"],
                result: "到2027年，全球主要经济体芯片自给率将从目前的不足40%提升到60%以上。",
                confidence: 78
            )
        ]
        
        return IntelligenceData(globalStats: globalStats, topics: topics, predictions: predictions)
    }
    
    // MARK: - 模拟数据生成器
    static func generateMockNews() -> [News] {
        let currentDate = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy年MM月dd日 HH:mm"
        
        return [
            News(
                id: "news_001",
                title: "OpenAI发布GPT-5模型，推理能力大幅提升",
                content: """
                OpenAI今日正式发布GPT-5大语言模型，这是继GPT-4之后的又一重大突破。GPT-5在推理能力、代码生成和多模态理解方面实现显著提升。

                【技术突破】
                - 参数规模：1.76万亿参数（比GPT-4增加2.5倍）
                - 推理速度：比GPT-4快60%
                - 上下文长度：支持200万token
                - 多模态能力：原生支持文本、图像、音频、视频

                【性能提升】
                - 复杂推理任务准确率提升40%
                - 代码生成质量接近专业程序员水平
                - 支持50+种编程语言
                - 零样本学习能力显著增强

                【发布时间】\(dateFormatter.string(from: currentDate))
                【影响范围】全球AI行业，将重塑软件开发、内容创作、教育等领域
                """,
                summary: "OpenAI发布GPT-5大语言模型，参数规模达到1.76万亿，在推理能力和多模态理解方面实现重大突破，预计将重塑AI行业格局。",
                source: "OpenAI官网",
                publishedAt: dateFormatter.string(from: currentDate),
                category: "AI动态",
                imageURL: nil,
                url: "https://openai.com/blog/gpt-5",
                tags: ["OpenAI", "GPT-5", "人工智能", "大语言模型"],
                readTime: 3,
                aiAnalysis: AIAnalysis(
                    sentiment: "positive",
                    importance: 95,
                    keywords: ["GPT-5", "OpenAI", "人工智能", "技术突破"],
                    summary: "这是AI领域的重大里程碑，将加速AI技术的普及和应用。",
                    trends: ["大模型发展", "多模态AI", "AGI研究"],
                    impact: "high",
                    predictedViews: 500000,
                    recommendedActions: ["关注技术发展", "学习相关技能", "准备行业变革"],
                    reliability: 95,
                    rippleEffect: AIAnalysis.RippleEffect(
                        industries: ["软件开发", "教育", "客服"],
                        description: "将推动AI应用在各行业的深度渗透"
                    ),
                    futureOutlook: "预计2026年下半年将有更多基于GPT-5的应用落地",
                    personalRelevance: "如果你从事编程、写作等创意工作，GPT-5将成为你的得力助手",
                    proConViews: AIAnalysis.ProConViews(
                        pros: ["提升工作效率", "推动技术创新", "降低开发成本"],
                        cons: ["可能导致部分岗位自动化", "伦理和安全问题", "技术滥用风险"],
                        balance: "GPT-5的发展将带来巨大机遇，同时需要建立相应的监管和伦理框架"
                    ),
                    aiLogicTrace: AIAnalysis.AILogicTrace(
                        logicChain: ["分析技术规格", "评估性能提升", "预测行业影响", "分析市场反应"],
                        reasoning: "基于GPT-5的参数规模和性能提升，结合历史技术发展规律，预测其对各行业的影响",
                        sources: ["OpenAI官方文档", "行业分析师报告", "技术专家评估"]
                    ),
                    sevenElements: AIAnalysis.SevenElements(
                        sourceMatrix: AIAnalysis.SevenElements.SourceMatrix(
                            official: ["OpenAI官方博客", "OpenAI技术白皮书"],
                            authoritative: ["The Verge", "TechCrunch", "MIT Technology Review"],
                            social: ["Sam Altman Twitter", "Reddit r/MachineLearning", "Hacker News"],
                            firstSource: "OpenAI官方博客",
                            crossVerified: true
                        ),
                        consensusGaps: AIAnalysis.SevenElements.ConsensusGaps(
                            consensus: [
                                "GPT-5确实发布，参数规模1.76万亿",
                                "推理速度比GPT-4快60%",
                                "支持200万token上下文",
                                "多模态能力显著提升"
                            ],
                            gaps: [
                                "具体训练成本未公开（估计在5-10亿美元）",
                                "商业定价策略尚未明确",
                                "是否真正接近AGI存在争议",
                                "安全性测试细节未完全披露"
                            ]
                        ),
                        factCheckList: [
                            AIAnalysis.SevenElements.FactCheckItem(
                                claim: "参数规模1.76万亿",
                                status: "[已证实]",
                                evidence: "OpenAI官方技术白皮书第12页明确标注"
                            ),
                            AIAnalysis.SevenElements.FactCheckItem(
                                claim: "推理速度快60%",
                                status: "[已证实]",
                                evidence: "基于标准benchmark测试，多家第三方机构验证"
                            ),
                            AIAnalysis.SevenElements.FactCheckItem(
                                claim: "接近专业程序员水平",
                                status: "[待对证]",
                                evidence: "缺乏大规模实际项目验证，仅有内部测试数据"
                            ),
                            AIAnalysis.SevenElements.FactCheckItem(
                                claim: "训练成本10亿美元",
                                status: "[待对证]",
                                evidence: "OpenAI未公开，仅为行业分析师估算"
                            )
                        ],
                        baseLogic: "大语言模型的能力提升遵循Scaling Law（规模定律）：参数量增加→计算能力提升→涌现能力出现。GPT-5的1.76万亿参数是GPT-4的2.5倍，根据经验公式，性能提升应在40-60%之间，与官方声称的60%推理速度提升相符。从物理层面看，这需要数万块H100 GPU训练数月，能耗约50-100兆瓦时，在技术和经济上均可行。",
                        falsification: AIAnalysis.SevenElements.Falsification(
                            conditions: [
                                "如果第三方benchmark测试显示性能提升低于30%，则性能声称夸大",
                                "如果6个月内无重大应用落地，则实用性存疑",
                                "如果出现大规模幻觉或安全事故，则安全性测试不充分"
                            ],
                            observationPoints: [
                                "关注未来3个月第三方评测机构的独立测试结果",
                                "观察开发者社区的实际使用反馈",
                                "监测是否出现安全漏洞或滥用案例"
                            ]
                        ),
                        trustScore: AIAnalysis.SevenElements.TrustScore(
                            score: 85,
                            evidenceCompleteness: 90,
                            sourceReliability: 95,
                            logicConsistency: 80,
                            summary: "信源高度可靠（OpenAI官方+权威媒体），核心技术参数已证实，但商业化细节和长期影响仍需观察。建议保持关注但不盲目乐观。"
                        ),
                        origin: AIAnalysis.SevenElements.Origin(
                            milestones: [
                                AIAnalysis.SevenElements.Origin.Milestone(
                                    date: "2022年11月",
                                    event: "ChatGPT发布（基于GPT-3.5）",
                                    significance: "首次将大语言模型推向大众，引发AI革命"
                                ),
                                AIAnalysis.SevenElements.Origin.Milestone(
                                    date: "2023年3月",
                                    event: "GPT-4发布",
                                    significance: "多模态能力突破，参数规模达到1.7万亿（未官方确认）"
                                ),
                                AIAnalysis.SevenElements.Origin.Milestone(
                                    date: "2026年3月",
                                    event: "GPT-5发布",
                                    significance: "推理能力质的飞跃，向AGI迈进关键一步"
                                )
                            ]
                        )
                    )
                ),
                intelPro: IntelPro(
                    ripples: [
                        IntelPro.RippleEffect(level: "一阶(直接)", content: "直接推动AI应用开发加速，企业将加大大模型投入"),
                        IntelPro.RippleEffect(level: "二阶(联动)", content: "间接影响教育体系，AI辅助学习将成为主流"),
                        IntelPro.RippleEffect(level: "三阶(长远)", content: "长远改变就业结构，创造新的AI相关职业"),
                    ],
                    mentalModel: IntelPro.MentalModel(
                        name: "技术扩散S曲线",
                        logic: "GPT-5正处于技术扩散的快速增长阶段，符合S曲线模型的上升期特征"
                    ),
                    bayesianUpdate: IntelPro.BayesianUpdate(
                        target: "AGI在2030年前实现",
                        shift: "+3%",
                        currentProb: "65%"
                    ),
                    narrativeHeat: IntelPro.NarrativeHeat(
                        score: 85,
                        trend: "rising",
                        description: "正在从技术圈扩散至大众金融圈"
                    ),
                    memoryQuiz: IntelPro.MemoryQuiz(
                        question: "GPT-5的参数规模是多少？",
                        answer: "1.76万亿参数"
                    )
                ),
                isBreaking: true,
                views: 125000,
                shares: 8500
            ),
            News(
                id: "news_002",
                title: "苹果发布iOS 19操作系统，AI功能全面升级",
                content: """
                苹果公司今日在加州库比蒂诺总部正式发布iOS 19操作系统，引入了革命性的AI功能和增强的用户体验。

                【核心功能】
                - Apple Intelligence：全新的端侧AI引擎
                - Siri 2.0：对话理解能力提升45%
                - 智能写作助手：支持邮件、文档、消息智能编辑
                - 照片AI编辑：自动识别和优化图片内容

                【技术规格】
                - 兼容性：iPhone 12及以上机型
                - 存储要求：3.2GB可用空间
                - 发布时间：\(dateFormatter.string(from: currentDate))
                - 开发者预览版现已开放

                【市场影响】预计将推动iPhone用户升级潮，AI功能成为主要卖点
                """,
                summary: "苹果发布iOS 19系统，全面升级AI功能，包括Apple Intelligence和增强的Siri体验，为用户带来更智能的移动设备使用体验。",
                source: "Apple官网",
                publishedAt: dateFormatter.string(from: currentDate),
                category: "科技前沿",
                imageURL: nil,
                url: "https://www.apple.com/ios-19/",
                tags: ["苹果", "iOS 19", "Apple Intelligence", "移动系统"],
                readTime: 4,
                aiAnalysis: AIAnalysis(
                    sentiment: "positive",
                    importance: 88,
                    keywords: ["iOS 19", "Apple Intelligence", "Siri", "移动系统"],
                    summary: "苹果在AI移动操作系统方面的重要进展，将提升用户体验。",
                    trends: ["移动AI", "端侧计算", "智能助手"],
                    impact: "medium",
                    predictedViews: 320000,
                    recommendedActions: ["关注新功能", "准备系统升级", "学习AI应用"],
                    reliability: 92,
                    rippleEffect: AIAnalysis.RippleEffect(
                        industries: ["手机", "应用开发", "移动互联网"],
                        description: "将推动移动AI应用生态的发展"
                    ),
                    futureOutlook: "预计iOS 19将在2026年秋季正式发布",
                    personalRelevance: "如果你是iPhone用户，将获得更智能的使用体验"
                ),
                intelPro: IntelPro(
                    ripples: [
                        IntelPro.RippleEffect(level: "一阶(直接)", content: "直接推动iPhone 12及以上机型销售"),
                        IntelPro.RippleEffect(level: "二阶(联动)", content: "间接促进第三方开发者开发AI应用"),
                        IntelPro.RippleEffect(level: "三阶(长远)", content: "长远改变移动生态，AI功能成为手机核心竞争力"),
                    ],
                    mentalModel: IntelPro.MentalModel(
                        name: "生态系统飞轮效应",
                        logic: "iOS 19的AI功能升级将带动硬件销售、开发者生态和服务收入的正向循环"
                    ),
                    bayesianUpdate: IntelPro.BayesianUpdate(
                        target: "苹果2026财年AI服务收入突破500亿美元",
                        shift: "+5%",
                        currentProb: "70%"
                    ),
                    narrativeHeat: IntelPro.NarrativeHeat(
                        score: 78,
                        trend: "rising",
                        description: "正在从科技媒体扩散至普通消费者"
                    ),
                    memoryQuiz: IntelPro.MemoryQuiz(
                        question: "iOS 19引入的全新端侧AI引擎叫什么名字？",
                        answer: "Apple Intelligence"
                    )
                ),
                isBreaking: false,
                views: 89000,
                shares: 5200
            ),
            News(
                id: "news_003",
                title: "Meta发布Quest 4 VR头显，混合现实体验革命",
                content: """
                Meta公司在今日的Connect大会上正式发布Quest 4 VR头显，标志着混合现实技术进入全新阶段。

                【技术创新】
                - 分辨率：单眼4K显示（比Quest 3提升100%）
                - 处理器：全新XR3芯片，性能提升200%
                - 续航时间：连续使用6小时
                - 追踪精度：亚毫米级手部追踪

                【应用场景】
                - 沉浸式游戏体验
                - 远程协作会议
                - 虚拟旅游探索
                - 教育培训模拟

                【发布时间】\(dateFormatter.string(from: currentDate))
                【定价策略】标准版599美元，企业版799美元
                """,
                summary: "Meta发布Quest 4 VR头显，在显示效果、处理性能和混合现实体验方面实现重大突破，推动VR/AR技术普及。",
                source: "Meta官网",
                publishedAt: dateFormatter.string(from: currentDate),
                category: "VR/AR",
                imageURL: nil,
                url: "https://about.meta.com/quest-4",
                tags: ["Meta", "Quest 4", "VR", "混合现实"],
                readTime: 5,
                aiAnalysis: AIAnalysis(
                    sentiment: "excited",
                    importance: 82,
                    keywords: ["Quest 4", "VR", "Meta", "混合现实"],
                    summary: "VR技术发展的重要里程碑，将加速虚拟现实在消费市场的普及。",
                    trends: ["VR普及", "混合现实", "元宇宙发展"],
                    impact: "medium",
                    predictedViews: 210000,
                    recommendedActions: ["关注VR发展", "体验新技术", "探索应用场景"],
                    reliability: 88,
                    rippleEffect: AIAnalysis.RippleEffect(
                        industries: ["游戏", "教育", "远程协作"],
                        description: "将推动VR在多个领域的应用"
                    ),
                    futureOutlook: "预计2026年VR设备销量将突破1000万台",
                    personalRelevance: "如果你喜欢游戏或需要远程协作，VR将带来全新体验"
                ),
                intelPro: IntelPro(
                    ripples: [
                        IntelPro.RippleEffect(level: "一阶(直接)", content: "直接推动VR游戏和应用生态发展"),
                        IntelPro.RippleEffect(level: "二阶(联动)", content: "间接促进远程协作和教育培训领域的创新"),
                        IntelPro.RippleEffect(level: "三阶(长远)", content: "长远推动元宇宙概念落地，改变人类交互方式"),
                    ],
                    mentalModel: IntelPro.MentalModel(
                        name: "技术成熟度曲线（Gartner Hype Cycle）",
                        logic: "Quest 4的发布标志着VR技术从期望膨胀期进入稳步爬升期"
                    ),
                    bayesianUpdate: IntelPro.BayesianUpdate(
                        target: "2026年全球VR头显出货量突破3000万台",
                        shift: "+4%",
                        currentProb: "68%"
                    ),
                    narrativeHeat: IntelPro.NarrativeHeat(
                        score: 82,
                        trend: "rising",
                        description: "正在从游戏圈扩散至企业应用领域"
                    ),
                    memoryQuiz: IntelPro.MemoryQuiz(
                        question: "Quest 4 VR头显的单眼分辨率是多少？",
                        answer: "4K"
                    )
                ),
                isBreaking: false,
                views: 156000,
                shares: 9800
            ),
            News(
                id: "news_004",
                title: "特斯拉FSD完全自动驾驶技术获得监管部门批准",
                content: """
                特斯拉公司宣布，其完全自动驾驶（FSD）技术已获得美国国家公路交通安全管理局（NHTSA）的正式批准。

                【批准范围】
                - 在高速公路上完全自动驾驶
                - 城市道路自动驾驶（限速45mph以下）
                - 自动泊车和召唤功能
                - 夜间驾驶能力

                【技术特点】
                - 基于纯视觉方案，无激光雷达依赖
                - 神经网络训练超过100亿英里
                - 实时学习和优化能力
                - 安全记录：事故率比人类驾驶低85%

                【市场影响】
                - 预计将推动特斯拉股价上涨15-20%
                - 自动驾驶行业竞争格局重新洗牌
                - 监管政策为其他厂商树立标准

                【发布时间】\(dateFormatter.string(from: currentDate))
                """,
                summary: "特斯拉FSD技术获得监管部门批准，标志着自动驾驶技术进入商业化新阶段，将重塑汽车行业格局。",
                source: "特斯拉官方",
                publishedAt: dateFormatter.string(from: currentDate),
                category: "自动驾驶",
                imageURL: nil,
                url: "https://www.tesla.com/fsd-approval",
                tags: ["特斯拉", "FSD", "自动驾驶", "监管批准"],
                readTime: 6,
                aiAnalysis: AIAnalysis(
                    sentiment: "very_positive",
                    importance: 92,
                    keywords: ["特斯拉", "FSD", "自动驾驶", "监管批准"],
                    summary: "自动驾驶技术发展的重要里程碑，将加速行业商业化进程。",
                    trends: ["自动驾驶商业化", "智能汽车", "出行变革"],
                    impact: "very_high",
                    predictedViews: 680000,
                    recommendedActions: ["关注行业动态", "投资相关股票", "准备技术变革"],
                    reliability: 90,
                    rippleEffect: AIAnalysis.RippleEffect(
                        industries: ["汽车", "出行", "保险"],
                        description: "将重塑整个出行产业链"
                    ),
                    futureOutlook: "预计2027年自动驾驶将在全球主要城市普及",
                    personalRelevance: "如果你经常开车，自动驾驶将解放你的双手；如果你是司机，需考虑职业转型"
                ),
                intelPro: IntelPro(
                    ripples: [
                        IntelPro.RippleEffect(level: "一阶(直接)", content: "直接推动特斯拉FSD订阅服务增长"),
                        IntelPro.RippleEffect(level: "二阶(联动)", content: "间接促使其他车企加速自动驾驶技术研发"),
                        IntelPro.RippleEffect(level: "三阶(长远)", content: "长远改变交通出行方式，减少交通事故"),
                    ],
                    mentalModel: IntelPro.MentalModel(
                        name: "破坏性创新理论",
                        logic: "特斯拉FSD的纯视觉方案正在颠覆传统自动驾驶行业的激光雷达路线"
                    ),
                    bayesianUpdate: IntelPro.BayesianUpdate(
                        target: "2027年全球L4/L5自动驾驶汽车销量突破100万辆",
                        shift: "+6%",
                        currentProb: "75%"
                    ),
                    narrativeHeat: IntelPro.NarrativeHeat(
                        score: 90,
                        trend: "rising",
                        description: "正在从科技和金融圈扩散至全球媒体"
                    ),
                    memoryQuiz: IntelPro.MemoryQuiz(
                        question: "特斯拉FSD技术基于什么方案？",
                        answer: "纯视觉方案，无激光雷达依赖"
                    )
                ),
                isBreaking: true,
                views: 445000,
                shares: 28000
            ),
            News(
                id: "news_005",
                title: "量子计算芯片重大突破：IBM发布1000量子比特处理器",
                content: """
                IBM公司在今日的Quantum Summit大会上发布了全新的1000量子比特处理器"Condor"，标志着量子计算技术实现重大突破。

                【技术突破】
                - 量子比特数量：从433个提升到1000个
                - 相干时间：延长至200微秒
                - 错误率：降低至0.01%
                - 量子体积：达到8192（行业最高）

                【应用前景】
                - 密码学破解：RSA加密面临挑战
                - 药物发现：分子模拟速度提升百万倍
                - 金融建模：风险分析精度大幅提升
                - 人工智能：量子机器学习算法

                【商业化时间表】
                - 2025年Q2：云服务开放
                - 2025年Q4：企业版上市
                - 2026年：研究机构合作项目

                【发布时间】\(dateFormatter.string(from: currentDate))
                """,
                summary: "IBM发布1000量子比特处理器，在量子计算规模、精度和稳定性方面实现重大突破，推动量子计算向实用化迈进。",
                source: "IBM Research",
                publishedAt: dateFormatter.string(from: currentDate),
                category: "量子计算",
                imageURL: nil,
                url: "https://research.ibm.com/condor-processor",
                tags: ["IBM", "量子计算", "Condor", "量子比特"],
                readTime: 7,
                aiAnalysis: AIAnalysis(
                    sentiment: "breakthrough",
                    importance: 97,
                    keywords: ["量子计算", "IBM", "Condor", "技术突破"],
                    summary: "量子计算技术的重大里程碑，将开启计算科学的新时代。",
                    trends: ["量子计算", "计算革命", "科研突破"],
                    impact: "revolutionary",
                    predictedViews: 380000,
                    recommendedActions: ["关注技术发展", "学习量子知识", "准备行业变革"],
                    reliability: 94,
                    rippleEffect: AIAnalysis.RippleEffect(
                        industries: ["科研", "密码学", "药物研发"],
                        description: "将推动多个科研领域的突破"
                    ),
                    futureOutlook: "预计2028年量子计算将在特定领域实现商业化应用",
                    personalRelevance: "如果你从事科研或金融建模，量子计算将带来革命性变化"
                ),
                intelPro: IntelPro(
                    ripples: [
                        IntelPro.RippleEffect(level: "一阶(直接)", content: "直接推动量子计算云服务需求增长"),
                        IntelPro.RippleEffect(level: "二阶(联动)", content: "间接促进密码学领域的创新和变革"),
                        IntelPro.RippleEffect(level: "三阶(长远)", content: "长远改变药物发现、金融建模等领域"),
                    ],
                    mentalModel: IntelPro.MentalModel(
                        name: "摩尔定律的延续",
                        logic: "量子计算正在延续传统计算的摩尔定律，以指数级速度提升计算能力"
                    ),
                    bayesianUpdate: IntelPro.BayesianUpdate(
                        target: "2030年量子计算机解决传统计算机无法解决的实用问题",
                        shift: "+8%",
                        currentProb: "60%"
                    ),
                    narrativeHeat: IntelPro.NarrativeHeat(
                        score: 88,
                        trend: "rising",
                        description: "正在从科研圈扩散至科技和金融界"
                    ),
                    memoryQuiz: IntelPro.MemoryQuiz(
                        question: "IBM发布的1000量子比特处理器叫什么名字？",
                        answer: "Condor"
                    )
                ),
                isBreaking: true,
                views: 290000,
                shares: 19000
            )
        ]
    }
}

// MARK: - API 数据转换

extension News {
    /// 将后端 API 返回的新闻项转换为 News 模型
    static func fromAPIItem(_ item: APINewsItem) -> News {
        News(
            id: String(item.id),
            title: item.title,
            content: item.summary ?? "",
            summary: item.summary ?? "",
            source: item.source ?? "未知来源",
            publishedAt: item.publishedAt ?? "",
            category: item.category ?? "综合",
            imageURL: item.imageUrl,
            url: item.sourceUrl,
            tags: item.tags ?? [],
            readTime: max(1, (item.summary?.count ?? 100) / 200),
            aiAnalysis: nil,
            intelPro: nil,
            isBreaking: false,
            views: 0,
            shares: 0
        )
    }
}

// MARK: - 分类模型
struct NewsCategory: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let icon: String
    let color: Color
    var count: Int
    
    static let all = NewsCategory(name: "全部", icon: "📰", color: .blue, count: 0)
    static let ai = NewsCategory(name: "AI动态", icon: "🤖", color: .purple, count: 0)
    static let tech = NewsCategory(name: "科技前沿", icon: "🚀", color: .orange, count: 0)
    static let vr = NewsCategory(name: "VR/AR", icon: "🥽", color: .green, count: 0)
    static let auto = NewsCategory(name: "自动驾驶", icon: "🚗", color: .red, count: 0)
    static let quantum = NewsCategory(name: "量子计算", icon: "⚛️", color: .indigo, count: 0)
}

// MARK: - 筛选选项
enum FilterOption: String, CaseIterable {
    case all = "全部"
    case today = "今日"
    case week = "本周"
    case month = "本月"
    case breaking = "突发"
    case favorites = "收藏"
}