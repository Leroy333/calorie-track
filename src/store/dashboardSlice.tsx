import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Meal {
  id: number;
  name: string;
  type: string; 
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  recent: boolean;
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
  recent: boolean;
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

// Р—Р°РїСЂР°С€РёРІР°РµРј РґР°РЅРЅС‹Рµ РїСЂРё Р·Р°РіСЂСѓР·РєРµ
// Р—Р°РїСЂР°С€РёРІР°РµРј РґР°РЅРЅС‹Рµ РїСЂРё Р·Р°РіСЂСѓР·РєРµ
export const fetchUserData = createAsyncThunk(
  'dashboard/fetchUserData',
  async () => {
    const response = await fetch('http://localhost:5001/api/user/stats'); // рџ‘€ РјРµРЅСЏРµРј Р·РґРµСЃСЊ
    if (!response.ok) throw new Error('РћС€РёР±РєР° СЃРµСЂРІРµСЂР°');
    return response.json();
  }
);

// Р—Р°РїСЂР°С€РёРІР°РµРј СЃРїСЂР°РІРѕС‡РЅРёРє РїСЂРѕРґСѓРєС‚РѕРІ
export const fetchProducts = createAsyncThunk(
  'dashboard/fetchProducts',
  async () => {
    const response = await fetch('http://localhost:5001/api/products');
    if (!response.ok) throw new Error('РћС€РёР±РєР° СЃРµСЂРІРµСЂР°');
    return response.json();
  }
);

// Р”РѕР±Р°РІР»РµРЅРёРµ РїСЂРёРµРјР° РїРёС‰Рё
export const addMeal = createAsyncThunk(
  'dashboard/addMeal',
  // РЈР±РµРґРёСЃСЊ, С‡С‚Рѕ Р·РґРµСЃСЊ РµСЃС‚СЊ targetDate?: string
  async (meal: { name: string; type: string; calories: number; protein: number; fat: number; carbs: number; targetDate?: string; productId?: number }, { dispatch }) => {
    const response = await fetch('http://localhost:5001/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal), // Р—РґРµСЃСЊ targetDate СѓР»РµС‚Р°РµС‚ РЅР° Р±СЌРєРµРЅРґ
    });
    if (!response.ok) throw new Error('РћС€РёР±РєР° СЃРµСЂРІРµСЂР°');
    
    // РџРµСЂРµР·Р°РїСЂР°С€РёРІР°РµРј РёСЃС‚РѕСЂРёСЋ, С‡С‚РѕР±С‹ РєР°СЂС‚РѕС‡РєР° РѕР±РЅРѕРІРёР»Р°СЃСЊ
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
        
        // 1. РРјСЏ Рё Р°РІР°С‚Р°СЂ
        state.user.name = data.name;
        state.user.avatar = data.avatar || '';

        // 2. Р”РѕСЃС‚Р°РµРј Р°РєС‚РёРІРЅСѓСЋ С†РµР»СЊ (РµСЃР»Рё РѕРЅР° РµСЃС‚СЊ)
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

        // 3. Р”РѕСЃС‚Р°РµРј СЃРІРѕРґРєСѓ Р·Р° СЃРµРіРѕРґРЅСЏ Рё СЃРїРёСЃРѕРє РµРґС‹
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
      // РћР±СЂР°Р±РѕС‚РєР° СѓСЃРїРµС€РЅРѕРіРѕ РґРѕР±Р°РІР»РµРЅРёСЏ РµРґС‹
      .addCase(addMeal.fulfilled, (state, action) => {
        const data = action.payload;
        if (data.summaries && data.summaries.length > 0) {
          const todaySummary = data.summaries[0];
          state.summary = {
            totalCalories: todaySummary.totalCalories,
            totalProtein: todaySummary.totalProtein,
            totalFat: todaySummary.totalFat,
            totalCarbs: todaySummary.totalCarbs,
            deviationCalories: todaySummary.deviationCalories || 0,
            deviationProtein: todaySummary.deviationProtein || 0,
            deviationFat: todaySummary.deviationFat || 0,
            deviationCarbs: todaySummary.deviationCarbs || 0,
          };
          state.meals = todaySummary.meals || [];
        }
      })
      .addCase(updateTargetCalories.fulfilled, (state, action) => {
        // Р‘СЌРєРµРЅРґ РІРѕР·РІСЂР°С‰Р°РµС‚ РѕР±РЅРѕРІР»РµРЅРЅСѓСЋ С†РµР»СЊ, Р±РµСЂРµРј РёР· РЅРµРµ РЅРѕРІС‹Рµ РєР°Р»РѕСЂРёРё
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
            // Р”РѕР±Р°РІРёР»Рё РЅРµРґРѕСЃС‚Р°СЋС‰РёРµ РїРѕР»СЏ РѕС‚РєР»РѕРЅРµРЅРёР№:
            deviationCalories: todaySummary.deviationCalories || 0,
            deviationProtein: todaySummary.deviationProtein || 0,
            deviationFat: todaySummary.deviationFat || 0,
            deviationCarbs: todaySummary.deviationCarbs || 0,
          };
          state.meals = todaySummary.meals;
        } else {
          // Р•СЃР»Рё РјС‹ СѓРґР°Р»РёР»Рё РїРѕСЃР»РµРґРЅСЋСЋ РµРґСѓ Р·Р° РґРµРЅСЊ, РѕР±РЅСѓР»СЏРµРј Р°Р±СЃРѕР»СЋС‚РЅРѕ РІСЃС‘
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
        // РќР°С…РѕРґРёРј РѕР±РЅРѕРІР»РµРЅРЅС‹Р№ РїСЂРѕРґСѓРєС‚ РІ СЃРїРёСЃРєРµ Рё Р·Р°РјРµРЅСЏРµРј РµРіРѕ
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

// Р‘С‹СЃС‚СЂРѕРµ РѕР±РЅРѕРІР»РµРЅРёРµ РєР°Р»РѕСЂРёР№
export const updateTargetCalories = createAsyncThunk(
  'dashboard/updateTargetCalories',
  async (calories: number) => {
    const response = await fetch('http://localhost:5001/api/goals/active/calories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calories }),
    });
    if (!response.ok) throw new Error('РћС€РёР±РєР° РїСЂРё РѕР±РЅРѕРІР»РµРЅРёРё РєР°Р»РѕСЂРёР№');
    return response.json(); 
  }
);



export const fetchHistory = createAsyncThunk(
  'dashboard/fetchHistory',
  async () => {
    const response = await fetch('http://localhost:5001/api/history');
    if (!response.ok) throw new Error('РћС€РёР±РєР° СЃРµСЂРІРµСЂР° РїСЂРё Р·Р°РіСЂСѓР·РєРµ РёСЃС‚РѕСЂРёРё');
    return response.json();
  }
);

// РџРµСЂРµРєР»СЋС‡РµРЅРёРµ С†РµР»Рё
export const switchGoal = createAsyncThunk(
  'dashboard/switchGoal',
  async (goalName: string) => {
    const response = await fetch('http://localhost:5001/api/goals/switch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalName }),
    });
    if (!response.ok) throw new Error('РћС€РёР±РєР° РїСЂРё СЃРјРµРЅРµ С†РµР»Рё');
    return response.json(); 
  }
);

// РЈРґР°Р»РµРЅРёРµ РїСЂРёРµРјР° РїРёС‰Рё
export const removeMeal = createAsyncThunk(
  'dashboard/removeMeal',
  // Р”РѕР±Р°РІРёР»Рё { dispatch } РІС‚РѕСЂС‹Рј Р°СЂРіСѓРјРµРЅС‚РѕРј
  async (mealId: number, { dispatch }) => { 
    const response = await fetch(`http://localhost:5001/api/meals/${mealId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('РћС€РёР±РєР° РїСЂРё СѓРґР°Р»РµРЅРёРё РµРґС‹');
    
    // РћР±РЅРѕРІР»СЏРµРј РљР°Р»РµРЅРґР°СЂСЊ, С‡С‚РѕР±С‹ РµРґР° СЃСЂР°Р·Сѓ РёСЃС‡РµР·Р»Р° РёР· СЃРїРёСЃРєР°!
    dispatch(fetchHistory()); 
    
    return response.json(); 
  }
);

// Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РїСЂРёРµРјР° РїРёС‰Рё (РІ РёСЃС‚РѕСЂРёРё)
export const editMealRecord = createAsyncThunk(
  'dashboard/editMealRecord',
  async (meal: any, { dispatch }) => {
    const response = await fetch(`http://localhost:5001/api/meals/${meal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal),
    });
    if (!response.ok) throw new Error('РћС€РёР±РєР° СЃРµСЂРІРµСЂР° РїСЂРё СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРё');
    
    // РџРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕРіРѕ СЃРѕС…СЂР°РЅРµРЅРёСЏ РѕР±РЅРѕРІР»СЏРµРј РІСЃРµ РґР°РЅРЅС‹Рµ РЅР° СЌРєСЂР°РЅРµ
    dispatch(fetchHistory());
    dispatch(fetchUserData());
    return response.json();
  }
);

// РћР±РЅРѕРІР»РµРЅРёРµ С„РёР·РёС‡РµСЃРєРёС… РїР°СЂР°РјРµС‚СЂРѕРІ
export const updateSettings = createAsyncThunk(
  'dashboard/updateSettings',
  async (settingsData: { age: number; height: number; weight: number; gender: string; activityLevel: number }) => {
    const response = await fetch('http://localhost:5001/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    if (!response.ok) throw new Error('РћС€РёР±РєР° РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё РЅР°СЃС‚СЂРѕРµРє');
    return response.json(); 
  }
);

// Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РїСЂРѕРґСѓРєС‚Р°
export const editProduct = createAsyncThunk(
  'dashboard/editProduct',
  async (product: any) => {
    const response = await fetch(`http://localhost:5001/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('РћС€РёР±РєР° СЃРµСЂРІРµСЂР°');
    return response.json();
  }
);

export default dashboardSlice.reducer;
