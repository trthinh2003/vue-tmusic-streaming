// services/evaluationService.js
import axiosInstance from "@/configs/axios";

/**
 * Service để tương tác với các API đánh giá hệ thống recommendation
 */

/**
 * Lấy metrics nhanh cho dashboard
 * @returns {Promise<Object>} Quick metrics data
 */
export const getEvaluationMetrics = async () => {
  try {
    const response = await axiosInstance.get('/evaluation/quick-metrics');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching evaluation metrics:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Chạy đánh giá toàn diện hệ thống
 * @returns {Promise<Object>} Full evaluation results
 */
export const getFullEvaluation = async () => {
  try {
    const response = await axiosInstance.get('/evaluation/full-evaluation');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error running full evaluation:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy so sánh hiệu suất với baseline
 * @returns {Promise<Object>} Benchmark comparison data
 */
export const getBenchmarkComparison = async () => {
  try {
    const response = await axiosInstance.get('/evaluation/benchmark');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching benchmark comparison:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Xuất báo cáo đánh giá chi tiết
 * @returns {Promise<Object>} Detailed evaluation report
 */
export const generateReport = async () => {
  try {
    const response = await axiosInstance.get('/evaluation/report');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy dữ liệu tương tác người dùng để phân tích
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Số lượng records tối đa
 * @param {number} params.offset - Offset cho pagination
 * @param {string} params.sortBy - Trường để sort
 * @param {string} params.sortOrder - Thứ tự sort (asc/desc)
 * @param {string} params.search - Từ khóa tìm kiếm
 * @returns {Promise<Object>} User interaction data
 */
export const getUserInteractionData = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      limit: params.limit || 50,
      offset: params.offset || 0,
      sortBy: params.sortBy || 'lastInteractedAt',
      sortOrder: params.sortOrder || 'desc',
      search: params.search || ''
    });

    const response = await axiosInstance.get(`/user-interactions?${queryParams}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching user interaction data:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy thống kê hành vi người dùng theo thời gian
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} params.endDate - Ngày kết thúc (YYYY-MM-DD)
 * @param {string} params.groupBy - Nhóm dữ liệu theo (day/week/month)
 * @returns {Promise<Object>} User behavior statistics
 */
export const getUserBehaviorStats = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      startDate: params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: params.endDate || new Date().toISOString().split('T')[0],
      groupBy: params.groupBy || 'day'
    });

    const response = await axiosInstance.get(`/analytics/user-behavior?${queryParams}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching user behavior stats:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy thống kê hiệu suất recommendation theo user
 * @param {number} userId - ID của user (optional)
 * @returns {Promise<Object>} Recommendation performance data
 */
export const getRecommendationPerformance = async (userId = null) => {
  try {
    const url = userId 
      ? `/evaluation/user-performance/${userId}`
      : '/evaluation/overall-performance';
      
    const response = await axiosInstance.get(url);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching recommendation performance:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy ma trận similarity giữa các users
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Số lượng top similarities
 * @param {number} params.minScore - Điểm similarity tối thiểu
 * @returns {Promise<Object>} User similarity matrix
 */
export const getUserSimilarityMatrix = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      limit: params.limit || 100,
      minScore: params.minScore || 0.1
    });

    const response = await axiosInstance.get(`/analytics/user-similarity?${queryParams}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching user similarity matrix:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy thống kê coverage của hệ thống
 * @returns {Promise<Object>} System coverage statistics
 */
export const getSystemCoverage = async () => {
  try {
    const response = await axiosInstance.get('/analytics/system-coverage');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching system coverage:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Trigger cập nhật similarity cho tất cả users
 * @returns {Promise<Object>} Update operation result
 */
export const triggerSimilarityUpdate = async () => {
  try {
    const response = await axiosInstance.post('/evaluation/update-similarities');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error triggering similarity update:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy chi tiết đánh giá cho một user cụ thể
 * @param {number} userId - ID của user
 * @returns {Promise<Object>} User specific evaluation
 */
export const getUserSpecificEvaluation = async (userId) => {
  try {
    const response = await axiosInstance.get(`/evaluation/user/${userId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`Error fetching evaluation for user ${userId}:`, error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy thống kê real-time của hệ thống
 * @returns {Promise<Object>} Real-time system statistics
 */
export const getRealTimeStats = async () => {
  try {
    const response = await axiosInstance.get('/analytics/realtime');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching real-time stats:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy lịch sử hiệu suất của hệ thống
 * @param {Object} params - Query parameters
 * @param {string} params.period - Khoảng thời gian (week/month/quarter)
 * @param {number} params.limit - Số lượng records
 * @returns {Promise<Object>} Performance history
 */
export const getPerformanceHistory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      period: params.period || 'month',
      limit: params.limit || 12
    });

    const response = await axiosInstance.get(`/analytics/performance-history?${queryParams}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching performance history:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy phân tích A/B testing results
 * @returns {Promise<Object>} A/B testing results
 */
export const getABTestingResults = async () => {
  try {
    const response = await axiosInstance.get('/evaluation/ab-testing');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching A/B testing results:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Export dữ liệu đánh giá ra file CSV
 * @param {Object} params - Export parameters
 * @param {string} params.type - Loại data cần export (metrics/interactions/similarities)
 * @param {string} params.format - Format file (csv/excel)
 * @returns {Promise<Blob>} File blob
 */
export const exportEvaluationData = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      type: params.type || 'metrics',
      format: params.format || 'csv'
    });

    const response = await axiosInstance.get(`/evaluation/export?${queryParams}`, {
      responseType: 'blob'
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error exporting evaluation data:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Lấy recommendations cho một user để test
 * @param {number} userId - ID của user
 * @param {number} limit - Số lượng recommendations
 * @returns {Promise<Object>} Test recommendations
 */
export const getTestRecommendations = async (userId, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/recommendations/user/${userId}?limit=${limit}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`Error fetching test recommendations for user ${userId}:`, error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Gửi feedback về chất lượng recommendation
 * @param {Object} feedback - Feedback data
 * @param {number} feedback.userId - ID của user
 * @param {number} feedback.songId - ID của bài hát được recommend
 * @param {number} feedback.rating - Đánh giá (1-5)
 * @param {string} feedback.comment - Bình luận (optional)
 * @returns {Promise<Object>} Feedback submission result
 */
export const submitRecommendationFeedback = async (feedback) => {
  try {
    const response = await axiosInstance.post('/evaluation/feedback', feedback);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error submitting recommendation feedback:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Utility functions for data processing

/**
 * Tính toán improvement percentage
 * @param {number} current - Giá trị hiện tại
 * @param {number} baseline - Giá trị baseline
 * @returns {number} Improvement percentage
 */
export const calculateImprovement = (current, baseline) => {
  if (baseline === 0) return 0;
  return ((current - baseline) / baseline) * 100;
};

/**
 * Format metrics data cho charts
 * @param {Object} metrics - Raw metrics data
 * @returns {Object} Formatted data for charts
 */
export const formatMetricsForChart = (metrics) => {
  return {
    labels: Object.keys(metrics),
    datasets: [{
      data: Object.values(metrics),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ]
    }]
  };
};

/**
 * Validate evaluation parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result
 */
export const validateEvaluationParams = (params) => {
  const errors = [];
  
  if (params.startDate && params.endDate) {
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    
    if (start > end) {
      errors.push('Ngày bắt đầu không thể lớn hơn ngày kết thúc');
    }
    
    if (end > new Date()) {
      errors.push('Ngày kết thúc không thể lớn hơn ngày hiện tại');
    }
  }
  
  if (params.limit && (params.limit < 1 || params.limit > 1000)) {
    errors.push('Limit phải trong khoảng 1-1000');
  }
  
  if (params.minScore && (params.minScore < 0 || params.minScore > 1)) {
    errors.push('Min score phải trong khoảng 0-1');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Cache management cho API calls
 */
class EvaluationCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear() {
    this.cache.clear();
  }
}

export const evaluationCache = new EvaluationCache();

/**
 * Cached version of getEvaluationMetrics
 */
export const getCachedEvaluationMetrics = async () => {
  const cacheKey = 'evaluation-metrics';
  const cached = evaluationCache.get(cacheKey);
  
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }
  
  const result = await getEvaluationMetrics();
  if (result.success) {
    evaluationCache.set(cacheKey, result.data);
  }
  
  return result;
};

export default {
  getEvaluationMetrics,
  getFullEvaluation,
  getBenchmarkComparison,
  generateReport,
  getUserInteractionData,
  getUserBehaviorStats,
  getRecommendationPerformance,
  getUserSimilarityMatrix,
  getSystemCoverage,
  triggerSimilarityUpdate,
  getUserSpecificEvaluation,
  getRealTimeStats,
  getPerformanceHistory,
  getABTestingResults,
  exportEvaluationData,
  getTestRecommendations,
  submitRecommendationFeedback,
  calculateImprovement,
  formatMetricsForChart,
  validateEvaluationParams,
  getCachedEvaluationMetrics,
  evaluationCache
};