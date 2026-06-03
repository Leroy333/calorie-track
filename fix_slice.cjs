const fs = require('fs');
const path = 'c:/Users/АРМ-1/Desktop/calorie-track-main/src/store/dashboardSlice.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `      // Обработка успешного добавления еды
      .addCase(addMeal.fulfilled, (state, action) => {
        const updatedSummary = action.payload;
        // Бэкенд возвращает обновленную сводку (summary) вместе с новым массивом meals
        state.summary.totalCalories = updatedSummary.totalCalories;
        state.summary.totalProtein = updatedSummary.totalProtein;
        state.summary.totalFat = updatedSummary.totalFat;
        state.summary.totalCarbs = updatedSummary.totalCarbs;
        state.meals = updatedSummary.meals || [];
      })`;

const replaceStr = `      // Обработка успешного добавления еды
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
      })`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Success!');
} else {
    console.log('Target string not found');
}
