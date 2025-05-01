<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { exerciseTypeStore } from '../stores/exerciseTypeStore';

interface ExerciseTypeProps {
  id?: string | number;
  name: string;
  description: string;
  metrics: string[];
  is_public: boolean;
  created_by?: string | number;
}

const props = defineProps<{
  exerciseType?: ExerciseTypeProps;
  isEdit: boolean;
}>();

const emit = defineEmits(['saved', 'cancel']);

// Default values if no exercise type is provided
const defaultExerciseType = {
  name: '',
  description: '',
  metrics: ['duration', 'sets', 'reps'],
  is_public: true
};

// Form data with reactive state
const formData = reactive({
  name: props.exerciseType?.name || defaultExerciseType.name,
  description: props.exerciseType?.description || defaultExerciseType.description,
  metrics: [...(props.exerciseType?.metrics || defaultExerciseType.metrics)],
  is_public: props.exerciseType?.is_public ?? defaultExerciseType.is_public
});

// For managing metrics fields
const newMetric = ref('');
const errors = reactive({
  name: '',
  general: ''
});

// Add a new metric to the list
function addMetric() {
  if (newMetric.value.trim() && !formData.metrics.includes(newMetric.value.trim())) {
    formData.metrics.push(newMetric.value.trim());
    newMetric.value = '';
  }
}

// Remove a metric from the list
function removeMetric(index: number) {
  formData.metrics.splice(index, 1);
}

// Submit the form
async function submitForm() {
  // Clear previous errors
  errors.name = '';
  errors.general = '';
  
  // Validate form
  if (!formData.name.trim()) {
    errors.name = 'Name is required';
    return;
  }
  
  try {
    let result;
    
    // If editing existing exercise type
    if (props.isEdit && props.exerciseType?.id) {
      result = await exerciseTypeStore.updateExerciseType(props.exerciseType.id, formData);
    } else {
      // Creating new exercise type
      result = await exerciseTypeStore.createExerciseType(formData);
    }
    
    if (result) {
      emit('saved', result);
    } else {
      errors.general = 'Failed to save exercise type';
    }
  } catch (error: unknown) {
    console.error('Error saving exercise type:', error);
    if (error instanceof Error) {
      errors.general = error.message;
    } else {
      errors.general = 'Failed to save exercise type';
    }
  }
}

// Cancel form submission
function cancelForm() {
  emit('cancel');
}

// Load data when editing
onMounted(() => {
  if (props.isEdit && props.exerciseType) {
    formData.name = props.exerciseType.name;
    formData.description = props.exerciseType.description;
    formData.metrics = [...props.exerciseType.metrics];
    formData.is_public = props.exerciseType.is_public;
  }
});
</script>

<template>
  <div class="exercise-type-form card">
    <h2>{{ isEdit ? 'Edit Exercise Type' : 'Add New Exercise Type' }}</h2>
    
    <form @submit.prevent="submitForm">
      <!-- General error message -->
      <div v-if="errors.general" class="error-message">{{ errors.general }}</div>
      
      <!-- Name field -->
      <div class="form-group">
        <label for="name">Name *</label>
        <input 
          id="name" 
          v-model="formData.name"
          type="text" 
          placeholder="e.g. Running, Weight Training, Yoga"
          :class="{ 'error': errors.name }"
        >
        <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
      </div>
      
      <!-- Description field -->
      <div class="form-group">
        <label for="description">Description</label>
        <textarea 
          id="description"
          v-model="formData.description"
          placeholder="Describe this exercise type..."
          rows="3"
        ></textarea>
      </div>
      
      <!-- Metrics section -->
      <div class="form-section">
        <div class="section-header">
          <h3>Metrics</h3>
          <div class="metrics-input">
            <input 
              v-model="newMetric" 
              type="text" 
              placeholder="e.g. Distance, Reps"
            >
            <button 
              @click="addMetric" 
              type="button" 
              class="btn-small"
            >
              Add Metric
            </button>
          </div>
        </div>
        
        <!-- Display metrics list -->
        <div class="metrics-list">
          <div v-for="(metric, index) in formData.metrics" :key="index" class="metric-tag">
            {{ metric }}
            <button 
              @click="removeMetric(index)" 
              type="button" 
              class="btn-icon"
            >
              ×
            </button>
          </div>
        </div>
      </div>
      
      <!-- Visibility toggle -->
      <div class="form-group checkbox">
        <label>
          <input type="checkbox" v-model="formData.is_public">
          Make this exercise type public (visible to all users)
        </label>
      </div>
      
      <!-- Form actions -->
      <div class="form-actions">
        <button @click="cancelForm" type="button" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">{{ isEdit ? 'Update' : 'Create' }}</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.exercise-type-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.exercise-type-form h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  min-height: 100px;
}

.error {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 5px;
}

.form-section {
  margin-bottom: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.section-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.section-header h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.metrics-input {
  display: flex;
  gap: 10px;
}

.metrics-input input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.metrics-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.metric-tag {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
}

.form-group.checkbox label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
}

.form-group.checkbox input {
  width: auto;
  margin-right: 10px;
}

.btn-icon {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 0 5px;
  margin-left: 5px;
}

.btn-icon:hover {
  color: #ff4d4f;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-secondary {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-small {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover,
.btn-small:hover {
  opacity: 0.9;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
}
</style>
