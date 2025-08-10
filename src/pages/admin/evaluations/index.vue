<!-- evaluations/index.vue -->
<template>
  <div class="evaluation-dashboard">
    <!-- Header với loading state -->
    <div class="dashboard-header">
      <h1 class="title">
        <i class="fas fa-chart-line"></i>
        Thống Kê Hành Vi Người Dùng & Đánh Giá Hệ Thống
      </h1>
      <div class="header-actions">
        <button @click="refreshData" :disabled="isLoading" class="btn-refresh">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
        </button>
        <button @click="exportReport" class="btn-export">
          <i class="fas fa-download"></i>
          Xuất báo cáo
        </button>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Đang phân tích dữ liệu... Thuật toán này có độ phức tạp cao, xin vui lòng chờ.</p>
      </div>
    </div>

    <!-- Main content -->
    <div v-else class="dashboard-content">
      <!-- Quick metrics cards -->
      <div class="metrics-grid">
        <div class="metric-card accuracy">
          <div class="metric-icon">
            <i class="fas fa-bullseye"></i>
          </div>
          <div class="metric-content">
            <h3>Độ Chính Xác</h3>
            <div class="metric-value">{{ quickMetrics.accuracy?.mae || 0 }}</div>
            <div class="metric-label">MAE Score</div>
            <div class="metric-status" :class="getStatusClass(quickMetrics.accuracy?.status)">
              {{ quickMetrics.accuracy?.status || 'Chưa có dữ liệu' }}
            </div>
          </div>
        </div>

        <div class="metric-card quality">
          <div class="metric-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="metric-content">
            <h3>Chất Lượng Gợi Ý</h3>
            <div class="metric-value">{{ quickMetrics.recommendation_quality?.f1_score || 0 }}%</div>
            <div class="metric-label">F1-Score</div>
            <div class="metric-status" :class="getStatusClass(quickMetrics.recommendation_quality?.status)">
              {{ quickMetrics.recommendation_quality?.status || 'Chưa có dữ liệu' }}
            </div>
          </div>
        </div>

        <div class="metric-card similarity">
          <div class="metric-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="metric-content">
            <h3>Độ Tương Tự User</h3>
            <div class="metric-value">{{ quickMetrics.system_health?.similarity_accuracy || 0 }}%</div>
            <div class="metric-label">Accuracy</div>
            <div class="metric-status success">
              {{ quickMetrics.system_health?.similarity_accuracy > 70 ? 'Tốt' : 'Cần cải thiện' }}
            </div>
          </div>
        </div>

        <div class="metric-card coverage">
          <div class="metric-icon">
            <i class="fas fa-expand-arrows-alt"></i>
          </div>
          <div class="metric-content">
            <h3>Coverage</h3>
            <div class="metric-value">{{ quickMetrics.system_health?.coverage_percentage || 0 }}%</div>
            <div class="metric-label">Catalog Coverage</div>
            <div class="metric-status" :class="quickMetrics.system_health?.coverage_percentage > 30 ? 'success' : 'warning'">
              {{ quickMetrics.system_health?.coverage_percentage > 30 ? 'Tốt' : 'Cần mở rộng' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Charts section -->
      <div class="charts-section">
        <!-- Performance comparison chart -->
        <div class="chart-container">
          <div class="chart-header">
            <h3>So Sánh Hiệu Suất với Baseline</h3>
            <div class="chart-controls">
              <select v-model="selectedMetric" @change="updateComparisonChart">
                <option value="all">Tất cả metrics</option>
                <option value="mae">MAE</option>
                <option value="precision">Precision</option>
                <option value="recall">Recall</option>
                <option value="f1">F1-Score</option>
              </select>
            </div>
          </div>
          <div class="chart-wrapper">
            <canvas ref="comparisonChart"></canvas>
          </div>
        </div>

        <!-- User behavior analysis -->
        <div class="chart-container">
          <div class="chart-header">
            <h3>Phân Tích Hành Vi Người Dùng</h3>
          </div>
          <div class="chart-wrapper">
            <canvas ref="behaviorChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Detailed analysis -->
      <div class="analysis-section">
        <div class="analysis-container">
          <div class="analysis-header">
            <h3>Phân Tích Chi Tiết</h3>
            <div class="analysis-tabs">
              <button 
                v-for="tab in analysisTabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="{ active: activeTab === tab.id }"
                class="tab-button"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- Business Impact Tab -->
          <div v-if="activeTab === 'business'" class="analysis-content">
            <div class="business-metrics">
              <div class="business-card" v-for="(value, key) in quickMetrics.business_impact" :key="key">
                <h4>{{ formatBusinessMetricName(key) }}</h4>
                <div class="business-value">{{ value }}</div>
              </div>
            </div>
          </div>

          <!-- User Insights Tab -->
          <div v-if="activeTab === 'insights'" class="analysis-content">
            <div class="insights-grid">
              <div class="insight-card">
                <h4>Thời Gian Phản Hồi</h4>
                <div class="insight-chart">
                  <canvas ref="responseTimeChart"></canvas>
                </div>
              </div>
              <div class="insight-card">
                <h4>Độ Đa Dạng Gợi Ý</h4>
                <div class="insight-chart">
                  <canvas ref="diversityChart"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations Tab -->
          <div v-if="activeTab === 'recommendations'" class="analysis-content">
            <div class="recommendations-list">
              <div class="recommendation-item" v-for="rec in recommendations" :key="rec.id">
                <div class="rec-icon" :class="rec.priority">
                  <i :class="rec.icon"></i>
                </div>
                <div class="rec-content">
                  <h4>{{ rec.title }}</h4>
                  <p>{{ rec.description }}</p>
                  <div class="rec-impact">Tác động dự kiến: {{ rec.impact }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data table -->
      <div class="data-table-section">
        <div class="table-header">
          <h3>Dữ Liệu Chi Tiết</h3>
          <div class="table-filters">
            <input 
              v-model="searchQuery" 
              placeholder="Tìm kiếm..." 
              class="search-input"
            >
            <select v-model="sortBy" class="sort-select">
              <option value="userId">User ID</option>
              <option value="interactionScore">Interaction Score</option>
              <option value="lastInteracted">Lần tương tác cuối</option>
            </select>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Số lượt nghe</th>
                <th>Số bài thích</th>
                <th>Playlist tạo</th>
                <th>Downloads</th>
                <th>Score tương tác</th>
                <th>Lần cuối hoạt động</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUserData" :key="user.userId">
                <td>{{ user.userId }}</td>
                <td>{{ user.playCount }}</td>
                <td>{{ user.likeCount }}</td>
                <td>{{ user.playlistCount }}</td>
                <td>{{ user.downloadCount }}</td>
                <td>
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: (user.interactionScore / 10) * 100 + '%' }"></div>
                    <span class="score-text">{{ user.interactionScore.toFixed(2) }}</span>
                  </div>
                </td>
                <td>{{ formatDate(user.lastInteracted) }}</td>
                <td>
                  <span class="status-badge" :class="getUserStatus(user.interactionScore)">
                    {{ getUserStatusText(user.interactionScore) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Chart from 'chart.js/auto';
import { ref, onMounted, computed, nextTick } from 'vue';
import { getEvaluationMetrics, getFullEvaluation, getBenchmarkComparison, generateReport } from '@/services/evaluationService';

// Reactive data
const isLoading = ref(false);
const quickMetrics = ref({});
const benchmarkData = ref({});
const fullEvaluation = ref({});
const activeTab = ref('business');
const selectedMetric = ref('all');
const searchQuery = ref('');
const sortBy = ref('userId');

// Chart references
const comparisonChart = ref(null);
const behaviorChart = ref(null);
const responseTimeChart = ref(null);
const diversityChart = ref(null);

// Chart instances
let comparisonChartInstance = null;
let behaviorChartInstance = null;
let responseTimeChartInstance = null;
let diversityChartInstance = null;

// Configuration
const analysisTabs = [
  { id: 'business', label: 'Tác Động Kinh Doanh' },
  { id: 'insights', label: 'Thông Tin Chi Tiết' },
  { id: 'recommendations', label: 'Khuyến Nghị' }
];

// Mock user data for demonstration
const userData = ref([
  { userId: 1, playCount: 245, likeCount: 34, playlistCount: 5, downloadCount: 12, interactionScore: 8.2, lastInteracted: new Date('2024-08-01') },
  { userId: 2, playCount: 156, likeCount: 28, playlistCount: 3, downloadCount: 8, interactionScore: 6.8, lastInteracted: new Date('2024-07-30') },
  { userId: 3, playCount: 89, likeCount: 15, playlistCount: 2, downloadCount: 4, interactionScore: 4.5, lastInteracted: new Date('2024-07-28') },
  { userId: 4, playCount: 312, likeCount: 67, playlistCount: 8, downloadCount: 23, interactionScore: 9.1, lastInteracted: new Date('2024-08-02') },
  { userId: 5, playCount: 78, likeCount: 12, playlistCount: 1, downloadCount: 2, interactionScore: 3.2, lastInteracted: new Date('2024-07-25') }
]);

const recommendations = ref([
  {
    id: 1,
    title: 'Cải thiện thuật toán similarity',
    description: 'Thử sử dụng Pearson correlation thay vì Cosine similarity để tăng độ chính xác',
    impact: '+15% Precision',
    priority: 'high',
    icon: 'fas fa-cogs'
  },
  {
    id: 2,
    title: 'Tăng threshold cho similar users',
    description: 'Lọc bỏ users có similarity score < 0.3 để cải thiện chất lượng gợi ý',
    impact: '+8% F1-Score',
    priority: 'medium',
    icon: 'fas fa-filter'
  },
  {
    id: 3,
    title: 'Kết hợp Content-based Filtering',
    description: 'Thêm thuật toán CBF để tăng coverage và xử lý cold start problem',
    impact: '+25% Coverage',
    priority: 'high',
    icon: 'fas fa-puzzle-piece'
  }
]);

// Computed properties
const filteredUserData = computed(() => {
  let filtered = userData.value;
  
  if (searchQuery.value) {
    filtered = filtered.filter(user => 
      user.userId.toString().includes(searchQuery.value)
    );
  }
  
  return filtered.sort((a, b) => {
    if (sortBy.value === 'userId') return a.userId - b.userId;
    if (sortBy.value === 'interactionScore') return b.interactionScore - a.interactionScore;
    if (sortBy.value === 'lastInteracted') return new Date(b.lastInteracted) - new Date(a.lastInteracted);
    return 0;
  });
});

// Methods
const refreshData = async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      loadQuickMetrics(),
      loadBenchmarkData(),
      loadFullEvaluation()
    ]);
    
    await nextTick();
    initializeCharts();
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    isLoading.value = false;
  }
};

const loadQuickMetrics = async () => {
  try {
    const response = await getEvaluationMetrics();
    quickMetrics.value = response.data?.metrics || {};
  } catch (error) {
    console.error('Error loading quick metrics:', error);
    // Mock data for demonstration
    quickMetrics.value = {
      accuracy: { mae: 1.23, status: 'Good' },
      recommendation_quality: { f1_score: 34.5, status: 'Good' },
      system_health: { similarity_accuracy: 72.3, coverage_percentage: 28.7 },
      business_impact: {
        UserEngagementBoost: '12.5%',
        EstimatedCTR: '18.3%',
        UserRetentionRate: '78.9%',
        ActiveUserRatio: '45.2%'
      }
    };
  }
};

const loadBenchmarkData = async () => {
  try {
    const response = await getBenchmarkComparison();
    benchmarkData.value = response.data?.comparison || {};
  } catch (error) {
    console.error('Error loading benchmark data:', error);
    // Mock data for demonstration
    benchmarkData.value = {
      current_system: { mae: 1.23, precision_at_10: 0.345, recall_at_10: 0.287, f1_score: 0.312 },
      baseline_system: { mae: 1.5, precision_at_10: 0.25, recall_at_10: 0.18, f1_score: 0.21 },
      improvements: { mae_improvement: 18.0, precision_improvement: 38.0, recall_improvement: 59.4, f1_improvement: 48.6 }
    };
  }
};

const loadFullEvaluation = async () => {
  try {
    const response = await getFullEvaluation();
    fullEvaluation.value = response.data || {};
  } catch (error) {
    console.error('Error loading full evaluation:', error);
  }
};

const exportReport = async () => {
  try {
    const response = await generateReport();
    const blob = new Blob([response.data.report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting report:', error);
  }
};

const initializeCharts = () => {
  initComparisonChart();
  initBehaviorChart();
  initResponseTimeChart();
  initDiversityChart();
};

const initComparisonChart = () => {
  if (comparisonChartInstance) {
    comparisonChartInstance.destroy();
  }
  
  const ctx = comparisonChart.value?.getContext('2d');
  if (!ctx) return;
  
  const data = benchmarkData.value;
  
  comparisonChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['MAE', 'Precision@10', 'Recall@10', 'F1-Score'],
      datasets: [
        {
          label: 'Hệ thống hiện tại',
          data: [
            data.current_system?.mae || 0,
            (data.current_system?.precision_at_10 || 0) * 100,
            (data.current_system?.recall_at_10 || 0) * 100,
            (data.current_system?.f1_score || 0) * 100
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Baseline',
          data: [
            data.baseline_system?.mae || 0,
            (data.baseline_system?.precision_at_10 || 0) * 100,
            (data.baseline_system?.recall_at_10 || 0) * 100,
            (data.baseline_system?.f1_score || 0) * 100
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'So sánh hiệu suất với Baseline System'
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Giá trị (%)'
          }
        }
      }
    }
  });
};

const initBehaviorChart = () => {
  if (behaviorChartInstance) {
    behaviorChartInstance.destroy();
  }
  
  const ctx = behaviorChart.value?.getContext('2d');
  if (!ctx) return;
  
  behaviorChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Nghe nhạc', 'Thích bài hát', 'Tạo playlist', 'Download'],
      datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: [
          'rgba(255, 206, 84, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: [
          'rgba(255, 206, 84, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Phân bố hành vi người dùng'
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  });
};

const initResponseTimeChart = () => {
  if (responseTimeChartInstance) {
    responseTimeChartInstance.destroy();
  }
  
  const ctx = responseTimeChart.value?.getContext('2d');
  if (!ctx) return;
  
  responseTimeChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [{
        label: 'Thời gian phản hồi (ms)',
        data: [120, 145, 180, 200, 165, 130],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Milliseconds'
          }
        }
      }
    }
  });
};

const initDiversityChart = () => {
  if (diversityChartInstance) {
    diversityChartInstance.destroy();
  }
  
  const ctx = diversityChart.value?.getContext('2d');
  if (!ctx) return;
  
  diversityChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Hip-hop'],
      datasets: [{
        label: 'Độ đa dạng thể loại',
        data: [85, 72, 45, 30, 68, 90],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(153, 102, 255, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20
          }
        }
      }
    }
  });
};

const updateComparisonChart = () => {
  // Update chart based on selected metric
  initComparisonChart();
};

// Utility functions
const getStatusClass = (status) => {
  if (status === 'Excellent' || status === 'Good') return 'success';
  if (status === 'Fair') return 'warning';
  return 'error';
};

const getUserStatus = (score) => {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
};

const getUserStatusText = (score) => {
  if (score >= 8) return 'Hoạt động cao';
  if (score >= 5) return 'Hoạt động vừa';
  return 'Hoạt động thấp';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatBusinessMetricName = (key) => {
  const names = {
    'UserEngagementBoost': 'Tăng trưởng tương tác',
    'EstimatedCTR': 'Tỷ lệ click ước tính',
    'UserRetentionRate': 'Tỷ lệ giữ chân user',
    'ActiveUserRatio': 'Tỷ lệ user hoạt động'
  };
  return names[key] || key;
};

// Lifecycle
onMounted(() => {
  refreshData();
});
</script>

<style scoped>
/* GENERAL STYLES */
.evaluation-dashboard {
  padding: 20px;
  background-color: #f0f2f5; /* Light gray background */
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #333;
}

/* HEADER */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.title {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-refresh, .btn-export {
  background-color: #ffffff;
  color: #555;
  border: 1px solid #d0d0d0;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-refresh:hover, .btn-export:hover {
  background-color: #f5f5f5;
  border-color: #a0a0a0;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* LOADING OVERLAY */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: #333;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* MAIN CONTENT SECTIONS */
.metrics-grid, .charts-section, .analysis-section, .data-table-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
  padding: 20px;
  margin-bottom: 20px;
}

/* METRICS CARDS */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 0; /* Remove padding as it's already in the container */
  box-shadow: none; /* Remove box shadow as it's already in the container */
  border: none;
  background-color: transparent;
}

.metric-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #ffffff;
}

/* Simplified solid colors for icons */
.accuracy .metric-icon { background-color: #3498db; }
.quality .metric-icon { background-color: #2ecc71; }
.similarity .metric-icon { background-color: #e67e22; }
.coverage .metric-icon { background-color: #9b59b6; }

.metric-content h3 {
  margin: 0 0 5px 0;
  font-size: 15px;
  font-weight: 500;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 2px;
}

.metric-label {
  font-size: 11px;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}

.metric-status {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.metric-status.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.metric-status.warning {
  background-color: #fffde7;
  color: #f9a825;
}

.metric-status.error {
  background-color: #ffebee;
  color: #c62828;
}

/* CHARTS SECTION */
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 0;
  box-shadow: none;
  border: none;
  background-color: transparent;
}

.chart-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.chart-controls select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #ffffff;
  font-size: 13px;
  color: #555;
}

.chart-wrapper {
  height: 250px;
  position: relative;
}

/* ANALYSIS SECTION */
.analysis-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.analysis-header {
  padding: 15px 20px 0;
  border-bottom: 1px solid #e0e0e0;
}

.analysis-header h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
}

.analysis-tabs {
  display: flex;
  gap: 0;
  margin-bottom: -1px;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background-color: transparent;
  color: #777;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  font-weight: 500;
}

.tab-button.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.tab-button:hover {
  color: #3498db;
}

.analysis-content {
  padding: 20px;
}

.business-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.business-card {
  background-color: #eaf4fd; /* Light blue */
  color: #333;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.business-card h4 {
  margin: 0 0 10px 0;
  font-size: 15px;
  font-weight: 500;
}

.business-value {
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
}

.insights-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.insight-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background-color: #ffffff;
}

.insight-card h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.insight-chart {
  height: 200px;
  position: relative;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #3498db;
}

.rec-icon {
  width: 35px;
  height: 35px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 15px;
  flex-shrink: 0;
}

.rec-icon.high { background-color: #e74c3c; }
.rec-icon.medium { background-color: #f39c12; }

.rec-content h4 {
  margin: 0 0 5px 0;
  font-size: 15px;
  font-weight: 600;
}

.rec-content p {
  margin: 0 0 5px 0;
  color: #555;
  line-height: 1.4;
  font-size: 14px;
}

.rec-impact {
  font-size: 13px;
  color: #27ae60;
  font-weight: 600;
}

/* DATA TABLE */
.data-table-section {
  padding: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.table-filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input, .sort-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #ffffff;
  color: #555;
  font-size: 13px;
}

.search-input {
  width: 180px;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e9ecef;
  font-size: 14px;
}

.data-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  color: #333;
  font-size: 14px;
}

.data-table tr:hover {
  background-color: #f5f5f5;
}

.score-bar {
  position: relative;
  background-color: #e9ecef;
  height: 18px;
  border-radius: 9px;
  overflow: hidden;
  min-width: 90px;
}

.score-fill {
  height: 100%;
  background-color: #2ecc71; /* Solid color for simplicity */
  transition: width 0.3s ease;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.status-badge {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.high { background-color: #e8f5e9; color: #2e7d32; }
.status-badge.medium { background-color: #fffde7; color: #f9a825; }
.status-badge.low { background-color: #ffebee; color: #c62828; }

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .evaluation-dashboard {
    padding: 15px;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .title {
    font-size: 20px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .btn-refresh, .btn-export {
    width: 48%;
    justify-content: center;
  }
  
  .charts-section, .insights-grid, .business-metrics {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .table-filters {
    flex-direction: row;
    gap: 10px;
    width: 100%;
  }
  
  .search-input {
    width: 60%;
  }
  
  .sort-select {
    width: 40%;
  }
}
</style>