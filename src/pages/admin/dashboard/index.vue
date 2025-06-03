<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <h1><i class="fas fa-headphones-alt me-2"></i> Music Dashboard</h1>
      <p class="text-muted">Thống kê hệ thống</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <!-- Album Card -->
      <div class="stat-card album-card">
        <div class="stat-icon">
          <i class="fas fa-compact-disc"></i>
        </div>
        <div class="stat-content">
          <h3>{{ dashboard.albums || 0 }}</h3>
          <p>Albums</p>
        </div>
      </div>

      <!-- Artist Card -->
      <div class="stat-card artist-card">
        <div class="stat-icon">
          <i class="fas fa-user-music"></i>
        </div>
        <div class="stat-content">
          <h3>{{ dashboard.artists || 0 }}</h3>
          <p>Nghệ sĩ</p>
        </div>
      </div>

      <!-- Song Card -->
      <div class="stat-card song-card">
        <div class="stat-icon">
          <i class="fas fa-music"></i>
        </div>
        <div class="stat-content">
          <h3>{{ dashboard.songs || 0 }}</h3>
          <p>Bài hát</p>
        </div>
      </div>

      <!-- Bandwidth Card -->
      <div class="stat-card bandwidth-card">
        <div class="stat-icon">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatBandwidth(cloudinaryData.bandwidth) }}</h3>
          <p>Băng thông Cloudinary</p>
          <div class="progress-container">
            <div class="progress">
              <div class="progress-bar" 
                   :style="{ width: cloudinaryData.percentUsed + '%' }"></div>
            </div>
            <span>{{ cloudinaryData.percentUsed.toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bandwidth Details -->
    <div class="bandwidth-details">
      <div class="detail-card">
        <i class="fas fa-upload"></i>
        <div>
          <h4>{{ formatBandwidth(cloudinaryData.bandwidth) }}</h4>
          <p>Đã sử dụng</p>
        </div>
      </div>
      <div class="detail-card">
        <i class="fas fa-tachometer-alt"></i>
        <div>
          <h4>{{ cloudinaryData.limit > 0 ? formatBandwidth(cloudinaryData.limit) : 'Không giới hạn' }}</h4>
          <p>Giới hạn</p>
        </div>
      </div>
      <div class="detail-card">
        <i class="far fa-clock"></i>
        <div>
          <h4>{{ formatDate(cloudinaryData.lastUpdated) }}</h4>
          <p>Cập nhật cuối</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDashboard, getCloudinaryUsage } from '@/services/dashboardService';

const dashboard = ref({});
const cloudinaryData = ref({
  bandwidth: 0,
  limit: 0,
  percentUsed: 0,
  lastUpdated: new Date()
});

const formatBandwidth = (value) => {
  if (!value) return '0 MB';
  if (value < 1024) return `${value.toFixed(2)} MB`;
  return `${(value / 1024).toFixed(2)} GB`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN') + ' ' + date.toLocaleDateString('vi-VN');
};

onMounted(async () => {
  try {
    const [dashboardRes, cloudinaryRes] = await Promise.all([
      getDashboard(),
      getCloudinaryUsage()
    ]);
    
    dashboard.value = dashboardRes.data;
    cloudinaryData.value = {
      bandwidth: cloudinaryRes.data.bandwidth || 0,
      limit: cloudinaryRes.data.limit || 0,
      percentUsed: cloudinaryRes.data.percentUsed || 0,
      lastUpdated: cloudinaryRes.data.lastUpdated || new Date()
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: white;
  color: #333;
  min-height: 100vh;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.dashboard-header .text-muted {
  font-size: 1.1rem;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 1.5rem;
}

.stat-content h3 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  color: #333;
}

.stat-content p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

/* Card specific colors */
.album-card {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border-color: #ce93d8;
}

.album-card .stat-icon {
  color: #8a63d2;
}

.artist-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #90caf9;
}

.artist-card .stat-icon {
  color: #42a5f5;
}

.song-card {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
  border-color: #ffab40;
}

.song-card .stat-icon {
  color: #ff7043;
}

.bandwidth-card {
  background: linear-gradient(135deg, #e0f2f1 0%, #80cbc4 100%);
  border-color: #4db6ac;
}

.bandwidth-card .stat-icon {
  color: #1de9b6;
}

/* Progress bar */
.progress-container {
  width: 100%;
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
}

.progress {
  height: 6px;
  width: 100%;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-right: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: #1de9b6;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-container span {
  font-size: 0.9rem;
  color: #666;
  min-width: 40px;
}

/* Bandwidth details */
.bandwidth-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
}

.detail-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.2rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.detail-card i {
  font-size: 1.8rem;
  margin-right: 1rem;
  color: #1de9b6;
}

.detail-card h4 {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
  color: #333;
}

.detail-card p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0;
}
</style>