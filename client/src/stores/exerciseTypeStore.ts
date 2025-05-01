import { ref } from 'vue';
import { exerciseTypesService } from '../services/api';

interface ExerciseType {
  id: string | number;
  name: string;
  description: string;
  metrics: string[];
  is_public: boolean;
  created_by?: string | number;
  created_at: string;
  updated_at?: string;
}

// Create reactive state
const exerciseTypes = ref<ExerciseType[]>([]);
const loading = ref(true);
const error = ref('');

// Get all exercise types
const getAllExerciseTypes = async () => {
  loading.value = true;
  try {
    const response = await exerciseTypesService.getAll();
    exerciseTypes.value = response.items || [];
  } catch (err) {
    console.error('Failed to load exercise types:', err);
    error.value = 'Failed to load exercise types';
    exerciseTypes.value = [];
  } finally {
    loading.value = false;
  }
};

// Get popular exercise types
const getPopularExerciseTypes = async (limit = 5) => {
  loading.value = true;
  try {
    const response = await exerciseTypesService.getPopular(limit);
    return response.items || [];
  } catch (err) {
    console.error('Failed to load popular exercise types:', err);
    error.value = 'Failed to load popular exercise types';
    return [];
  } finally {
    loading.value = false;
  }
};

// Create a new exercise type
const createExerciseType = async (data: Partial<ExerciseType>) => {
  try {
    const response = await exerciseTypesService.create(data);
    if (response.item) {
      exerciseTypes.value.push(response.item);
      return response.item;
    }
    return null;
  } catch (err) {
    console.error('Failed to create exercise type:', err);
    error.value = 'Failed to create exercise type';
    return null;
  }
};

// Update an exercise type
const updateExerciseType = async (id: string | number, data: Partial<ExerciseType>) => {
  try {
    const response = await exerciseTypesService.update(id, data);
    if (response.item) {
      const index = exerciseTypes.value.findIndex(t => t.id === id);
      if (index !== -1) {
        exerciseTypes.value[index] = response.item;
      }
      return response.item;
    }
    return null;
  } catch (err) {
    console.error('Failed to update exercise type:', err);
    error.value = 'Failed to update exercise type';
    return null;
  }
};

// Delete an exercise type
const deleteExerciseType = async (id: string | number) => {
  try {
    await exerciseTypesService.delete(id);
    exerciseTypes.value = exerciseTypes.value.filter(t => t.id !== id);
    return true;
  } catch (err) {
    console.error('Failed to delete exercise type:', err);
    error.value = 'Failed to delete exercise type';
    return false;
  }
};

// Export the store
export const exerciseTypeStore = {
  exerciseTypes,
  loading,
  error,
  getAllExerciseTypes,
  getPopularExerciseTypes,
  createExerciseType,
  updateExerciseType,
  deleteExerciseType
};
