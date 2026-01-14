<template>
  <div class="consent-modal-overlay" @click.self="$emit('close')">
    <div class="consent-modal">
      <div class="modal-header">
        <h2>{{ $t('consent.modal.title') }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="consent-intro">
          <p>{{ $t('consent.modal.description') }}</p>
        </div>

        <div class="consent-categories">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-item"
          >
            <div class="category-header">
              <div class="category-info">
                <h3>{{ $t(`consent.categories.${category.name}.title`) }}</h3>
                <span v-if="category.required" class="required-badge">
                  {{ $t('consent.required') }}
                </span>
              </div>
              <div class="category-toggle">
                <label class="toggle-switch">
                  <input 
                    type="checkbox" 
                    v-model="localConsent[category.id]"
                    :disabled="category.required"
                  >
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="category-description">
              <p>{{ $t(`consent.categories.${category.name}.description`) }}</p>
              
              <div v-if="category.purposes?.length" class="category-purposes">
                <h4>{{ $t('consent.modal.purposes') }}</h4>
                <ul>
                  <li v-for="purpose in category.purposes" :key="purpose">
                    {{ $t(`consent.purposes.${purpose}`) }}
                  </li>
                </ul>
              </div>

              <div v-if="category.cookies?.length" class="category-cookies">
                <button 
                  @click="toggleCookieDetails(category.id)"
                  class="cookies-toggle"
                >
                  {{ $t('consent.modal.viewCookies') }} ({{ category.cookies.length }})
                  <i :class="showCookieDetails[category.id] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                </button>
                
                <transition name="slide-down">
                  <div v-if="showCookieDetails[category.id]" class="cookies-list">
                    <div v-for="cookie in category.cookies" :key="cookie.name" class="cookie-item">
                      <div class="cookie-info">
                        <strong>{{ cookie.name }}</strong>
                        <span class="cookie-duration">{{ $t('consent.modal.expires') }}: {{ cookie.duration }}</span>
                      </div>
                      <p>{{ cookie.description }}</p>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <div class="consent-notice">
          <div class="notice-box">
            <i class="fas fa-info-circle"></i>
            <div>
              <p>{{ $t('consent.modal.notice') }}</p>
              <p class="notice-links">
                <a href="/privacy-policy" target="_blank">{{ $t('consent.privacyPolicy') }}</a>
                <span class="separator">|</span>
                <a href="/cookie-policy" target="_blank">{{ $t('consent.cookiePolicy') }}</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-actions">
          <button @click="handleRejectAll" class="btn btn-secondary">
            {{ $t('consent.modal.rejectAll') }}
          </button>
          <button @click="handleAcceptAll" class="btn btn-outline">
            {{ $t('consent.modal.acceptAll') }}
          </button>
          <button @click="handleSaveSelection" class="btn btn-primary">
            {{ $t('consent.modal.saveSelection') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'ConsentModal',
  props: {
    consentCategories: {
      type: Array,
      required: true
    },
    currentConsent: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const showCookieDetails = reactive({})
    
    const categories = computed(() => [
      {
        id: 'necessary',
        name: 'necessary',
        required: true,
        purposes: ['essential_functionality', 'security', 'user_authentication'],
        cookies: [
          { name: 'session_id', duration: 'Session', description: 'Maintains user session' },
          { name: 'csrf_token', duration: '24 hours', description: 'Prevents CSRF attacks' }
        ]
      },
      {
        id: 'analytics',
        name: 'analytics',
        required: false,
        purposes: ['usage_analytics', 'performance_monitoring'],
        cookies: [
          { name: '_ga', duration: '2 years', description: 'Google Analytics tracking' },
          { name: '_gat', duration: '1 minute', description: 'Google Analytics throttling' }
        ]
      },
      {
        id: 'marketing',
        name: 'marketing',
        required: false,
        purposes: ['targeted_advertising', 'campaign_tracking'],
        cookies: [
          { name: 'fb_pixel', duration: '90 days', description: 'Facebook advertising pixel' },
          { name: 'linkedin_insights', duration: '90 days', description: 'LinkedIn campaign tracking' }
        ]
      },
      {
        id: 'personalization',
        name: 'personalization',
        required: false,
        purposes: ['ui_preferences', 'content_customization'],
        cookies: [
          { name: 'user_preferences', duration: '1 year', description: 'Stores user interface preferences' },
          { name: 'language', duration: '1 year', description: 'Remembers selected language' }
        ]
      }
    ])

    const localConsent = reactive({
      necessary: true,
      analytics: props.currentConsent?.analytics || false,
      marketing: props.currentConsent?.marketing || false,
      personalization: props.currentConsent?.personalization || false
    })

    const toggleCookieDetails = (categoryId) => {
      showCookieDetails[categoryId] = !showCookieDetails[categoryId]
    }

    const handleAcceptAll = () => {
      Object.keys(localConsent).forEach(key => {
        localConsent[key] = true
      })
      handleSaveSelection()
    }

    const handleRejectAll = () => {
      Object.keys(localConsent).forEach(key => {
        localConsent[key] = key === 'necessary'
      })
      handleSaveSelection()
    }

    const handleSaveSelection = () => {
      const consentData = {
        ...localConsent,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
      emit('save', consentData)
    }

    return {
      categories,
      localConsent,
      showCookieDetails,
      toggleCookieDetails,
      handleAcceptAll,
      handleRejectAll,
      handleSaveSelection
    }
  }
}
</script>

<style scoped>
.consent-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
}

.consent-modal {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #a0aec0;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.consent-intro {
  margin-bottom: 24px;
}

.consent-intro p {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.consent-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.category-info h3 {
  margin: 0 8px 0 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  display: inline;
}

.required-badge {
  background: #fed7d7;
  color: #c53030;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  border-radius: 24px;
  transition: .3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .3s;
}

input:checked + .toggle-slider {
  background-color: #667eea;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.category-description {
  padding: 20px;
}

.category-description > p {
  margin: 0 0 16px 0;
  color: #4a5568;
  line-height: 1.5;
}

.category-purposes h4,
.category-cookies h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.category-purposes ul {
  margin: 0;
  padding-left: 16px;
  color: #4a5568;
}

.category-purposes li {
  margin-bottom: 4px;
}

.cookies-toggle {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cookies-toggle:hover {
  color: #5a67d8;
}

.cookies-list {
  margin-top: 12px;
  border-left: 3px solid #e2e8f0;
  padding-left: 12px;
}

.cookie-item {
  margin-bottom: 12px;
}

.cookie-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.cookie-info strong {
  color: #2d3748;
}

.cookie-duration {
  font-size: 12px;
  color: #718096;
}

.cookie-item p {
  margin: 0;
  font-size: 13px;
  color: #4a5568;
}

.consent-notice {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.notice-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.notice-box i {
  color: #0284c7;
  margin-top: 2px;
}

.notice-box p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #0c4a6e;
  line-height: 1.4;
}

.notice-links a {
  color: #0284c7;
  text-decoration: none;
  font-weight: 500;
}

.notice-links a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 8px;
  color: #64748b;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
}

.footer-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 500px;
}

@media (max-width: 768px) {
  .consent-modal {
    margin: 10px;
    max-height: 95vh;
  }
  
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .footer-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
