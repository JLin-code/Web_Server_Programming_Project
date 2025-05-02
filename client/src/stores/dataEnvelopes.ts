import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';

interface DataEnvelope<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
  lastUpdated: number | null;
}

type EnvelopeMap = Record<string, DataEnvelope<unknown>>;

export const useDataEnvelopesStore = defineStore('dataEnvelopes', () => {
  // State
  const envelopes = reactive<EnvelopeMap>({});
  const globalLoading = ref(false);
  const loadingRequests = ref(0);
  
  // Getters
  const isAnyLoading = computed(() => {
    return Object.values(envelopes).some(env => env.isLoading);
  });
  
  const hasAnyError = computed(() => {
    return Object.values(envelopes).some(env => !!env.error);
  });
  
  const errorMessages = computed(() => {
    return Object.entries(envelopes)
      .filter(([, env]) => !!env.error)
      .map(([key, env]) => ({
        key,
        error: env.error
      }));
  });
  
  // Actions
  function createEnvelope<T>(key: string, initialData: T | null = null) {
    if (!envelopes[key]) {
      envelopes[key] = {
        isLoading: false,
        error: null,
        data: initialData,
        lastUpdated: initialData ? Date.now() : null
      };
    }
    return envelopes[key] as DataEnvelope<T>;
  }
  
  function getEnvelope<T>(key: string): DataEnvelope<T> {
    // Create envelope if it doesn't exist
    if (!envelopes[key]) {
      createEnvelope<T>(key);
    }
    return envelopes[key] as DataEnvelope<T>;
  }
  
  function setLoading(key: string, isLoading: boolean) {
    const envelope = getEnvelope(key);
    envelope.isLoading = isLoading;
    
    // Track global loading state
    if (isLoading) {
      loadingRequests.value++;
      globalLoading.value = true;
    } else {
      loadingRequests.value = Math.max(0, loadingRequests.value - 1);
      if (loadingRequests.value === 0) {
        globalLoading.value = false;
      }
    }
  }
  
  function setData<T>(key: string, data: T) {
    const envelope = getEnvelope<T>(key);
    envelope.data = data;
    envelope.error = null;
    envelope.lastUpdated = Date.now();
    setLoading(key, false);
  }
  
  function setError(key: string, error: string) {
    const envelope = getEnvelope(key);
    envelope.error = error;
    setLoading(key, false);
  }
  
  function clearEnvelope(key: string) {
    delete envelopes[key];
  }
  
  function clearAllEnvelopes() {
    Object.keys(envelopes).forEach(key => {
      delete envelopes[key];
    });
    loadingRequests.value = 0;
    globalLoading.value = false;
  }
  
  async function withLoading<T>(key: string, asyncFn: () => Promise<T>) {
    setLoading(key, true);
    
    try {
      const result = await asyncFn();
      setData(key, result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(key, errorMessage);
      throw error;
    }
  }

  return {
    // State
    envelopes,
    globalLoading,
    loadingRequests,
    
    // Getters
    isAnyLoading,
    hasAnyError,
    errorMessages,
    
    // Actions
    createEnvelope,
    getEnvelope,
    setLoading,
    setData,
    setError,
    clearEnvelope,
    clearAllEnvelopes,
    withLoading
  };
});
