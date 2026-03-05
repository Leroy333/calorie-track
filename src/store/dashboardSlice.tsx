import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Meal {
  id: number;
  name: string;
  type: string; 
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface DashboardState {
  user: { name: string; avatar: string };
  target: { calories: number; protein: number; fat: number; carbs: number; name: string };
  summary: {
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    deviationCalories: number;
    deviationProtein: number;
    deviationFat: number;
    deviationCarbs: number;
  };
  products: Product[];
  meals: Meal[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  history: any[];
}

const initialState: DashboardState = {
  user: { name: '', avatar: '' },
  target: { calories: 0, protein: 0, fat: 0, carbs: 0, name: '' },
  summary: {
    totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0,
    deviationCalories: 0, deviationProtein: 0, deviationFat: 0, deviationCarbs: 0
  },
  products: [],
  meals: [],
  status: 'idle',
  history: []
};

// Запрашиваем данные при загрузке
// Запрашиваем данные при загрузке
export const fetchUserData = createAsyncThunk(
  'dashboard/fetchUserData',
  async () => {
    const response = await fetch('http://localhost:5001/api/user/stats'); // 👈 меняем здесь
    if (!response.ok) throw new Error('Ошибка сервера');
    return response.json();
  }
);

// Запрашиваем справочник продуктов
export const fetchProducts = createAsyncThunk(
  'dashboard/fetchProducts',
  async () => {
    const response = await fetch('http://localhost:5001/api/products');
    if (!response.ok) throw new Error('Ошибка сервера');
    return response.json();
  }
);

// Добавление приема пищи
export const addMeal = createAsyncThunk(
  'dashboard/addMeal',
  // Убедись, что здесь есть targetDate?: string
  async (meal: { name: string; type: string; calories: number; protein: number; fat: number; carbs: number; targetDate?: string }, { dispatch }) => {
    const response = await fetch('http://localhost:5001/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal), // Здесь targetDate улетает на бэкенд
    });
    if (!response.ok) throw new Error('Ошибка сервера');
    
    // Перезапрашиваем историю, чтобы карточка обновилась
    dispatch(fetchHistory());
    
    return response.json();
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        const data = action.payload;
        if (data.goals && data.goals.length > 0) {
          const activeGoal = data.goals[0];
          state.target = {
            name: activeGoal.name,
            calories: activeGoal.targetCalories,
            protein: activeGoal.targetProtein,
            fat: activeGoal.targetFat,
            carbs: activeGoal.targetCarbs,
          };
        }
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const data = action.payload;
        
        // 1. Имя и аватар
        state.user.name = data.name;
        state.user.avatar = data.avatar || '';

        // 2. Достаем активную цель (если она есть)
        if (data.goals && data.goals.length > 0) {
          const activeGoal = data.goals[0];
          state.target = {
            name: activeGoal.name,
            calories: activeGoal.targetCalories,
            protein: activeGoal.targetProtein,
            fat: activeGoal.targetFat,
            carbs: activeGoal.targetCarbs,
          };
        }

        // 3. Достаем сводку за сегодня и список еды
        if (data.summaries && data.summaries.length > 0) {
          const todaySummary = data.summaries[0];
          state.summary = {
            totalCalories: todaySummary.totalCalories,
            totalProtein: todaySummary.totalProtein,
            totalFat: todaySummary.totalFat,
            totalCarbs: todaySummary.totalCarbs,
            deviationCalories: todaySummary.deviationCalories,
            deviationProtein: todaySummary.deviationProtein,
            deviationFat: todaySummary.deviationFat,
            deviationCarbs: todaySummary.deviationCarbs,
          };
          state.meals = todaySummary.meals || [];
        }
      })
      .addCase(fetchUserData.rejected, (state) => {
        state.status = 'failed';
      })
      // Обработка успешного добавления еды
      .addCase(addMeal.fulfilled, (state, action) => {
        const updatedSummary = action.payload;
        // Бэкенд возвращает обновленную сводку (summary) вместе с новым массивом meals
        state.summary.totalCalories = updatedSummary.totalCalories;
        state.summary.totalProtein = updatedSummary.totalProtein;
        state.summary.totalFat = updatedSummary.totalFat;
        state.summary.totalCarbs = updatedSummary.totalCarbs;
        state.meals = updatedSummary.meals || [];
      })
      .addCase(updateTargetCalories.fulfilled, (state, action) => {
        // Бэкенд возвращает обновленную цель, берем из нее новые калории
        state.target.calories = action.payload.targetCalories;
      })
      .addCase(switchGoal.fulfilled, (state, action) => {
        const data = action.payload;
        if (data.goals && data.goals.length > 0) {
          const activeGoal = data.goals[0];
          state.target = {
            name: activeGoal.name,
            calories: activeGoal.targetCalories,
            protein: activeGoal.targetProtein,
            fat: activeGoal.targetFat,
            carbs: activeGoal.targetCarbs,
          };
        }
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      }).addCase(removeMeal.fulfilled, (state, action) => {
        const data = action.payload;
        if (data.summaries && data.summaries.length > 0) {
          const todaySummary = data.summaries[0];
          state.summary = {
            totalCalories: todaySummary.totalCalories,
            totalProtein: todaySummary.totalProtein,
            totalFat: todaySummary.totalFat,
            totalCarbs: todaySummary.totalCarbs,
            // Добавили недостающие поля отклонений:
            deviationCalories: todaySummary.deviationCalories || 0,
            deviationProtein: todaySummary.deviationProtein || 0,
            deviationFat: todaySummary.deviationFat || 0,
            deviationCarbs: todaySummary.deviationCarbs || 0,
          };
          state.meals = todaySummary.meals;
        } else {
          // Если мы удалили последнюю еду за день, обнуляем абсолютно всё
          state.summary = { 
            totalCalories: 0, 
            totalProtein: 0, 
            totalFat: 0, 
            totalCarbs: 0,
            deviationCalories: 0,
            deviationProtein: 0,
            deviationFat: 0,
            deviationCarbs: 0
          };
          state.meals = [];
        }
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        // Находим обновленный продукт в списке и заменяем его
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      
  },
});

// Быстрое обновление калорий
export const updateTargetCalories = createAsyncThunk(
  'dashboard/updateTargetCalories',
  async (calories: number) => {
    const response = await fetch('http://localhost:5001/api/goals/active/calories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calories }),
    });
    if (!response.ok) throw new Error('Ошибка при обновлении калорий');
    return response.json(); 
  }
);



export const fetchHistory = createAsyncThunk(
  'dashboard/fetchHistory',
  async () => {
    const response = await fetch('http://localhost:5001/api/history');
    if (!response.ok) throw new Error('Ошибка сервера при загрузке истории');
    return response.json();
  }
);

// Переключение цели
export const switchGoal = createAsyncThunk(
  'dashboard/switchGoal',
  async (goalName: string) => {
    const response = await fetch('http://localhost:5001/api/goals/switch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalName }),
    });
    if (!response.ok) throw new Error('Ошибка при смене цели');
    return response.json(); 
  }
);

// Удаление приема пищи
export const removeMeal = createAsyncThunk(
  'dashboard/removeMeal',
  // Добавили { dispatch } вторым аргументом
  async (mealId: number, { dispatch }) => { 
    const response = await fetch(`http://localhost:5001/api/meals/${mealId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Ошибка при удалении еды');
    
    // Обновляем Календарь, чтобы еда сразу исчезла из списка!
    dispatch(fetchHistory()); 
    
    return response.json(); 
  }
);

// Редактирование приема пищи (в истории)
export const editMealRecord = createAsyncThunk(
  'dashboard/editMealRecord',
  async (meal: any, { dispatch }) => {
    const response = await fetch(`http://localhost:5001/api/meals/${meal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal),
    });
    if (!response.ok) throw new Error('Ошибка сервера при редактировании');
    
    // После успешного сохранения обновляем все данные на экране
    dispatch(fetchHistory());
    dispatch(fetchUserData());
    return response.json();
  }
);

// Обновление физических параметров
export const updateSettings = createAsyncThunk(
  'dashboard/updateSettings',
  async (settingsData: { age: number; height: number; weight: number; gender: string; activityLevel: number }) => {
    const response = await fetch('http://localhost:5001/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    if (!response.ok) throw new Error('Ошибка при сохранении настроек');
    return response.json(); 
  }
);

// Редактирование продукта
export const editProduct = createAsyncThunk(
  'dashboard/editProduct',
  async (product: any) => {
    const response = await fetch(`http://localhost:5001/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Ошибка сервера');
    return response.json();
  }
);

export default dashboardSlice.reducer;