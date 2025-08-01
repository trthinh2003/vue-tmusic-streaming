import { ref, nextTick } from 'vue';

export const useTour = () => {
  const tourVisible = ref(false);
  const currentStep = ref(0);
  
  const steps = ref([
    {
      title: 'Tìm kiếm bài hát',
      description: 'Bạn có thể tìm kiếm bài hát theo tên, nghệ sĩ hoặc album',
      target: () => document.querySelector('.ant-input-search'),
      placement: 'bottom'
    },
    {
      title: 'Bộ lọc nâng cao',
      description: 'Sử dụng bộ lọc để tìm kiếm chính xác hơn theo thể loại, năm phát hành...',
      target: () => document.querySelector('.advance-filter-btn'),
      placement: 'bottom'
    },
    {
      title: 'Danh sách bài hát',
      description: 'Danh sách các bài hát, bạn có thể click để phát bài hát',
      target: () => document.querySelector('.playlist'),
      placement: 'right'
    },
    {
      title: 'Quản lý danh sách playlist và yêu thích',
      description: 'Nơi giúp bạn quản lý playlist cá nhân và danh sách yêu thích của bạn',
      target: () => document.querySelector('.playlist-header .actions'),
      placement: 'right'
    },
    {
      title: 'Điều khiển phát nhạc',
      description: 'Play/pause, chuyển bài, điều chỉnh âm lượng và chế độ phát ngẫu nhiên',
      target: () => document.querySelector('.controls'),
      placement: 'top'
    },
    {
      title: 'Lời bài hát và bình luận',
      description: 'Xem lời bài hát đồng bộ và chế độ karaoke, đồng thời có thể bình luận cho bài hát đó',
      target: () => document.querySelector('.toggle-sidebar-btn'),
      placement: 'left'
    },
    {
      title: 'Chi tiết bài hát',
      description: 'Xem thông tin chi tiết và các bài hát tương tự',
      target: () => document.querySelector('.song-detail-trigger'),
      placement: 'left'
    },
    {
      title: 'Khám phá',
      description: 'Khám phá các bài hát mới và xu hướng',
      target: () => document.querySelector('.explore-header-btn') || document.querySelector('.explore-drawer-btn'),
      placement: 'bottom'
    }
  ]);

  const startTour = async () => {
    currentStep.value = 0;
    await nextTick(); // Đảm bảo DOM đã render
    tourVisible.value = true;
  };

  const nextStep = () => {
    if (currentStep.value < steps.value.length - 1) {
      currentStep.value++;
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };

  const closeTour = () => {
    tourVisible.value = false;
    currentStep.value = 0;
  };

  return {
    tourVisible,
    currentStep,
    steps,
    startTour,
    nextStep,
    prevStep,
    closeTour
  };
};