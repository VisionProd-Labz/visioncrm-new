<template>
  <div class="consent-manager">
    <!-- Banner de consentement -->
    <ConsentBanner
      v-if="showBanner"
      :consent-status="consentStatus"
      @accept-all="handleAcceptAll"
      @reject-all="handleRejectAll"
      @customize="showCustomization = true"
      @close="showBanner = false"
    />

    <!-- Modal de personnalisation -->
    <ConsentModal
      v-if="showCustomization"
      :consent-categories="consentCategories"
      :current-consent="currentConsent"
      @save="handleSaveConsent"
      @close="showCustomization = false"
    />

    <!-- Centre de préférences -->
    <ConsentPreferences
      v-if="showPreferences"
      :consent-history="consentHistory"
      :current-consent="currentConsent"
      @update="handleUpdateConsent"
      @export="handleExportData"
      @delete="handleDeleteData"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useConsentStore } from '../stores/consentStore'
import ConsentBanner from './ConsentBanner.vue'
import ConsentModal from './ConsentModal.vue'
import ConsentPreferences from './ConsentPreferences.vue'

export default {
  name: 'ConsentManager',
  components: {
    ConsentBanner,
    ConsentModal,
    ConsentPreferences
  },
  setup() {
    const consentStore = useConsentStore()
    
    const showBanner = ref(false)
    const showCustomization = ref(false)
    const showPreferences = ref(false)
    
    const consentStatus = computed(() => consentStore.consentStatus)
    const consentCategories = computed(() => consentStore.categories)
    const currentConsent = computed(() => consentStore.currentConsent)
    const consentHistory = computed(() => consentStore.history)

    const checkConsentStatus = async () => {
      await consentStore.loadConsent()
      if (!consentStore.hasValidConsent) {
        showBanner.value = true
      }
    }

    const handleAcceptAll = async () => {
      await consentStore.acceptAll()
      showBanner.value = false
    }

    const handleRejectAll = async () => {
      await consentStore.rejectAll()
      showBanner.value = false
    }

    const handleSaveConsent = async (consentData) => {
      await consentStore.saveConsent(consentData)
      showCustomization.value = false
      showBanner.value = false
    }

    const handleUpdateConsent = async (consentData) => {
      await consentStore.updateConsent(consentData)
    }

    const handleExportData = () => {
      consentStore.exportUserData()
    }

    const handleDeleteData = async () => {
      await consentStore.requestDataDeletion()
    }

    onMounted(() => {
      checkConsentStatus()
    })

    return {
      showBanner,
      showCustomization,
      showPreferences,
      consentStatus,
      consentCategories,
      currentConsent,
      consentHistory,
      handleAcceptAll,
      handleRejectAll,
      handleSaveConsent,
      handleUpdateConsent,
      handleExportData,
      handleDeleteData
    }
  }
}
</script>

<style scoped>
.consent-manager {
  position: relative;
  z-index: 1000;
}
</style>
