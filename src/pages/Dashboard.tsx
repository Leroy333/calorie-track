import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData, switchGoal, fetchHistory } from '../store/dashboardSlice';
import type { AppDispatch, RootState } from '../store';
import { useState, useMemo } from 'react';
import { CalorieEditModal } from '../components/ui/CalorieEditModal';
import { MainChart } from '../components/charts/MainChart';
import { MacroDonutChart } from '../components/charts/MacroDonutChart';
import { ChevronDown, Trash2, Plus, X } from 'lucide-react';
import { MealForm } from '../components/ui/MealForm'; // Добавили Trash2
import { removeMeal } from '../store/dashboardSlice'; // Добавили removeMeal

export const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isCalorieModalOpen, setIsCalorieModalOpen] = useState(false);
  const [isMealFormOpen, setIsMealFormOpen] = useState(false);
  const [isGoalMenuOpen, setIsGoalMenuOpen] = useState(false);
  const { target, summary, meals, status, history } = useSelector((state: RootState) => state.dashboard);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  });

  // Генерируем дни недели (3 дня до, сегодня, 3 дня после)
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const fullDate = new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
      days.push({
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: i === 0,
        fullDate
      });
    }
    return days;
  }, []);

  
// Функция для сопоставления полного имени из БД с коротким списком
  const getGoalValue = (name?: string) => {
    if (!name) return 'Рекомпозиция';
    if (name.toLowerCase().includes('сушка')) return 'Сушка';
    if (name.toLowerCase().includes('набор')) return 'Набор массы';
    return 'Рекомпозиция';
  };

  useEffect(() => {
    dispatch(fetchUserData());
    dispatch(fetchHistory());
  }, [dispatch]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="p-8 w-full max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-teal-500 font-medium animate-pulse text-xl">
          Загрузка профиля...
        </div>
      </div>
    );
  }

  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const isTodaySelected = selectedDate === todayStr;

  let displaySummary = summary;
  let displayMeals = meals;

  if (!isTodaySelected) {
    const historyDay = history.find(h => h.date === selectedDate);
    if (historyDay) {
      displaySummary = historyDay;
      displayMeals = historyDay.meals || [];
    } else {
      displaySummary = { ...summary, totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 };
      displayMeals = [];
    }
  }

  // Задаем правильный порядок вывода категорий
  const categoryOrder = ['Завтрак', 'Обед', 'Ужин', 'Перекус днем', 'Перекус вечером', 'Перекус'];

  // Группируем съеденную еду по типу
  const groupedMeals = displayMeals.reduce((acc, meal) => {
    const type = meal.type || 'Перекус';
    if (!acc[type]) acc[type] = { items: [], totals: { calories: 0, protein: 0, fat: 0, carbs: 0 } };
    acc[type].items.push(meal);
    acc[type].totals.calories += meal.calories;
    acc[type].totals.protein += meal.protein;
    acc[type].totals.fat += meal.fat;
    acc[type].totals.carbs += meal.carbs;
    return acc;
  }, {} as Record<string, { items: typeof displayMeals, totals: any }>);

  // Функция для открытия/закрытия аккордеона
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto flex flex-col gap-4 md:gap-8 pb-8">
      
      {/* Шапка */}
      <header className="mb-2">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {isTodaySelected ? 'Сегодня' : new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </h1>
          {isTodaySelected && (
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            </div>
          )}
        </div>
        <div className="text-slate-400 flex flex-col sm:flex-row sm:items-center gap-2 text-sm md:text-base">
          Твоя цель: 
          
          {/* Кастомный Dropdown */}
          <div className="relative">
            {/* Кнопка-триггер */}
            <button 
              onClick={() => setIsGoalMenuOpen(!isGoalMenuOpen)}
              className="flex items-center gap-1.5 text-teal-400 font-semibold px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg cursor-pointer transition-colors outline-none w-fit"
            >
              {getGoalValue(target.name)}
              <ChevronDown size={14} className={`transition-transform duration-200 ${isGoalMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Выпадающее меню */}
            {isGoalMenuOpen && (
              <>
                {/* Невидимый слой на весь экран, чтобы закрывать меню по клику мимо него */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsGoalMenuOpen(false)}
                ></div>

                {/* Сама панель с выбором */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1E2128] border border-slate-800 rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {['Сушка', 'Рекомпозиция', 'Набор массы'].map((goal) => {
                    const isActive = getGoalValue(target.name) === goal;
                    return (
                      <button
                        key={goal}
                        onClick={() => {
                          if (!isActive) dispatch(switchGoal(goal));
                          setIsGoalMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                          isActive 
                            ? 'text-teal-400 bg-teal-500/5 font-medium' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {goal}
                        {/* Маленькая точка для индикации активного пункта */}
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Выбор дня недели */}
      <div className="flex justify-between md:justify-start gap-1.5 sm:gap-2 md:gap-4 w-full mb-2">
        {weekDays.map((day, idx) => (
          <button 
            key={idx}
            onClick={() => setSelectedDate(day.fullDate)}
            className={`flex-1 md:flex-none md:w-16 flex flex-col items-center justify-center aspect-square md:aspect-auto md:h-16 rounded-xl md:rounded-2xl transition-all ${selectedDate === day.fullDate ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-[#1E2128] text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
          >
            <span className="text-[10px] md:text-xs font-medium uppercase">{day.dayName}</span>
            <span className={`text-sm sm:text-base md:text-lg font-bold ${day.isToday ? 'text-white' : 'text-slate-200'}`}>{day.dayNumber}</span>
          </button>
        ))}
      </div>


      {/* Карточки КБЖУ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Калории */}
        <div onClick={() => setIsCalorieModalOpen(true)}
          className="bg-[#1E2128] p-4 md:p-6 rounded-2xl border border-slate-800 cursor-pointer hover:border-teal-500/50 hover:bg-slate-800/50 transition-all group relative">
          <div className="absolute top-3 right-3 text-[10px] md:text-xs font-medium text-teal-500/0 group-hover:text-teal-500/80 transition-colors">
            Изменить
          </div>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium mb-2 md:mb-4">Калории</h3>
          <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-2 mb-2">
            <span className="text-xl md:text-3xl font-bold text-white leading-none">{displaySummary.totalCalories}</span>
            <span className="text-slate-500 text-xs md:text-base md:mb-1">/ {target.calories} ккал</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 md:h-2">
            <div 
              className="bg-teal-500 h-1.5 md:h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((summary.totalCalories / target.calories) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Белки */}
        <div className="bg-[#1E2128] p-4 md:p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium mb-2 md:mb-4">Белки</h3>
          <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-2 mb-2">
            <span className="text-xl md:text-3xl font-bold text-blue-400 leading-none">{displaySummary.totalProtein}</span>
            <span className="text-slate-500 text-xs md:text-base md:mb-1">/ {target.protein} г</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 md:h-2">
            <div 
              className="bg-blue-400 h-1.5 md:h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((summary.totalProtein / target.protein) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Жиры */}
        <div className="bg-[#1E2128] p-4 md:p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium mb-2 md:mb-4">Жиры</h3>
          <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-2 mb-2">
            <span className="text-xl md:text-3xl font-bold text-yellow-400 leading-none">{displaySummary.totalFat}</span>
            <span className="text-slate-500 text-xs md:text-base md:mb-1">/ {target.fat} г</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 md:h-2">
            <div 
              className="bg-yellow-400 h-1.5 md:h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((summary.totalFat / target.fat) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Углеводы */}
        <div className="bg-[#1E2128] p-4 md:p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium mb-2 md:mb-4">Углеводы</h3>
          <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-2 mb-2">
            <span className="text-xl md:text-3xl font-bold text-purple-400 leading-none">{displaySummary.totalCarbs}</span>
            <span className="text-slate-500 text-xs md:text-base md:mb-1">/ {target.carbs} г</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 md:h-2">
            <div 
              className="bg-purple-400 h-1.5 md:h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((summary.totalCarbs / target.carbs) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Графики и Инфографика */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
        {/* Основной график (занимает 2 колонки) */}
        <div className="lg:col-span-2 bg-[#1E2128] p-6 rounded-2xl border border-slate-800">
          <MainChart />
        </div>
        {/* Донут чарт БЖУ (занимает 1 колонку) */}
        <div className="lg:col-span-1">
          <MacroDonutChart summaryData={displaySummary} />
        </div>
      </div>

      {/* Список съеденного (Сгруппированный) */}
        <div className="flex items-center justify-between mt-4">
        <h2 className="text-xl font-bold text-white">Список съеденного</h2>
        <button
          onClick={() => setIsMealFormOpen(true)}
          className="flex items-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 px-4 py-2 rounded-xl transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Добавить
        </button>
      </div>
      <div className="flex flex-col gap-4 mt-0">
          {Object.keys(groupedMeals).length === 0 ? (
            <div className="text-slate-500 text-center py-10">Ты пока ничего не добавил. Самое время перекусить!</div>
          ) : (
            // Сортируем категории в правильном порядке (Завтрак -> Обед -> Ужин)
            categoryOrder.filter(cat => groupedMeals[cat]).map(category => {
              const group = groupedMeals[category];
              const isExpanded = expandedCategories.includes(category);

              return (
                <div key={category} className="bg-[#15171C] rounded-2xl border border-slate-800 overflow-hidden transition-all">
                  
                  {/* Заголовок категории (Кликабельный) */}
                  <div 
                    onClick={() => toggleCategory(category)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown 
                        size={20} 
                        className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-teal-400' : ''}`} 
                      />
                      <h3 className="text-white font-bold text-lg">{category}</h3>
                    </div>
                    
                    {/* Сумма КБЖУ за этот прием пищи */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="hidden md:flex gap-4 text-slate-400 font-medium">
                        <span className="text-blue-400/80">Б: {Math.round(group.totals.protein)}г</span>
                        <span className="text-yellow-400/80">Ж: {Math.round(group.totals.fat)}г</span>
                        <span className="text-purple-400/80">У: {Math.round(group.totals.carbs)}г</span>
                      </div>
                      <div className="text-teal-400 font-bold text-xl">
                        {Math.round(group.totals.calories)} <span className="text-sm font-normal text-slate-500">ккал</span>
                      </div>
                    </div>
                  </div>

                  {/* Раскрывающийся список продуктов */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/50 p-2 flex flex-col gap-1 bg-[#1E2128]/20 animate-in fade-in slide-in-from-top-2 duration-200">
                      {group.items.map(meal => (
                        <div key={meal.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1E2128] transition-colors group/item">
                          <div>
                            <h4 className="text-slate-200 font-medium text-sm">{meal.name}</h4>
                            <div className="flex gap-3 text-xs mt-1">
                              <span className="text-slate-500">Б: {Math.round(meal.protein)}г</span>
                              <span className="text-slate-500">Ж: {Math.round(meal.fat)}г</span>
                              <span className="text-slate-500">У: {Math.round(meal.carbs)}г</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-white font-medium">{Math.round(meal.calories)} <span className="text-xs text-slate-500">ккал</span></span>
                            
                            {/* Кнопка удаления */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Чтобы клик по корзине не закрывал аккордеон
                                dispatch(removeMeal(meal.id));
                              }}
                              className="text-slate-600 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all p-1"
                              title="Удалить"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      {/* Модальное окно редактирования калорий */}
      {isMealFormOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsMealFormOpen(false)}
        >
          <div 
            className="relative w-full max-w-md animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsMealFormOpen(false)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <MealForm onClose={() => setIsMealFormOpen(false)} targetDate={selectedDate} />
          </div>
        </div>
      )}

      {isCalorieModalOpen && (
        <CalorieEditModal onClose={() => setIsCalorieModalOpen(false)} />
      )}   
    </div>
  );
};