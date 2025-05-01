<script setup>
import { ref, onMounted } from 'vue';
import { exerciseTypesService, authService } from '../services/api';
import ExerciseTypeForm from '../components/ExerciseTypeForm.vue';

// Page state
const page = ref('Exercise Types');
const exerciseTypes = ref([]);
const loading = ref(true);
const error = ref(null);
const showAddForm = ref(false);
const editingType = ref(null);
const currentUser = ref(null);

// Fetch data on component mount
onMounted(async () => {
  try {
    // Get current user
    const userResponse = await authService.getCurrentUser();
    if (userResponse?.user) {
      currentUser.value = userResponse.user;
    }
    
    // Get exercise types
    const response = await exerciseTypesService.getAll();
    exerciseTypes.value = response.items || [];
  } catch (err) {
    error.value = 'Failed to load exercise types';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

// Add new exercise type
const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value;
  editingType.value = null;
};

// Edit exercise type
const editExerciseType = (type) => {
  editingType.value = type;
  showAddForm.value = true;
};

// Delete exercise type
const deleteExerciseType = async (id) => {
  if (!confirm('Are you sure you want to delete this exercise type?')) {
    return;
  }
  
  try {
    await exerciseTypesService.delete(id);
    exerciseTypes.value = exerciseTypes.value.filter(type => type.id !== id);
  } catch (err) {
    error.value = 'Failed to delete exercise type';
    console.error(err);
  }
};

// Handle form submission
const handleSaved = async (savedType) => {
  if (editingType.value) {
    // Update existing type in the list
    const index = exerciseTypes.value.findIndex(t => t.id === savedType.id);
    if (index !== -1) {
      exerciseTypes.value[index] = savedType;
    }
  } else {
    // Add new type to the list
    exerciseTypes.value.push(savedType);
  }
  
  // Reset form state
  showAddForm.value = false;
  editingType.value = null;
};

// Handle form cancel
const handleCancel = () => {
  showAddForm.value = false;
  editingType.value = null;
};

// Check if user can edit a specific exercise type
const canEdit = (type) => {
  if (!currentUser.value) return false;
  return currentUser.value.is_admin || type.created_by === currentUser.value.id;
};
</script>

<template>
  <main>
    <div class="header-actions">
      <h1 class="title">{{ page }}</h1>
      <button v-if="!showAddForm" @click="toggleAddForm" class="btn-primary">
        Add New Exercise Type
      </button>
    </div>
    
    <!-- Add/Edit Form -->
    <ExerciseTypeForm 
      v-if="showAddForm"
      :exercise-type="editingType"
      :is-edit="!!editingType"
      @saved="handleSaved"
      @cancel="handleCancel"
    />
    
    <!-- Content Area -->
    <div v-else class="exercise-types-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <p>Loading exercise types...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="exerciseTypes.length === 0" class="empty-state">
        <p>No exercise types found</p>
        <button @click="toggleAddForm" class="btn">Create your first exercise type</button>
      </div>
      
      <!-- Exercise Types List -->
      <div v-else class="exercise-types-list">
        <div v-for="type in exerciseTypes" :key="type.id" class="exercise-type-card">
          <!-- Delete button (for admins or creators) -->
          <button 
            v-if="canEdit(type)" 
            @click="deleteExerciseType(type.id)"
            class="delete-button"
          >
            ×
          </button>
          
          <!-- Exercise type content -->
          <div class="type-header">
            <h3>{{ type.name }}</h3>
            <span v-if="type.is_public" class="tag public">Public</span>
            <span v-else class="tag private">Private</span>
          </div>
          
          <p class="type-description">{{ type.description }}</p>
          
          <!-- Metrics -->
          <div class="type-metrics">
            <span v-for="(metric, i) in type.metrics" :key="i" class="metric-tag">
              {{ metric }}
            </span>
          </div>
          
          <!-- Actions -->
          <div class="type-actions">
            <button 
              v-if="canEdit(type)"
              @click="editExerciseType(type)" 
              class="btn-small"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  margin: 0;
}

.exercise-types-container {
  margin-top: 20px;
}

.loading, .error, .empty-state {
  padding: 40px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
}

.error {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.exercise-types-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.exercise-type-card {
  position: relative;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.exercise-type-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.delete-button:hover {
  color: #ff4d4f;
}

.type-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.type-header h3 {
  margin: 0;
  flex-grow: 1;
}

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.tag.public {
  background-color: #e6f7ff;
  color: #1890ff;
}

.tag.private {
  background-color: #fff7e6;
  color: #fa8c16;
}

.type-description {
  margin-bottom: 15px;
  color: #666;
}

.type-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.metric-tag {
  background-color: #f5f5f5;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.type-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
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

.btn-small {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover,
.btn-primary:hover,
.btn-small:hover {
  opacity: 0.9;
}
</style>
