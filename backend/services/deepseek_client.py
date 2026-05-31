"""
DeepSeek API 客户端 — 带重试和指数退避
"""

import time
import re
import json
import logging
import requests

logger = logging.getLogger(__name__)


class DeepSeekError(Exception):
    def __init__(self, message: str, retryable: bool = False):
        self.message = message
        self.retryable = retryable
        super().__init__(message)


class DeepSeekClient:
    def __init__(self, api_key: str, api_endpoint: str = "https://api.deepseek.com/v1",
                 timeout: int = 30, max_retries: int = 3):
        self.api_key = api_key
        self.api_endpoint = api_endpoint
        self.timeout = timeout
        self.max_retries = max_retries

    def _request(self, method: str, endpoint: str, data: dict = None) -> dict:
        url = f"{self.api_endpoint}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        last_error = None
        for attempt in range(self.max_retries):
            try:
                if method == "GET":
                    resp = requests.get(url, headers=headers, timeout=self.timeout)
                else:
                    resp = requests.post(url, json=data, headers=headers, timeout=self.timeout)

                # 429 / 5xx -> retryable
                if resp.status_code == 429 or resp.status_code >= 500:
                    raise DeepSeekError(
                        f"API 返回 {resp.status_code}", retryable=True
                    )
                resp.raise_for_status()
                return resp.json()

            except requests.exceptions.Timeout:
                last_error = DeepSeekError("API 请求超时", retryable=True)
            except DeepSeekError as e:
                last_error = e
            except requests.exceptions.RequestException as e:
                last_error = DeepSeekError(f"API 请求失败: {e}", retryable=False)

            if attempt < self.max_retries - 1 and last_error.retryable:
                wait = min(2 ** attempt, 8)
                logger.warning(f"DeepSeek 重试 {attempt + 1}/{self.max_retries}，等待 {wait}s: {endpoint}")
                time.sleep(wait)
            else:
                break

        logger.error(f"DeepSeek API 最终失败: {last_error}")
        raise last_error or DeepSeekError("未知错误")
    
    def generate_news_data(self, category='AI', count=5):
        """生成新闻数据"""
        try:
            prompt = f"""请生成{count}条真实的新闻数据，包括：

每条新闻包含：
1. 标题：具体、有吸引力
2. 摘要：详细、准确
3. 分类：{category}
4. 来源：真实的媒体名称
5. 发布时间：合理的发布时间
6. 内容：详细的新闻内容
7. 标签：相关的标签

输出格式（必须是纯JSON，不要有任何其他文字）：
{{
  "news": [
    {{
      "id": "news_{{i}}",
      "title": "新闻标题",
      "summary": "新闻摘要",
      "content": "新闻内容",
      "category": "{category}",
      "source": "媒体名称",
      "published_at": "发布时间",
      "tags": ["标签1", "标签2"],
      "url": "新闻链接",
      "image": "新闻图片URL"
    }}
  ]
}}

要求：
1. 新闻要真实、具体、有吸引力
2. 标题要简洁明了
3. 摘要要详细准确
4. 来源要是真实的媒体名称
5. 发布时间要合理
6. 内容要详细
7. 标签要相关"""

            data = {
                'model': 'deepseek-chat',
                'messages': [
                    {
                        'role': 'system',
                        'content': '你是一位专业的新闻编辑，擅长生成真实、有吸引力的新闻内容。'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.8,
                'max_tokens': 2000
            }
            
            response = self._request('POST', '/chat/completions', data)
            
            if response.get('choices'):
                content = response['choices'][0]['message']['content']
                
                # 提取JSON部分
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    json_str = json_match.group()
                    news_data = json.loads(json_str)
                    
                    if 'news' in news_data and isinstance(news_data['news'], list):
                        return news_data['news']
            
            logger.error(f"生成新闻数据失败: 响应格式不正确")
            raise Exception("生成新闻数据失败")
            
        except Exception as e:
            logger.error(f"生成新闻数据失败: {str(e)}")
            raise e
    
    def generate_audit_analysis(self, news):
        """生成七要素分析"""
        try:
            prompt = f"""请对这条新闻进行七要素事实审计分析：

新闻内容：
标题：{news.get('title', '无标题')}
摘要：{news.get('summary', '无摘要')}
内容：{news.get('content', '无内容')}

输出格式（必须是纯JSON，不要有任何其他文字）：
{{
  "sources": [
    {{
      "name": "官方来源",
      "reliability": 90,
      "description": "从官方或权威媒体获取的信息"
    }},
    {{
      "name": "权威媒体",
      "reliability": 85,
      "description": "从行业权威媒体验证的信息"
    }},
    {{
      "name": "社交印证",
      "reliability": 75,
      "description": "从社交媒体或专家评论验证的信息"
    }}
  ],
  "consensus": "各信源一致确认的事实",
  "conflicts": "各信源可能存在争议或说法不一的点",
  "facts": [
    {{
      "fact": "关键事实1",
      "status": "verified",
      "description": "事实描述1"
    }},
    {{
      "fact": "关键事实2",
      "status": "verified",
      "description": "事实描述2"
    }}
  ],
  "logic": "事件发生的逻辑链清晰",
  "warnings": ["暂无证伪预警点"],
  "trust_score": 85,
  "timeline": [
    {{
      "date": "2024-01",
      "event": "相关历史事件1"
    }},
    {{
      "date": "2024-06",
      "event": "相关历史事件2"
    }}
  ]
}}

要求：
1. 三层信源闭环对证
2. 分析各信源的可靠性
3. 识别共识和冲突点
4. 核查关键事实
5. 分析事件逻辑链
6. 提供证伪预警
7. 计算信任评分
8. 提供起源时间轴"""

            data = {
                'model': 'deepseek-chat',
                'messages': [
                    {
                        'role': 'system',
                        'content': '你是一位专业的事实核查员，擅长新闻七要素分析。'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1500
            }
            
            response = self._request('POST', '/chat/completions', data)
            
            if response.get('choices'):
                content = response['choices'][0]['message']['content']
                
                # 提取JSON部分
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    json_str = json_match.group()
                    analysis_data = json.loads(json_str)
                    
                    if analysis_data:
                        return analysis_data
            
            logger.error(f"生成七要素分析失败: 响应格式不正确")
            raise Exception("生成七要素分析失败")
            
        except Exception as e:
            logger.error(f"生成七要素分析失败: {str(e)}")
            raise e
    
    def generate_relevance_analysis(self, news, user_focus_points):
        """生成相关性分析"""
        try:
            focus_points_str = ', '.join([fp.get('keyword', '') for fp in user_focus_points])
            
            prompt = f"""请分析这条新闻与用户关注点的相关性：

新闻内容：
标题：{news.get('title', '无标题')}
摘要：{news.get('summary', '无摘要')}

用户关注点：
{focus_points_str}

输出格式（必须是纯JSON，不要有任何其他文字）：
{{
  "focus_points": [
    {{
      "keyword": "关注点1",
      "score": 85,
      "level": "high",
      "reason": "新闻内容与关注点高度相关"
    }},
    {{
      "keyword": "关注点2",
      "score": 72,
      "level": "medium",
      "reason": "新闻内容与关注点中度相关"
    }}
  ],
  "overall_score": 78
}}

要求：
1. 分析新闻与每个关注点的相关性
2. 计算相关性评分（0-100）
3. 判断相关性等级（high/medium/low）
4. 提供相关性原因
5. 计算整体相关性评分"""

            data = {
                'model': 'deepseek-chat',
                'messages': [
                    {
                        'role': 'system',
                        'content': '你是一位专业的数据分析师，擅长相关性分析。'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1000
            }
            
            response = self._request('POST', '/chat/completions', data)
            
            if response.get('choices'):
                content = response['choices'][0]['message']['content']
                
                # 提取JSON部分
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    json_str = json_match.group()
                    relevance_data = json.loads(json_str)
                    
                    if relevance_data:
                        return relevance_data
            
            logger.error(f"生成相关性分析失败: 响应格式不正确")
            raise Exception("生成相关性分析失败")
            
        except Exception as e:
            logger.error(f"生成相关性分析失败: {str(e)}")
            raise e
    
    def generate_deep_exploration(self, news):
        """生成深度探索"""
        try:
            prompt = f"""请对这条新闻进行深度探索性分析：

新闻内容：
标题：{news.get('title', '无标题')}
摘要：{news.get('summary', '无摘要')}
内容：{news.get('content', '无内容')}

输出格式（必须是纯JSON，不要有任何其他文字）：
{{
  "semantic_analysis": "新闻的深层语义分析",
  "related_events": [
    {{
      "event": "相关事件1",
      "relation": "因果关系",
      "description": "事件1导致事件2的发生"
    }},
    {{
      "event": "相关事件2",
      "relation": "时间关联",
      "description": "事件2发生在事件1之后"
    }}
  ],
  "impact_prediction": {{
    "short_term": "短期影响：推动行业发展",
    "long_term": "长期影响：改变市场格局"
  }},
  "multi_dimension": {{
    "technical": "技术维度分析",
    "market": "市场维度分析",
    "policy": "政策维度分析",
    "social": "社会维度分析"
  }}
}}

要求：
1. 进行深度语义分析
2. 识别相关事件和关联关系
3. 预测短期和长期影响
4. 从多维度分析（技术、市场、政策、社会）
5. 提供探索性见解"""

            data = {
                'model': 'deepseek-chat',
                'messages': [
                    {
                        'role': 'system',
                        'content': '你是一位专业的新闻分析师，擅长深度探索性分析。'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.8,
                'max_tokens': 2000
            }
            
            response = self._request('POST', '/chat/completions', data)
            
            if response.get('choices'):
                content = response['choices'][0]['message']['content']
                
                # 提取JSON部分
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    json_str = json_match.group()
                    exploration_data = json.loads(json_str)
                    
                    if exploration_data:
                        return exploration_data
            
            logger.error(f"生成深度探索失败: 响应格式不正确")
            raise Exception("生成深度探索失败")
            
        except Exception as e:
            logger.error(f"生成深度探索失败: {str(e)}")
            raise e
    
    def test_connection(self):
        """测试API连接"""
        try:
            data = {
                'model': 'deepseek-chat',
                'messages': [
                    {
                        'role': 'user',
                        'content': '测试连接'
                    }
                ],
                'max_tokens': 50
            }
            
            response = self._request('POST', '/chat/completions', data)
            
            if response.get('choices'):
                return {
                    'success': True,
                    'message': 'API连接正常',
                    'latency': response.get('usage', {}).get('total_tokens', 0)
                }
            
            logger.error(f"测试API连接失败: 响应格式不正确")
            return {
                    'success': False,
                    'message': 'API连接失败'
                }
            
        except Exception as e:
            logger.error(f"测试API连接失败: {str(e)}")
            return {
                    'success': False,
                    'message': f'API连接失败: {str(e)}'
            }