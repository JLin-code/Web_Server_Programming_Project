<script setup lang="ts">
import { ref, reactive } from 'vue';
import { activitiesService } from '../services/activitiesApi';
import { authService } from '../services/api';

// Define emits
const emit = defineEmits(['activityAdded', 'cancel']);

// Form state
const formData = reactive({
  title: '',
  description: '',
  type: 'workout', // Default type
  image: '',
  metrics: {} as Record<string, string>
});

// For handling dynamic metrics
const metricKeys = ref<string[]>(['']); // Start with one empty metric
const metricValues = ref<string[]>(['']); // Start with one empty value

// Form validation
const errors = ref({
  title: '',
  description: '',
  type: '',
  metrics: ''
});

// Activity types
const activityTypes = [
  { value: 'workout', label: 'Workout' },
  { value: 'goal', label: 'Goal' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'normal', label: 'General' }
];

// Handle adding a new metric field
const addMetricField = () => {
  metricKeys.value.push('');
  metricValues.value.push('');
};

// Handle removing a metric field
const removeMetricField = (index: number) => {
  metricKeys.value.splice(index, 1);
  metricValues.value.splice(index, 1);
};

// Submit form handler
const submitForm = async () => {
  // Reset errors
  errors.value = {
    title: '',
    description: '',
    type: '',
    metrics: ''
  };
  
  // Validate form
  let isValid = true;
  
  if (!formData.title.trim()) {
    errors.value.title = 'Title is required';
    isValid = false;
  }
  
  if (!formData.description.trim()) {
    errors.value.description = 'Description is required';
    isValid = false;
  }
  
  if (!formData.type) {
    errors.value.type = 'Activity type is required';
    isValid = false;
  }
  
  // Build metrics object from key-value pairs
  const metrics: Record<string, string> = {};
  for (let i = 0; i < metricKeys.value.length; i++) {
    const key = metricKeys.value[i].trim();
    const value = metricValues.value[i].trim();
    
    if (key && value) {
      metrics[key] = value;
    }
  }

  if (Object.keys(metrics).length === 0) {
    errors.value.metrics = 'At least one metric is required';
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  // Get current user
  try {
    const userResponse = await authService.getCurrentUser();
    if (!userResponse || !userResponse.user) {
      console.error('User not logged in');
      return;
    }
    
    const userId = userResponse.user.id;
    const imageUrl = formData.image.trim() || null;
    
    // Create activity object
    const newActivity = {
      user_id: userId,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      metrics,
      image: imageUrl
    };
    
    // Submit to API
    const response = await activitiesService.create(newActivity);
    
    // Reset form
    formData.title = '';
    formData.description = '';
    formData.type = 'workout';
    formData.image = '';
    metricKeys.value = [''];
    metricValues.value = [''];
    
    // Emit event to parent component
    emit('activityAdded', response);
  } catch (error) {
    console.error('Failed to add activity:', error);
  }
};

const cancelForm = () => {
  emit('cancel');
};
</script>

<template>
  <div class="add-activity-form card">
    <h2>Add New Activity</h2>
    
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">Title*</label>
        <input 
          id="title" 
          v-model="formData.title" 
          type="text" 
          placeholder="e.g. Morning Run"
          :class="{ 'error': errors.title }" 
        />
        <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
      </div>
      
      <div class="form-group">
        <label for="description">Description*</label>
        <textarea 
          id="description" 
          v-model="formData.description" 
          placeholder="Describe your activity..."
          :class="{ 'error': errors.description }" 
        ></textarea>
        <div v-if="errors.description" class="error-message">{{ errors.description }}</div>
      </div>
      
      <div class="form-group">
        <label for="type">Activity Type*</label>
        <select 
          id="type" 
          v-model="formData.type"
          :class="{ 'error': errors.type }"
        >
          <option v-for="option in activityTypes" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <div v-if="errors.type" class="error-message">{{ errors.type }}</div>
      </div>
      
      <div class="form-group">
        <label for="image">Image URL (optional)</label>
        <input 
          id="image" 
          v-model="formData.image" 
          type="text" 
          placeholder="https://example.com/image.jpg" 
        />
      </div>
      
      <div class="form-section">
        <div class="section-header">
          <h3>Metrics*</h3>
          <button type="button" class="btn-small" @click="addMetricField">+ Add Metric</button>
        </div>
        <div v-if="errors.metrics" class="error-message">{{ errors.metrics }}</div>
        
        <div v-for="(_, index) in metricKeys" :key="`metric-${index}`" class="metric-row">
          <div class="metric-key">
            <input 
              v-model="metricKeys[index]" 
              type="text" 
              placeholder="Metric name (e.g. Distance)" 
            />
          </div>
          <div class="metric-value">
            <input 
              v-model="metricValues[index]" 
              type="text" 
              placeholder="Value (e.g. 5km)" 
            />
          </div>
          <button 
            v-if="index > 0" 
            type="button" 
            class="btn-icon" 
            @click="removeMetricField(index)"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="cancelForm">Cancel</button>
        <button type="submit" class="btn-primary">Add Activity</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-activity-form {
  padding: 20px;
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.error {
  border-color: #ff5555;
}

.error-message {
  color: #ff5555;
  font-size: 14px;
  margin-top: 5px;
}

.form-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
}

.metric-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.metric-key, .metric-value {
  flex: 1;
}

.btn-icon {
  background: none;
  border: none;
  color: #ff5555;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  width: 24px;
  height: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-small {
  font-size: 14px;
  padding: 5px 10px;
  background-color: #eee;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
</style>
