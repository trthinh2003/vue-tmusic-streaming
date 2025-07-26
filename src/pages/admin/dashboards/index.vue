<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <h1><i class="fas fa-headphones-alt"></i> TMusicStreaming Dashboard</h1>
        <p class="subtitle">Thống kê và phân tích toàn diện</p>
      </div>
    </div>

    <div class="control-panel">
      <div class="filter-section">
        <div class="filter-group">
          <label for="dateRange">Khoảng Thời Gian:</label>
          <div class="select-wrapper">
            <select id="dateRange" v-model="filter.period" @change="fetchAdvancedData">
              <option value="all">Tất Cả</option>
              <option value="daily">24 Giờ Gần Nhất</option>
              <option value="weekly">7 Ngày Gần Nhất</option>
              <option value="monthly">30 Ngày Gần Nhất</option>
              <option value="custom">Tùy Chỉnh</option>
            </select>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="date-inputs" v-if="filter.period === 'custom'">
            <div class="date-input">
              <label>Từ</label>
              <input type="date" v-model="filter.startDate" />
            </div>
            <div class="date-input">
              <label>Đến</label>
              <input type="date" v-model="filter.endDate" />
            </div>
          </div>
          <button @click="applyFilter" class="btn apply-btn">
            <i class="fas fa-filter"></i> Áp dụng
          </button>
        </div>
      </div>
      <div class="export-section">
        <button @click="handleExportPdf" class="btn export-btn pdf">
          <i class="fas fa-file-pdf"></i> Xuất PDF
        </button>
        <button @click="handleExportExcel" class="btn export-btn excel">
          <i class="fas fa-file-excel"></i> Xuất Excel
        </button>
      </div>
    </div>

    <div class="summary-cards">
      <div class="stat-card album">
        <div class="card-icon">
          <i class="fas fa-compact-disc"></i>
        </div>
        <div class="card-content">
          <h3>{{ summary.totalAlbums || 0 }}</h3>
          <p>Albums</p>
          <div class="trend-indicator positive">
            <i class="fas fa-arrow-up"></i> 2.5%
          </div>
        </div>
      </div>
      
      <div class="stat-card artist">
        <div class="card-icon">
          <i class="fa-solid fa-user"></i>
        </div>
        <div class="card-content">
          <h3>{{ summary.totalArtists || 0 }}</h3>
          <p>Nghệ sĩ</p>
          <div class="trend-indicator positive">
            <i class="fas fa-arrow-up"></i> 1.8%
          </div>
        </div>
      </div>
      
      <div class="stat-card song">
        <div class="card-icon">
          <i class="fas fa-music"></i>
        </div>
        <div class="card-content">
          <h3>{{ summary.totalSongs || 0 }}</h3>
          <p>Bài hát</p>
          <div class="trend-indicator positive">
            <i class="fas fa-arrow-up"></i> 3.2%
          </div>
        </div>
      </div>
      
      <div class="stat-card user">
        <div class="card-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="card-content">
          <h3>{{ summary.totalUsers || 0 }}</h3>
          <p>Người dùng</p>
          <div class="trend-indicator neutral">
            <i class="fas fa-minus"></i> 0.4%
          </div>
        </div>
      </div>
      
      <div class="stat-card download">
        <div class="card-icon">
          <i class="fas fa-download"></i>
        </div>
        <div class="card-content">
          <h3>{{ summary.totalDownloads || 0 }}</h3>
          <p>Lượt tải xuống</p>
          <div class="trend-indicator negative">
            <i class="fas fa-arrow-down"></i> 1.1%
          </div>
        </div>
      </div>
      
      <div class="stat-card play">
        <div class="card-icon">
          <i class="fas fa-play-circle"></i>
        </div>
        <div class="card-content">
          <h3>{{ summary.totalPlays || 0 }}</h3>
          <p>Lượt chơi</p>
          <div class="trend-indicator positive">
            <i class="fas fa-arrow-up"></i> 4.7%
          </div>
        </div>
      </div>
      
      <div class="stat-card comment">
        <div class="card-icon">
          <i class="fas fa-comments"></i>
        </div>
        <div class="card-content">
          <h3>{{ summary.totalComments || 0 }}</h3>
          <p>Bình luận</p>
          <div class="trend-indicator positive">
            <i class="fas fa-arrow-up"></i> 2.3%
          </div>
        </div>
      </div>
      
      <div class="stat-card bandwidth">
        <div class="card-icon">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <div class="card-content">
          <h3>{{ formatBandwidth(cloudinaryData.bandwidth) }}</h3>
          <p>Băng thông Cloudinary</p>
          <div class="progress-container">
            <div class="progress-info">
              <span>Đã sử dụng</span>
              <!-- <span>{{ cloudinaryData.percentUsed.toFixed(1) }}%</span> -->
              <span>2.1%</span>
            </div>
            <div class="progress-bar">
              <!-- <div class="progress-fill" :style="{ width: cloudinaryData.percentUsed + '%' }"></div> -->
              <div class="progress-fill" :style="{ width: '2.1%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="analytics-section">
      <div class="chart-container">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Bài Hát Được Nghe Nhiều Nhất</h3>
            <div class="chart-actions">
              <button class="btn-icon"><i class="fas fa-ellipsis-h"></i></button>
            </div>
          </div>
          <div class="chart-content">
            <ul class="data-list">
              <li v-for="(song, index) in topSongsByPlays" :key="song.songId" class="data-item">
                <div class="item-rank">{{ index + 1 }}</div>
                <div class="item-info">
                  <div class="item-title">{{ song.title }}</div>
                  <div class="item-subtitle">{{ song.artistName }}</div>
                </div>
                <div class="item-value">{{ song.playCount }} plays</div>
              </li>
              <li v-if="topSongsByPlays.length === 0" class="data-item empty">
                Không có dữ liệu
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="chart-container">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Bài Hát Được Tải Nhiều Nhất</h3>
            <div class="chart-actions">
              <button class="btn-icon"><i class="fas fa-ellipsis-h"></i></button>
            </div>
          </div>
          <div class="chart-content">
            <ul class="data-list">
              <li v-for="(song, index) in topSongsByDownloads" :key="song.songId" class="data-item">
                <div class="item-rank">{{ index + 1 }}</div>
                <div class="item-info">
                  <div class="item-title">{{ song.title }}</div>
                  <div class="item-subtitle">{{ song.artistName }}</div>
                </div>
                <div class="item-value">{{ song.downloadCount }} downloads</div>
              </li>
              <li v-if="topSongsByDownloads.length === 0" class="data-item empty">
                Không có dữ liệu
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="chart-container">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Số Lượng Bài Hát Theo Thể Loại</h3>
            <div class="chart-actions">
              <button class="btn-icon"><i class="fas fa-ellipsis-h"></i></button>
            </div>
          </div>
          <div class="chart-content">
            <ul class="data-list">
              <li v-for="(count, genre) in songCountByGenre" :key="genre" class="data-item">
                <div class="item-info">
                  <div class="item-title">{{ genre }}</div>
                </div>
                <div class="item-value">{{ count }} songs</div>
              </li>
              <li v-if="Object.keys(songCountByGenre).length === 0" class="data-item empty">
                Không có dữ liệu
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="chart-container wide">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Xu Hướng Người Dùng Mới</h3>
            <div class="chart-actions">
              <button class="btn-icon"><i class="fas fa-ellipsis-h"></i></button>
            </div>
          </div>
          <div class="chart-content">
            <canvas id="newUsersChart"></canvas>
          </div>
        </div>
      </div>
      
      <div class="chart-container wide">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Xu Hướng Bài Hát Mới</h3>
            <div class="chart-actions">
              <button class="btn-icon"><i class="fas fa-ellipsis-h"></i></button>
            </div>
          </div>
          <div class="chart-content">
            <canvas id="newSongsChart"></canvas>
          </div>
        </div>
      </div>
      
      <div class="chart-container wide">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Xu Hướng Lượt Phát</h3>
            <div class="chart-actions">
              <button class="btn-icon"><i class="fas fa-ellipsis-h"></i></button>
            </div>
          </div>
          <div class="chart-content">
            <canvas id="totalPlaysChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="bandwidth-details">
      <div class="detail-card">
        <div class="detail-icon">
          <i class="fas fa-upload"></i>
        </div>
        <div class="detail-content">
          <h4>{{ formatBandwidth(cloudinaryData.bandwidth) }}</h4>
          <p>Băng Thông Đã Sử Dụng</p>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-icon">
          <i class="fas fa-tachometer-alt"></i>
        </div>
        <div class="detail-content">
          <h4>{{ cloudinaryData.limit > 0 ? formatBandwidth(cloudinaryData.limit) : 'Unlimited' }}</h4>
          <p>Giới Hạn Băng Thông</p>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-icon">
          <i class="far fa-clock"></i>
        </div>
        <div class="detail-content">
          <h4>{{ formatDate(cloudinaryData.lastUpdated) }}</h4>
          <p>Cập Nhật Lần Cuối</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import {
  getDashboardSummary,
  getCloudinaryUsage,
  getTopSongsByPlays,
  getTopSongsByDownloads,
  getSongCountByGenre,
  getNewUsersTrend,
  getNewSongsTrend,
  getTotalPlaysTrend,
  exportDashboardPdf,
  exportDashboardExcel
} from '@/services/dashboardService';
import Chart from 'chart.js/auto';

const summary = ref({});
const cloudinaryData = ref({
  bandwidth: 0,
  limit: 0,
  percentUsed: 0,
  lastUpdated: new Date()
});
const topSongsByPlays = ref([]);
const topSongsByDownloads = ref([]);
const songCountByGenre = ref({});
const newUsersTrendData = ref({});
const newSongsTrendData = ref({});
const totalPlaysTrendData = ref({});

// Filter state
const filter = ref({
  period: 'monthly',
  startDate: null,
  endDate: null,
  limit: 10
});

let newUsersChartInstance = null;
let newSongsChartInstance = null;
let totalPlaysChartInstance = null;

const formatBandwidth = (value) => {
  if (!value) return '0 MB';
  if (value < 1024) return `${value.toFixed(2)} MB`;
  return `${(value / 1024).toFixed(2)} GB`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US') + ' ' + date.toLocaleDateString('en-US');
};

const updateChart = (chartId, data, label, chartInstanceRef) => {
  const ctx = document.getElementById(chartId);
  if (!ctx) return;

  if (chartInstanceRef.value) {
    chartInstanceRef.value.destroy();
  }

  const labels = Object.keys(data).sort();
  const values = labels.map(key => data[key]);

  chartInstanceRef.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          },
          padding: 12,
          cornerRadius: 4,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#6B7280'
          }
        },
        y: {
          grid: {
            color: 'rgba(229, 231, 235, 1)'
          },
          ticks: {
            color: '#6B7280'
          },
          beginAtZero: true
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
};

const fetchAdvancedData = async () => {
  try {
    const commonFilterParams = {
      startDate: filter.value.period === 'custom' ? filter.value.startDate : null,
      endDate: filter.value.period === 'custom' ? filter.value.endDate : null,
    };

    const [
      topSongsPlaysRes,
      topSongsDownloadsRes,
      songCountGenreRes,
      newUsersTrendRes,
      newSongsTrendRes,
      totalPlaysTrendRes
    ] = await Promise.all([
      getTopSongsByPlays({ limit: filter.value.limit, ...commonFilterParams }),
      getTopSongsByDownloads({ limit: filter.value.limit, ...commonFilterParams }),
      getSongCountByGenre(commonFilterParams),
      getNewUsersTrend({ period: filter.value.period, count: 12 }),
      getNewSongsTrend({ period: filter.value.period, count: 12 }),
      getTotalPlaysTrend({ period: filter.value.period, count: 12 })
    ]);

    topSongsByPlays.value = topSongsPlaysRes.data;
    topSongsByDownloads.value = topSongsDownloadsRes.data;
    songCountByGenre.value = songCountGenreRes.data;
    newUsersTrendData.value = newUsersTrendRes.data;
    newSongsTrendData.value = newSongsTrendRes.data;
    totalPlaysTrendData.value = totalPlaysTrendRes.data;

    updateChart('newUsersChart', newUsersTrendData.value, 'New Users', ref(newUsersChartInstance));
    updateChart('newSongsChart', newSongsTrendData.value, 'New Songs', ref(newSongsChartInstance));
    updateChart('totalPlaysChart', totalPlaysTrendData.value, 'Total Plays', ref(totalPlaysChartInstance));

  } catch (error) {
    console.error('Error fetching advanced dashboard data:', error);
  }
};

const applyFilter = () => {
  fetchAdvancedData();
};

const handleExportPdf = async () => {
  try {
    const params = {
      period: filter.value.period,
      startDate: filter.value.startDate,
      endDate: filter.value.endDate,
    };
    const response = await exportDashboardPdf(params);
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MusicDashboard_${new Date().toISOString().slice(0,10)}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('Error generating PDF report.');
  }
};

const handleExportExcel = async () => {
  try {
    const params = {
      period: filter.value.period,
      startDate: filter.value.startDate,
      endDate: filter.value.endDate,
    };
    const response = await exportDashboardExcel(params);
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MusicDashboard_${new Date().toISOString().slice(0,10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    alert('Error generating Excel report.');
  }
};

onMounted(async () => {
  try {
    const [summaryRes, cloudinaryRes] = await Promise.all([
      getDashboardSummary(),
      getCloudinaryUsage()
    ]);

    summary.value = summaryRes.data;
    cloudinaryData.value = {
      bandwidth: cloudinaryRes.data.bandwidth || 0,
      limit: cloudinaryRes.data.limit || 0,
      percentUsed: cloudinaryRes.data.percentUsed || 0,
      lastUpdated: cloudinaryRes.data.lastUpdated || new Date()
    };

    await fetchAdvancedData();
  } catch (error) {
    // console.error('Error fetching initial dashboard data:', error);
  }
});

watch(filter, () => {
  if (filter.value.period !== 'custom') {
    filter.value.startDate = null;
    filter.value.endDate = null;
  }
});
</script>

<style scoped>
/* Base Styles */
.dashboard-container {
  padding: 2rem;
  max-width: 1440px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: white;
  color: #111827;
  min-height: 100vh;
}

/* Header Styles */
.dashboard-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  max-width: 100%;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dashboard-header h1 i {
  color: #6366f1;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Control Panel Styles */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1.5rem;
}

.filter-section {
  flex: 1;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  appearance: none;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
  color: #111827;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-width: 150px;
}

.select-wrapper select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.select-wrapper i {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.date-inputs {
  display: flex;
  gap: 0.75rem;
}

.date-input {
  display: flex;
  flex-direction: column;
}

.date-input label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.date-input input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.date-input input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.export-section {
  display: flex;
  gap: 0.75rem;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn i {
  font-size: 0.875rem;
}

.apply-btn {
  background-color: #6366f1;
  color: white;
}

.apply-btn:hover {
  background-color: #4f46e5;
}

.export-btn {
  background-color: white;
  border-color: #d1d5db;
  color: #374151;
}

.export-btn:hover {
  background-color: #f9fafb;
}

.export-btn.pdf:hover {
  color: #ef4444;
  border-color: #ef4444;
}

.export-btn.excel:hover {
  color: #10b981;
  border-color: #10b981;
}

.btn-icon {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-icon:hover {
  color: #6366f1;
  background-color: #f3f4f6;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  gap: 1rem;
  border: 1px solid #e5e7eb;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #111827;
}

.card-content p {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.trend-indicator {
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.trend-indicator.positive {
  background-color: #ecfdf5;
  color: #059669;
}

.trend-indicator.negative {
  background-color: #fef2f2;
  color: #dc2626;
}

.trend-indicator.neutral {
  background-color: #f3f4f6;
  color: #4b5563;
}

/* Card Specific Styles */
.album .card-icon {
  background-color: #f5f3ff;
  color: #7c3aed;
}

.artist .card-icon {
  background-color: #e0e7ff;
  color: #4f46e5;
}

.song .card-icon {
  background-color: #ffedd5;
  color: #f97316;
}

.user .card-icon {
  background-color: #fee2e2;
  color: #ef4444;
}

.download .card-icon {
  background-color: #dcfce7;
  color: #16a34a;
}

.play .card-icon {
  background-color: #e0f2fe;
  color: #0284c7;
}

.comment .card-icon {
  background-color: #fce7f3;
  color: #db2777;
}

.bandwidth .card-icon {
  background-color: #ecfdf5;
  color: #059669;
}

/* Progress Bar Styles */
.progress-container {
  margin-top: 0.75rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.progress-info span {
  font-size: 0.75rem;
  color: #6b7280;
}

.progress-bar {
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 0.25rem;
  transition: width 0.5s ease;
}

.bandwidth .progress-fill {
  background-color: #10b981;
}

/* Analytics Section */
.analytics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.chart-container {
  display: flex;
  flex-direction: column;
}

.chart-container.wide {
  grid-column: span 2;
}

.chart-card {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.chart-content {
  padding: 1.25rem 1.5rem;
  flex: 1;
}

.chart-content canvas {
  width: 100% !important;
  height: 250px !important;
}

/* Data List Styles */
.data-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.data-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.data-item:last-child {
  border-bottom: none;
}

.data-item.empty {
  justify-content: center;
  color: #9ca3af;
  font-style: italic;
  padding: 1rem 0;
}

.item-rank {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-right: 1rem;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.item-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
}

.item-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

/* Bandwidth Details */
.bandwidth-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.detail-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.375rem;
  background-color: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.detail-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.detail-content p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .analytics-section {
    grid-template-columns: 1fr;
  }
  
  .chart-container.wide {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .export-section {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 1.5rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    width: 100%;
  }
  
  .date-inputs {
    width: 100%;
  }
  
  .date-input {
    flex: 1;
  }
  
  .apply-btn {
    width: 100%;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>