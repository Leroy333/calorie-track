import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory, fetchUserData, removeMeal, editMealRecord, addMeal, fetchProducts } from '../store/dashboardSlice';
import type { AppDispatch, RootState } from '../store';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2, Edit2, X, Plus } from 'lucide-react';

// Helper to get local date in YYYY-MM-DD format reliably
const getLocalYYYYMMDD = (d: Date) => {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

export const Calendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useSelector((state: RootState) => state.dashboard.history);
  const target = useSelector((state: RootState) => state.dashboard.target);
  const products = useSelector((state: RootState) => state.dashboard.products);

  // Календарный стейт
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(getLocalYYYYMMDD(new Date()));

  // Стейты модального окна
  const [editingMeal, setEditingMeal] = useState<any | null>(null);
  const [addingToDate, setAddingToDate] = useState<string | null>(null);
  const [addMode, setAddMode] = useState<'db' | 'manual'>('db');
  const [formState, setFormState] = useState({ name: '', type: 'Перекус', calories: 0, protein: 0, fat: 0, carbs: 0 });
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [amount, setAmount] = useState<number | ''>('');

  const mealTypesList = ['Завтрак', 'Обед', 'Ужин', 'Перекус днем', 'Перекус вечером', 'Перекус'];
  const categoryOrder = ['Завтрак', 'Обед', 'Ужин', 'Перекус днем', 'Перекус вечером', 'Перекус'];

  useEffect(() => {
    dispatch(fetchHistory());
    dispatch(fetchUserData());
    dispatch(fetchProducts());
  }, [dispatch]);

  // --- Логика генерации сетки календаря ---
  const { blanks, days, monthName, year } = useMemo(() => {
    const y = currentMonthDate.getFullYear();
    const m = currentMonthDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    // Сдвигаем, чтобы неделя начиналась с понедельника (0 = Пн, 6 = Вс)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const blanksArr = Array(startDayOfWeek).fill(null);
    const daysArr = Array.from({ length: lastDay.getDate() }, (_, i) => {
      const d = new Date(y, m, i + 1);
      return getLocalYYYYMMDD(d);
    });

    const monthStr = currentMonthDate.toLocaleString('ru-RU', { month: 'long' });
    // Делаем первую букву заглавной
    const capitalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);

    return { blanks: blanksArr, days: daysArr, monthName: capitalizedMonth, year: y };
  }, [currentMonthDate]);

  const handlePrevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));

  // --- Логика стилизации дней ---
  const getDayClass = (dateStr: string) => {
    const isSelected = dateStr === selectedDate;
    const dayData = history.find((d: any) => d.date === dateStr);
    
    let baseClass = "aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all border select-none overflow-hidden ";
    
    // Если записей нет
    let colorClass = "bg-[#1E2128] border-slate-800 text-slate-400 hover:border-slate-600";
    
    if (dayData) {
      if (dayData.totalCalories > target.calories) {
        // Профицит (Красный)
        colorClass = "bg-red-500/10 border-red-500/30 text-red-400 hover:border-red-500/60 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]";
      } else {
        // Дефицит / Норма (Зеленый/Бирюзовый)
        colorClass = "bg-teal-500/10 border-teal-500/30 text-teal-400 hover:border-teal-500/60 shadow-[inset_0_0_20px_rgba(20,184,166,0.05)]";
      }
    }
    
    const selectedClass = isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[#0F1115] z-10" : "";
    return `${baseClass} ${colorClass} ${selectedClass}`;
  };

  // --- Выбранный день ---
  const selectedDayData = history.find((d: any) => d.date === selectedDate);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // --- Логика форм ---
  const groupedProducts = products.reduce((acc: any, product: any) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const isGrams = selectedProduct?.unit === '100г';
  const numAmount = Number(amount) || 0;
  const factor = isGrams ? numAmount / 100 : numAmount;

  const dynamicStats = selectedProduct ? {
    calories: Math.round(selectedProduct.calories * factor),
    protein: Number((selectedProduct.protein * factor).toFixed(1)),
    fat: Number((selectedProduct.fat * factor).toFixed(1)),
    carbs: Number((selectedProduct.carbs * factor).toFixed(1)),
  } : null;

  const handleOpenEdit = (e: React.MouseEvent, meal: any) => {
    e.stopPropagation();
    setAddingToDate(null);
    setEditingMeal(meal);
    setFormState({ name: meal.name, type: meal.type || 'Перекус', calories: meal.calories, protein: meal.protein, fat: meal.fat, carbs: meal.carbs });
  };

  const handleOpenAdd = () => {
    setEditingMeal(null);
    setAddingToDate(selectedDate);
    setAddMode('db');
    setSelectedProductId('');
    setAmount('');
    setFormState({ name: '', type: 'Завтрак', calories: 0, protein: 0, fat: 0, carbs: 0 });
  };

  const handleSave = () => {
    if (editingMeal) {
      dispatch(editMealRecord({ id: editingMeal.id, ...formState }));
      setEditingMeal(null);
    } else if (addingToDate) {
      if (addMode === 'db') {
        if (!selectedProduct || !amount || numAmount <= 0) return;
        dispatch(addMeal({
          name: `${selectedProduct.name} (${numAmount}${isGrams ? 'г' : ' шт'})`,
          type: formState.type,
          calories: dynamicStats!.calories,
          protein: dynamicStats!.protein,
          fat: dynamicStats!.fat,
          carbs: dynamicStats!.carbs,
          targetDate: addingToDate
        }));
      } else {
        dispatch(addMeal({ ...formState, targetDate: addingToDate }));
      }
      setAddingToDate(null);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300 relative pb-8">
      
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 shrink-0">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Календарь</h1>
          <p className="text-slate-400 text-sm md:text-base">Отслеживай свои результаты</p>
        </div>
      </header>

      {/* --- СЕТКА КАЛЕНДАРЯ --- */}
      <div className="bg-[#15171C] rounded-3xl p-4 md:p-6 border border-slate-800 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <button onClick={handlePrevMonth} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <span className="text-lg md:text-xl font-bold text-white tracking-wide">{monthName} {year}</span>
          <button onClick={handleNextMonth} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-3 text-center mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <span key={day} className="text-xs font-bold text-slate-500 uppercase">{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square opacity-0"></div>
          ))}
          {days.map(dateStr => {
            const dayNum = parseInt(dateStr.split('-')[2], 10);
            return (
              <div 
                key={dateStr} 
                onClick={() => setSelectedDate(dateStr)}
                className={getDayClass(dateStr)}
              >
                <span className="text-base md:text-lg font-bold">{dayNum}</span>
                {/* Маленькая точка для индикатора наличия еды */}
                {history.some((d: any) => d.date === dateStr) && (
                  <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-70"></div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Легенда */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500/20 border border-teal-500/50"></div>
            <span className="text-xs text-slate-400">Дефицит / Норма</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <span className="text-xs text-slate-400">Профицит</span>
          </div>
        </div>
      </div>

      {/* --- ИСТОРИЯ ЗА ВЫБРАННЫЙ ДЕНЬ --- */}
      <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">{formatDate(selectedDate)}</h2>
          <button 
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Добавить
          </button>
        </div>

        {selectedDayData ? (
          <div className="bg-[#1E2128] border border-slate-800 rounded-3xl flex flex-col transition-all overflow-hidden">
            {/* Макросы дня */}
            <div className="p-4 md:p-6 bg-[#15171C]/50 border-b border-slate-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-[#1E2128] p-3 rounded-2xl"><span className="text-slate-500 text-[10px] md:text-xs block mb-1">Калории</span><span className="text-white font-bold text-base md:text-lg">{Math.round(selectedDayData.totalCalories)} <span className="text-[10px] md:text-xs text-slate-500 font-normal">/ {target.calories}</span></span><div className="w-full bg-slate-800 h-1.5 rounded-full mt-2"><div className="bg-teal-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min((selectedDayData.totalCalories / target.calories) * 100, 100)}%` }}></div></div></div>
                <div className="bg-[#1E2128] p-3 rounded-2xl"><span className="text-slate-500 text-[10px] md:text-xs block mb-1">Белки</span><span className="text-blue-400 font-bold text-base md:text-lg">{Math.round(selectedDayData.totalProtein)}г <span className="text-[10px] md:text-xs text-slate-500 font-normal">/ {target.protein}г</span></span><div className="w-full bg-slate-800 h-1.5 rounded-full mt-2"><div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min((selectedDayData.totalProtein / target.protein) * 100, 100)}%` }}></div></div></div>
                <div className="bg-[#1E2128] p-3 rounded-2xl"><span className="text-slate-500 text-[10px] md:text-xs block mb-1">Жиры</span><span className="text-yellow-400 font-bold text-base md:text-lg">{Math.round(selectedDayData.totalFat)}г <span className="text-[10px] md:text-xs text-slate-500 font-normal">/ {target.fat}г</span></span><div className="w-full bg-slate-800 h-1.5 rounded-full mt-2"><div className="bg-yellow-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min((selectedDayData.totalFat / target.fat) * 100, 100)}%` }}></div></div></div>
                <div className="bg-[#1E2128] p-3 rounded-2xl"><span className="text-slate-500 text-[10px] md:text-xs block mb-1">Углеводы</span><span className="text-purple-400 font-bold text-base md:text-lg">{Math.round(selectedDayData.totalCarbs)}г <span className="text-[10px] md:text-xs text-slate-500 font-normal">/ {target.carbs}г</span></span><div className="w-full bg-slate-800 h-1.5 rounded-full mt-2"><div className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min((selectedDayData.totalCarbs / target.carbs) * 100, 100)}%` }}></div></div></div>
              </div>
            </div>

            {/* Список еды */}
            <div className="p-4 md:p-6 flex flex-col gap-6">
              {(() => {
                const groupedMeals = selectedDayData.meals.reduce((acc: any, meal: any) => {
                  const type = meal.type || 'Перекус';
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(meal);
                  return acc;
                }, {});

                return categoryOrder.filter(cat => groupedMeals[cat]).map(category => (
                  <div key={category} className="flex flex-col gap-2">
                    <h4 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{category}</h4>
                    <div className="flex flex-col gap-2">
                      {groupedMeals[category].map((meal: any) => (
                        <div key={meal.id} className="flex flex-col md:flex-row md:items-center justify-between bg-[#15171C] p-3 md:p-4 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors group gap-2 md:gap-0">
                          <div>
                            <h5 className="text-slate-200 font-medium text-sm md:text-base">{meal.name}</h5>
                            <div className="flex gap-2 md:gap-4 text-xs mt-1">
                              <span className="text-slate-500">Б: {Math.round(meal.protein)}г</span>
                              <span className="text-slate-500">Ж: {Math.round(meal.fat)}г</span>
                              <span className="text-slate-500">У: {Math.round(meal.carbs)}г</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-4">
                            <span className="text-teal-400/80 font-bold text-sm md:text-base">{Math.round(meal.calories)} ккал</span>
                            <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => handleOpenEdit(e, meal)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"><Edit2 size={16} /></button>
                              <button onClick={(e) => { e.stopPropagation(); dispatch(removeMeal(meal.id)); }} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-[#1E2128] border border-slate-800 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#15171C] rounded-full flex items-center justify-center text-slate-600 mb-4">
              <CalendarIcon size={32} />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Нет записей</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">В этот день ты еще ничего не добавлял. Начни вести дневник прямо сейчас.</p>
            <button 
              onClick={handleOpenAdd}
              className="px-6 py-3 bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-slate-900 font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <Plus size={18} /> Добавить первый прием пищи
            </button>
          </div>
        )}
      </div>

      {/* --- МОДАЛЬНОЕ ОКНО --- */}
      {(editingMeal || addingToDate) && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setEditingMeal(null); setAddingToDate(null); }}
        >
          <div 
            className="relative w-full max-w-md bg-[#1E2128] p-6 rounded-3xl border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { setEditingMeal(null); setAddingToDate(null); }} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">
              {addingToDate ? `Добавить еду (${formatDate(addingToDate)})` : 'Редактировать запись'}
            </h3>

            {addingToDate && (
              <div className="flex bg-[#15171C] rounded-xl p-1 mb-6 border border-slate-800">
                <button onClick={() => setAddMode('db')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${addMode === 'db' ? 'bg-teal-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>Из дневника</button>
                <button onClick={() => setAddMode('manual')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${addMode === 'manual' ? 'bg-teal-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>Свой вариант</button>
              </div>
            )}

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Категория</label>
                <div className="flex flex-wrap gap-2">
                  {mealTypesList.map(type => (
                    <button key={type} onClick={() => setFormState({...formState, type})} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formState.type === type ? 'bg-teal-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{type}</button>
                  ))}
                </div>
              </div>

              {addingToDate && addMode === 'db' && (
                <>
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Продукт из базы</label>
                    <select value={selectedProductId} onChange={e => { const id = e.target.value === '' ? '' : Number(e.target.value); setSelectedProductId(id); const prod = products.find(p => p.id === id); if(prod) setAmount(prod.unit === '100г' ? 100 : 1); }} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:border-teal-500 transition-colors text-[16px] md:text-sm cursor-pointer appearance-none">
                      <option value="" disabled>-- Выбрать продукт --</option>
                      {Object.keys(groupedProducts).map(cat => (
                        <optgroup key={cat} label={cat} className="text-slate-400 bg-[#1E2128]">
                          {groupedProducts[cat].map((p: any) => (<option key={p.id} value={p.id} className="text-white">{p.name}</option>))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  {selectedProduct && (
                    <div className="animate-in fade-in duration-300">
                      <label className="text-xs text-slate-500 mb-1.5 block">Количество ({isGrams ? 'граммы' : 'штуки'})</label>
                      <div className="relative mb-4">
                        <input type="number" autoFocus value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#15171C] border border-slate-800 text-white text-center text-2xl font-bold rounded-xl py-2 outline-none focus:border-teal-500 transition-colors" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{isGrams ? 'г' : 'шт'}</span>
                      </div>
                      <div className="bg-[#15171C] rounded-xl p-4 border border-slate-800/50">
                        <div className="flex justify-between items-center mb-3"><span className="text-slate-400 text-sm">Итого калорий:</span><span className="text-teal-400 font-bold text-xl">{dynamicStats?.calories}</span></div>
                        <div className="flex justify-between text-sm px-2">
                          <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Белки</span><span className="text-blue-400 font-medium">{dynamicStats?.protein}г</span></div>
                          <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Жиры</span><span className="text-yellow-400 font-medium">{dynamicStats?.fat}г</span></div>
                          <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Углеводы</span><span className="text-purple-400 font-medium">{dynamicStats?.carbs}г</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {(!addingToDate || addMode === 'manual') && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-4">
                    <label className="text-xs text-slate-500 mb-1.5 block">Название (и вес)</label>
                    <input type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} placeholder="Например: Творог (150г)" className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-colors text-[16px] md:text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500 mb-1.5 block">Калории</label><input type="number" value={formState.calories || ''} onChange={e => setFormState({...formState, calories: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-colors text-[16px] md:text-sm" /></div>
                    <div><label className="text-xs text-blue-400/70 mb-1.5 block">Белки (г)</label><input type="number" value={formState.protein || ''} onChange={e => setFormState({...formState, protein: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors text-[16px] md:text-sm" /></div>
                    <div><label className="text-xs text-yellow-400/70 mb-1.5 block">Жиры (г)</label><input type="number" value={formState.fat || ''} onChange={e => setFormState({...formState, fat: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500 transition-colors text-[16px] md:text-sm" /></div>
                    <div><label className="text-xs text-purple-400/70 mb-1.5 block">Углеводы (г)</label><input type="number" value={formState.carbs || ''} onChange={e => setFormState({...formState, carbs: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors text-[16px] md:text-sm" /></div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleSave} className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3.5 rounded-xl transition-all active:scale-95">
              {addingToDate ? 'Добавить в прошлый день' : 'Сохранить изменения'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};