<template>
  <a-modal 
    :open="modelValue"
    :footer="null"
    width="900px"
    centered
    class="help-modal"
    :getContainer="false"
    :forceRender="true"
    @cancel="handleCancel"
  >
    <div class="help-modal-header">
      <div class="header-content">
        <h2>🎵 Hướng dẫn TMusicStreaming</h2>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${((currentSlide + 1) / steps.length) * 100}%` }"></div>
        </div>
        <div class="step-counter">
          {{ currentSlide + 1 }} / {{ steps.length }}
        </div>
      </div>
    </div>
    
    <div class="help-modal-content" v-if="modelValue">
      <div v-for="(step, index) in visibleSteps" :key="index" 
           v-show="currentSlide === index"
           class="slide">
        
        <!-- Header Section -->
        <div class="slide-header">
          <div class="category-badge">{{ step.category }}</div>
          <h3 class="slide-title">{{ step.title }}</h3>
        </div>

        <!-- Content Section -->
        <div class="slide-content">
          <div class="content-left">
            <div class="description-section">
              <p class="slide-description">{{ step.description }}</p>
            </div>

            <!-- Features List -->
            <div v-if="step.features" class="features-section">
              <h4>✨ Tính năng chính:</h4>
              <ul class="features-list">
                <li v-for="feature in step.features" :key="feature">{{ feature }}</li>
              </ul>
            </div>

            <!-- How To Section -->
            <div v-if="step.howTo" class="howto-section">
              <h4>📋 Cách sử dụng:</h4>
              <ol class="howto-list">
                <li v-for="instruction in step.howTo" :key="instruction">{{ instruction }}</li>
              </ol>
            </div>

            <!-- Controls Section -->
            <div v-if="step.controls" class="controls-section">
              <h4>⌨️ Phím tắt:</h4>
              <div class="controls-grid">
                <div v-for="(action, key) in step.controls" :key="key" class="control-item">
                  <kbd class="key">{{ key }}</kbd>
                  <span class="action">{{ action }}</span>
                </div>
              </div>
            </div>

            <!-- Management Section -->
            <div v-if="step.management" class="management-section">
              <h4>🔧 Quản lý:</h4>
              <ul class="management-list">
                <li v-for="item in step.management" :key="item">{{ item }}</li>
              </ul>
            </div>

            <!-- Sharing Section -->
            <div v-if="step.sharing" class="sharing-section">
              <h4>🔗 Chia sẻ:</h4>
              <ul class="sharing-list">
                <li v-for="item in step.sharing" :key="item">{{ item }}</li>
              </ul>
            </div>

            <!-- Mobile Features -->
            <div v-if="step.mobileFeatures" class="mobile-section">
              <h4>📱 Tính năng mobile:</h4>
              <ul class="mobile-list">
                <li v-for="feature in step.mobileFeatures" :key="feature">{{ feature }}</li>
              </ul>
            </div>

            <!-- Architecture Section -->
            <div v-if="step.architecture" class="architecture-section">
              <h4>🏗️ Công nghệ sử dụng:</h4>
              <div class="tech-grid">
                <div v-for="(tech, key) in step.architecture" :key="key" class="tech-item">
                  <span class="tech-label">{{ key }}:</span>
                  <span class="tech-value">{{ tech }}</span>
                </div>
              </div>
            </div>

            <!-- Policy Section -->
            <div v-if="step.purpose" class="policy-section">
              <div class="purpose-badge">🎯 {{ step.purpose }}</div>
              <div v-if="step.restrictions" class="restrictions">
                <h4>📜 Quy định sử dụng:</h4>
                <ul class="restrictions-list">
                  <li v-for="restriction in step.restrictions" :key="restriction" 
                      :class="{ 'forbidden': restriction.includes('🚫'), 'allowed': restriction.includes('✅') }">
                    {{ restriction }}
                  </li>
                </ul>
                <div class="note">
                  <strong>{{ step.note }}</strong>
                </div>
                <div class="contact">{{ step.contact }}</div>
              </div>
            </div>

            <!-- Tip Section -->
            <div v-if="step.tip" class="tip-section">
              <div class="tip-content">{{ step.tip }}</div>
            </div>
          </div>

          <!-- Image Section -->
          <div class="content-right">
            <div class="image-container">
              <img
                :src="step.image"
                :alt="step.title"
                class="slide-image"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div class="navigation-controls">
        <a-button @click="prevSlide" :disabled="currentSlide === 0" class="nav-btn prev-btn">
          <i class="fa-solid fa-chevron-left"></i> Trước
        </a-button>
        
        <div class="dots-indicator">
          <span v-for="(step, index) in steps" :key="index" 
                class="dot" 
                :class="{ active: currentSlide === index }"
                @click="goToSlide(index)">
          </span>
        </div>
        
        <a-button @click="nextSlide" :disabled="currentSlide === steps.length - 1" class="nav-btn next-btn">
          Tiếp <i class="fa-solid fa-chevron-right"></i>
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  steps: Array
});

const emit = defineEmits(['update:modelValue', 'close']);

const currentSlide = ref(0);

const visibleSteps = computed(() => {
  if (!props.steps || props.steps.length === 0) {
    console.warn('No steps provided to HelpGuideModal');
    return [];
  }
  return props.modelValue ? props.steps : [];
});

const nextSlide = () => {
  if (currentSlide.value < props.steps.length - 1) {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

const goToSlide = (index) => {
  currentSlide.value = index;
};

const handleCancel = () => {
  currentSlide.value = 0; // Reset to first slide
  emit('update:modelValue', false);
  emit('close');
};
</script>

<style scoped>
/* Modal Header */
.help-modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  margin: -24px -24px 20px -24px;
  border-radius: 8px 8px 0 0;
}

.header-content h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.step-counter {
  text-align: center;
  font-size: 14px;
  opacity: 0.9;
}

/* Content Layout */
.help-modal-content {
  padding: 0 20px 20px;
  min-height: 600px;
  position: relative;
}

.slide {
  position: absolute;
  width: calc(100% - 40px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Slide Header */
.slide-header {
  margin-bottom: 25px;
}

.category-badge {
  display: inline-block;
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.slide-title {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
}

/* Content Sections */
.slide-content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.content-left {
  flex: 2;
}

.content-right {
  flex: 1;
}

.slide-description {
  font-size: 16px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
  font-weight: 400;
}

/* Section Styling */
.features-section,
.howto-section,
.controls-section,
.management-section,
.sharing-section,
.mobile-section,
.architecture-section,
.policy-section {
  margin-bottom: 20px;
}

.features-section h4,
.howto-section h4,
.controls-section h4,
.management-section h4,
.sharing-section h4,
.mobile-section h4,
.architecture-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 12px;
}

/* Lists */
.features-list,
.management-list,
.sharing-list,
.mobile-list {
  margin: 0;
  padding-left: 20px;
}

.features-list li,
.management-list li,
.sharing-list li,
.mobile-list li {
  margin-bottom: 8px;
  color: #666;
  line-height: 1.5;
}

.howto-list {
  margin: 0;
  padding-left: 20px;
  counter-reset: step-counter;
}

.howto-list li {
  margin-bottom: 10px;
  color: #666;
  line-height: 1.5;
  position: relative;
}

/* Controls Grid */
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.control-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #3498db;
}

.key {
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 2px 8px;
  font-family: monospace;
  font-size: 12px;
  margin-right: 10px;
}

.action {
  color: #666;
  font-size: 14px;
}

/* Tech Grid */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

.tech-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #e74c3c;
}

.tech-label {
  font-weight: 600;
  color: #2c3e50;
}

.tech-value {
  color: #666;
  text-align: right;
}

/* Policy Section */
.purpose-badge {
  display: inline-block;
  background: linear-gradient(45deg, #27ae60, #2ecc71);
  color: white;
  padding: 8px 16px;
  border-radius: 25px;
  font-weight: 600;
  margin-bottom: 15px;
}

.restrictions-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.restrictions-list li {
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  font-weight: 500;
}

.restrictions-list li.forbidden {
  background-color: #fee;
  border-left: 4px solid #e74c3c;
  color: #c0392b;
}

.restrictions-list li.allowed {
  background-color: #efe;
  border-left: 4px solid #27ae60;
  color: #27ae60;
}

.note {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 15px;
  margin: 15px 0;
  color: #856404;
}

.contact {
  font-style: italic;
  color: #666;
  text-align: center;
  margin-top: 10px;
}

/* Image */
.image-container {
  position: sticky;
  top: 20px;
}

.slide-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Tip Section */
.tip-section {
  margin-top: 25px;
  padding: 15px;
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  border-radius: 10px;
  color: white;
}

.tip-content {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
}

/* Navigation */
.navigation-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-top: 30px;
}

.nav-btn {
  min-width: 100px;
  height: 40px;
  border-radius: 20px;
  font-weight: 500;
}

.nav-btn:disabled {
  opacity: 0.5;
}

.dots-indicator {
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background-color: #3498db;
  transform: scale(1.2);
}

.dot:hover {
  background-color: #3498db;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .slide-content {
    flex-direction: column;
  }
  
  .help-modal-content {
    min-height: 500px;
  }
  
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-grid {
    grid-template-columns: 1fr;
  }
  
  .navigation-controls {
    flex-direction: column;
    gap: 15px;
  }
}

/* Modal Override */
:deep(.ant-modal-body) {
  padding: 0;
}

:deep(.ant-modal-header) {
  display: none;
}
</style>