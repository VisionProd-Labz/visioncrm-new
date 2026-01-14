<template>
  <div class="consent-banner" :class="{ 'banner-visible': visible }">
    <div class="banner-container">
      <div class="banner-content">
        <div class="banner-icon">
          <i class="fas fa-cookie-bite"></i>
        </div>
        <div class="banner-text">
          <h3>{{ $t('consent.banner.title') }}</h3>
          <p>{{ $t('consent.banner.description') }}</p>
          <a href="#" @click.prevent="showDetails = !showDetails" class="details-link">
            {{ $t('consent.banner.learnMore') }}
          </a>
        </div>
        <div class="banner-actions">
          <button 
            @click="$emit('customize')" 
            class="btn btn-outline"
            :aria-label="$t('consent.banner.customize')"
          >
            {{ $t('consent.banner.customize') }}
          </button>
          <button 
            @click="$emit('reject-all')" 
            class="btn btn-secondary"
            :aria-label="$t('consent.banner.rejectAll')"
          >
            {{ $t('consent.banner.rejectAll') }}
          </button>
          <button 
            @click="$emit('accept-all')" 
            class="btn btn-primary"
            :aria-label="$t('consent.banner.acceptAll')"
          >
            {{ $t('consent.banner.acceptAll') }}
          </button>
        </div>
        <button 
          @click="$emit('close')" 
          class="banner-close"
          :aria-label="$t('consent.banner.close')"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <transition name="slide-down">
        <div v-if="showDetails" class="banner-details">
          <div class="details-grid">
            <div class="detail-item" v-for="category in consentCategories" :key="category.id">
              <h4>{{ $t(`consent.categories.${category.name}.title`) }}</h4>
              <p>{{ $t(`consent.categories.${category.name}.description`) }}</p>
              <span class="category-required" v-if="category.required">
                {{ $t('consent.required') }}
              </span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ConsentBanner',
  props: {
    consentStatus: {
      type: Object,
      required: true
    }
  },
  emits: ['accept-all', 'reject-all', 'customize', 'close'],
  setup(props) {
    const visible = ref(false)
    const showDetails = ref(false)
    
    const consentCategories = [
      {
        id: 'necessary',
        name: 'necessary',
        required: true
      },
      {
        id: 'analytics',
        name: 'analytics',
        required: false
      },
      {
        id: 'marketing',
        name: 'marketing',
        required: false
      },
      {
        id: 'personalization',
        name: 'personalization',
        required: false
      }
    ]

    onMounted(() => {
      setTimeout(() => {
        visible.value = true
      }, 500)
    })

    return {
      visible,
      showDetails,
      consentCategories
    }
  }
}
</script>

<style scoped>
.consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1px solid #e1e5e9;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
}

.banner-visible {
  transform: translateY(0);
}

.banner-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.banner-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  position: relative;
}

.banner-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: #667eea;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.banner-text {
  flex: 1;
}

.banner-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.banner-text p {
  margin: 0 0 8px 0;
  color: #4a5568;
  line-height: 1.5;
}

.details-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
}

.details-link:hover {
  text-decoration: underline;
}

.banner-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 14px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.banner-close {
  position: absolute;
  top: -5px;
  right: -5px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
}

.banner-close:hover {
  color: #4a5568;
}

.banner-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-item h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.detail-item p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #718096;
  line-height: 1.4;
}

.category-required {
  background: #fed7d7;
  color: #c53030;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .banner-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .btn {
    flex: 1;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
