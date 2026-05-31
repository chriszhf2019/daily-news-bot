"""
业务逻辑服务
实现用户认证、新闻分析、用户管理等业务逻辑
"""

from models import User, News, AnalysisResult, FocusPoint, NewsFavorite, ReadLater, DatabaseManager
from services.deepseek_client import DeepSeekClient
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AuthService:
    """用户认证服务"""
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.deepseek_client = DeepSeekClient()
    
    def register(self, username, password, email=None, nickname=None):
        """用户注册"""
        try:
            # 检查用户名是否已存在
            existing_user = self.db_manager.get_user_by_openid(username)
            if existing_user:
                return {
                    'success': False,
                    'message': '用户名已存在',
                    'error_code': 'USER_EXISTS'
                }
            
            # 创建用户
            user = self.db_manager.create_user(
                openid=username,
                nickname=nickname or username,
                email=email
            )
            
            return {
                'success': True,
                'message': '注册成功',
                'data': {
                    'user_id': user.id,
                    'username': user.nickname,
                    'email': user.email
                }
            }
            
        except Exception as e:
            logger.error(f"注册失败: {str(e)}")
            return {
                'success': False,
                'message': '注册失败，请稍后重试',
                'error_code': 'REGISTER_FAILED'
            }
    
    def login(self, username, password):
        """用户登录"""
        try:
            # 检查用户是否存在
            user = self.db_manager.get_user_by_openid(username)
            if not user:
                return {
                    'success': False,
                    'message': '用户不存在',
                    'error_code': 'USER_NOT_FOUND'
                }
            
            # TODO: 验证密码（需要密码哈希）
            # 临时返回成功
            return {
                'success': True,
                'message': '登录成功',
                'data': {
                    'user_id': user.id,
                    'username': user.nickname,
                    'email': user.email
                }
            }
            
        except Exception as e:
            logger.error(f"登录失败: {str(e)}")
            return {
                'success': False,
                'message': '登录失败，请检查用户名和密码',
                'error_code': 'LOGIN_FAILED'
            }
    
    def get_profile(self, user_id):
        """获取用户信息"""
        try:
            user = self.db_manager.get_user_by_openid(user_id)
            if not user:
                return {
                    'success': False,
                    'message': '用户不存在',
                    'error_code': 'USER_NOT_FOUND'
                }
            
            return {
                'success': True,
                'data': {
                    'user_id': user.id,
                    'username': user.nickname,
                    'email': user.email,
                    'preferences': user.preferences
                }
            }
            
        except Exception as e:
            logger.error(f"获取用户信息失败: {str(e)}")
            return {
                'success': False,
                'message': '获取用户信息失败',
                'error_code': 'GET_PROFILE_FAILED'
            }
    
    def update_profile(self, user_id, nickname=None, email=None, preferences=None):
        """更新用户信息"""
        try:
            user = self.db_manager.get_user_by_openid(user_id)
            if not user:
                return {
                    'success': False,
                    'message': '用户不存在',
                    'error_code': 'USER_NOT_FOUND'
                }
            
            # 更新用户信息
            if nickname:
                user.nickname = nickname
            if email:
                user.email = email
            if preferences:
                user.preferences = preferences
            user.updated_at = datetime.utcnow()
            
            return {
                'success': True,
                'message': '更新成功',
                'data': {
                    'user_id': user.id,
                    'username': user.nickname
                }
            }
            
        except Exception as e:
            logger.error(f"更新用户信息失败: {str(e)}")
            return {
                'success': False,
                'message': '更新用户信息失败',
                'error_code': 'UPDATE_PROFILE_FAILED'
            }

class AnalysisService:
    """新闻分析服务"""
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.deepseek_client = DeepSeekClient()
    
    def seven_elements_analysis(self, user_id, news):
        """七要素分析"""
        try:
            # 调用DeepSeek API生成七要素分析
            analysis_result = self.deepseek_client.generate_audit_analysis(news)
            
            # 保存分析结果
            self.db_manager.create_analysis_result(
                user_id=user_id,
                news_id=news.get('id'),
                analysis_type='audit',
                result=analysis_result
            )
            
            return {
                'success': True,
                'message': '分析成功',
                'data': {
                    'analysis_id': analysis_result.get('id') if isinstance(analysis_result, dict) else None,
                    'result': analysis_result
                }
            }
            
        except Exception as e:
            logger.error(f"七要素分析失败: {str(e)}")
            return {
                'success': False,
                'message': '七要素分析失败',
                'error_code': 'AUDIT_FAILED'
            }
    
    def relevance_analysis(self, user_id, news):
        """相关性分析"""
        try:
            # 获取用户关注点
            focus_points = self.db_manager.get_focus_points(user_id)
            
            # 调用DeepSeek API生成相关性分析
            analysis_result = self.deepseek_client.generate_relevance_analysis(news, focus_points)
            
            # 保存分析结果
            self.db_manager.create_analysis_result(
                user_id=user_id,
                news_id=news.get('id'),
                analysis_type='relevance',
                result=analysis_result
            )
            
            return {
                'success': True,
                'message': '分析成功',
                'data': {
                    'analysis_id': analysis_result.get('id') if isinstance(analysis_result, dict) else None,
                    'result': analysis_result
                }
            }
            
        except Exception as e:
            logger.error(f"相关性分析失败: {str(e)}")
            return {
                'success': False,
                'message': '相关性分析失败',
                'error_code': 'RELEVANCE_FAILED'
            }
    
    def deep_exploration(self, user_id, news):
        """深度探索"""
        try:
            # 调用DeepSeek API生成深度探索
            exploration_result = self.deepseek_client.generate_deep_exploration(news)
            
            # 保存分析结果
            self.db_manager.create_analysis_result(
                user_id=user_id,
                news_id=news.get('id'),
                analysis_type='exploration',
                result=exploration_result
            )
            
            return {
                'success': True,
                'message': '分析成功',
                'data': {
                    'analysis_id': exploration_result.get('id') if isinstance(exploration_result, dict) else None,
                    'result': exploration_result
                }
            }
            
        except Exception as e:
            logger.error(f"深度探索失败: {str(e)}")
            return {
                'success': False,
                'message': '深度探索失败',
                'error_code': 'EXPLORATION_FAILED'
            }
    
    def get_analysis_history(self, user_id, limit=20):
        """获取分析历史"""
        try:
            history = self.db_manager.get_analysis_history(user_id, limit)
            
            return {
                'success': True,
                'data': {
                    'analyses': history
                }
            }
            
        except Exception as e:
            logger.error(f"获取分析历史失败: {str(e)}")
            return {
                'success': False,
                'message': '获取分析历史失败',
                'error_code': 'GET_HISTORY_FAILED'
            }
    
    def get_analysis_detail(self, analysis_id):
        """获取分析详情"""
        try:
            db_session = self.db_manager.session
            
            # TODO: 从数据库查询分析详情
            # 临时返回模拟数据
            analysis_detail = {
                'id': analysis_id,
                'type': 'audit',
                'result': {},
                'created_at': datetime.now().isoformat()
            }
            
            return {
                'success': True,
                'data': analysis_detail
            }
            
        except Exception as e:
            logger.error(f"获取分析详情失败: {str(e)}")
            return {
                'success': False,
                'message': '获取分析详情失败',
                'error_code': 'GET_DETAIL_FAILED'
            }

class NewsService:
    """新闻数据服务"""
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def get_news_list(self, page=1, per_page=10, category='all'):
        """获取新闻列表"""
        try:
            # TODO: 从数据库查询新闻列表
            # 临时返回模拟数据
            news_list = []
            
            return {
                'success': True,
                'data': {
                    'news': news_list,
                    'pagination': {
                        'page': page,
                        'per_page': per_page,
                        'total': 0,
                        'total_pages': 0
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"获取新闻列表失败: {str(e)}")
            return {
                'success': False,
                'message': '获取新闻列表失败',
                'error_code': 'GET_NEWS_LIST_FAILED'
            }
    
    def get_news_detail(self, news_id):
        """获取新闻详情"""
        try:
            # TODO: 从数据库查询新闻详情
            # 临时返回模拟数据
            news_detail = {
                'id': news_id,
                'title': '新闻标题',
                'summary': '新闻摘要',
                'content': '新闻内容'
            }
            
            return {
                'success': True,
                'data': news_detail
            }
            
        except Exception as e:
            logger.error(f"获取新闻详情失败: {str(e)}")
            return {
                'success': False,
                'message': '获取新闻详情失败',
                'error_code': 'GET_NEWS_DETAIL_FAILED'
            }
    
    def get_news_by_category(self, category, page=1, per_page=10):
        """按分类获取新闻"""
        try:
            # TODO: 从数据库查询分类新闻
            # 临时返回模拟数据
            news_list = []
            
            return {
                'success': True,
                'data': {
                    'category': category,
                    'news': news_list
                }
            }
            
        except Exception as e:
            logger.error(f"按分类获取新闻失败: {str(e)}")
            return {
                'success': False,
                'message': '按分类获取新闻失败',
                'error_code': 'GET_NEWS_BY_CATEGORY_FAILED'
            }
    
    def search_news(self, keyword, page=1, per_page=10):
        """搜索新闻"""
        try:
            # TODO: 从数据库搜索新闻
            # 临时返回模拟数据
            search_results = []
            
            return {
                'success': True,
                'data': {
                    'keyword': keyword,
                    'results': search_results
                }
            }
            
        except Exception as e:
            logger.error(f"搜索新闻失败: {str(e)}")
            return {
                'success': False,
                'message': '搜索新闻失败',
                'error_code': 'SEARCH_NEWS_FAILED'
            }

class UserService:
    """用户管理服务"""
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def get_focus_points(self, user_id):
        """获取关注点"""
        try:
            focus_points = self.db_manager.get_focus_points(user_id)
            
            return {
                'success': True,
                'data': {
                    'focus_points': focus_points
                }
            }
            
        except Exception as e:
            logger.error(f"获取关注点失败: {str(e)}")
            return {
                'success': False,
                'message': '获取关注点失败',
                'error_code': 'GET_FOCUS_POINTS_FAILED'
            }
    
    def add_focus_point(self, user_id, keyword, category=None):
        """添加关注点"""
        try:
            focus_point = self.db_manager.create_focus_point(
                user_id=user_id,
                keyword=keyword,
                category=category
            )
            
            return {
                'success': True,
                'message': '添加成功',
                'data': {
                    'keyword': keyword,
                    'category': category
                }
            }
            
        except Exception as e:
            logger.error(f"添加关注点失败: {str(e)}")
            return {
                'success': False,
                'message': '添加关注点失败',
                'error_code': 'ADD_FOCUS_POINT_FAILED'
            }
    
    def remove_focus_point(self, user_id, focus_point_id):
        """删除关注点"""
        try:
            # TODO: 从数据库查询关注点
            # 临时返回成功
            return {
                'success': True,
                'message': '删除成功'
            }
            
        except Exception as e:
            logger.error(f"删除关注点失败: {str(e)}")
            return {
                'success': False,
                'message': '删除关注点失败',
                'error_code': 'REMOVE_FOCUS_POINT_FAILED'
            }
    
    def get_read_history(self, user_id):
        """获取阅读历史"""
        try:
            # TODO: 从数据库查询阅读历史
            # 临时返回模拟数据
            history = []
            
            return {
                'success': True,
                'data': {
                    'history': history
                }
            }
            
        except Exception as e:
            logger.error(f"获取阅读历史失败: {str(e)}")
            return {
                'success': False,
                'message': '获取阅读历史失败',
                'error_code': 'GET_READ_HISTORY_FAILED'
            }
    
    def get_favorites(self, user_id):
        """获取收藏列表"""
        try:
            favorites = self.db_manager.get_favorites(user_id)
            
            return {
                'success': True,
                'data': {
                    'favorites': favorites
                }
            }
            
        except Exception as e:
            logger.error(f"获取收藏列表失败: {str(e)}")
            return {
                'success': False,
                'message': '获取收藏列表失败',
                'error_code': 'GET_FAVORITES_FAILED'
            }
    
    def add_favorite(self, user_id, news_id):
        """添加收藏"""
        try:
            favorite = self.db_manager.add_favorite(
                user_id=user_id,
                news_id=news_id
            )
            
            return {
                'success': True,
                'message': '收藏成功'
            }
            
        except Exception as e:
            logger.error(f"添加收藏失败: {str(e)}")
            return {
                'success': False,
                'message': '添加收藏失败',
                'error_code': 'ADD_FAVORITE_FAILED'
            }
    
    def remove_favorite(self, user_id, favorite_id):
        """取消收藏"""
        try:
            self.db_manager.remove_favorite(user_id, favorite_id)
            
            return {
                'success': True,
                'message': '取消收藏成功'
            }
            
        except Exception as e:
            logger.error(f"取消收藏失败: {str(e)}")
            return {
                'success': False,
                'message': '取消收藏失败',
                'error_code': 'REMOVE_FAVORITE_FAILED'
            }