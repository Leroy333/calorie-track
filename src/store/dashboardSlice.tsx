import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Асинхронный экшен для получения данных с бэкенда
export const fetchUserData = createAsyncThunk(
  'dashboard/fetchUserData',
  async () => {
    const response = await fetch('http://localhost:5001/api/user/stats');
    if (!response.ok) throw new Error('Ошибка сервера');
    return response.json();
  }
);

interface DashboardState {
  user: { name: string; avatar: string };
  stats: {
    consumedCalories: number;
    targetCalories: number;
    protein: number;
    fat: number;
    carbs: number;
    waterCurrent: number;
    waterTarget: number;
    steps: number;
    sleepMinutes: number;
  };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: DashboardState = {
  user: { name: '', avatar: '' },
  stats: {
    consumedCalories: 0,
    targetCalories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    waterCurrent: 0,
    waterTarget: 0,
    steps: 0,
    sleepMinutes: 0,
  },
  status: 'idle',
};


export const addMeal = createAsyncThunk(
  'dashboard/addMeal',
  async (mealData: { name: string; calories: number; protein: number; fat: number; carbs: number }) => {
    const response = await fetch('http://localhost:5001/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealData),
    });
    if (!response.ok) throw new Error('Ошибка при добавлении еды');
    return response.json(); // Бэкенд возвращает обновленный объект stats
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addWater: (state) => {
      if (state.stats.waterCurrent < state.stats.waterTarget) {
        state.stats.waterCurrent += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addMeal.fulfilled, (state, action) => {
        // Как только бэкенд ответил успехом, обновляем локальный стейт новыми цифрами
        state.stats = action.payload;})
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Раскладываем данные из Prisma по полочкам
        state.user.name = action.payload.name;
        state.user.avatar = action.payload.avatar;
        state.stats = action.payload.stats;
      })
      .addCase(fetchUserData.rejected, (state) => {
        state.status = 'failed';
      })
      ;
  },
});


export const { addWater } = dashboardSlice.actions;
export default dashboardSlice.reducer;