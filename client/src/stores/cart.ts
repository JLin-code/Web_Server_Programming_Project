import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([]);
  const isOpen = ref(false);
  
  // Getters
  const count = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });
  
  const isEmpty = computed(() => count.value === 0);
  
  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });
  
  const formattedTotal = computed(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(total.value);
  });
  
  // Actions
  function addItem(item: Omit<CartItem, 'quantity'>) {
    const existingItem = items.value.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      items.value.push({
        ...item,
        quantity: 1
      });
    }
    
    // Save to localStorage
    saveCart();
  }
  
  function updateQuantity(itemId: string, quantity: number) {
    const item = items.value.find(i => i.id === itemId);
    
    if (item) {
      if (quantity <= 0) {
        removeItem(itemId);
      } else {
        item.quantity = quantity;
        saveCart();
      }
    }
  }
  
  function removeItem(itemId: string) {
    items.value = items.value.filter(i => i.id !== itemId);
    saveCart();
  }
  
  function clearCart() {
    items.value = [];
    saveCart();
  }
  
  function openCart() {
    isOpen.value = true;
  }
  
  function closeCart() {
    isOpen.value = false;
  }
  
  function toggleCart() {
    isOpen.value = !isOpen.value;
  }
  
  function loadCart() {
    const savedCart = localStorage.getItem('cart');
    
    if (savedCart) {
      try {
        items.value = JSON.parse(savedCart);
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
  }
  
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(items.value));
  }
  
  // Initialize cart from localStorage on store creation
  loadCart();
  
  return {
    // State
    items,
    isOpen,
    
    // Getters
    count,
    isEmpty,
    total,
    formattedTotal,
    
    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    loadCart,
    saveCart
  };
});
