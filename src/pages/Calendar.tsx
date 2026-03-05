import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory, fetchUserData, removeMeal, editMealRecord, addMeal, fetchProducts } from '../store/dashboardSlice';
import type { AppDispatch, RootState } from '../store';
import { Calendar as CalendarIcon, ChevronDown, Trash2, Edit2, X, Plus } from 'lucide-react';

export const Calendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useSelector((state: RootState) => state.dashboard.history);
  const target = useSelector((state: RootState) => state.dashboard.target);
  const products = useSelector((state: RootState) => state.dashboard.products); // Подтянули базу продуктов

  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  
  // Стейты модального окна
  const [editingMeal, setEditingMeal] = useState<any | null>(null);
  const [addingToDate, setAddingToDate] = useState<string | null>(null);
  
  // Режимы добавления: из базы или вручную
  const [addMode, setAddMode] = useState<'db' | 'manual'>('db');
  
  // Стейт для ручного ввода / редактирования
  const [formState, setFormState] = useState({ name: '', type: 'Перекус', calories: 0, protein: 0, fat: 0, carbs: 0 });
  
  // Стейт для выбора из базы
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [amount, setAmount] = useState<number | ''>('');

  const mealTypesList = ['Завтрак', 'Обед', 'Ужин', 'Перекус днем', 'Перекус вечером', 'Перекус'];

  useEffect(() => {
    dispatch(fetchHistory());
    dispatch(fetchUserData());
    dispatch(fetchProducts()); // Загружаем базу продуктов при открытии Календаря
  }, [dispatch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const toggleDay = (dayId: number) => {
    setExpandedDays(prev => prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]);
  };

  // Группируем продукты для выпадающего списка
  const groupedProducts = products.reduce((acc: any, product: any) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  // Динамический пересчет КБЖУ для выбранного продукта из базы
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

  // Открытие окна РЕДАКТИРОВАНИЯ
  const handleOpenEdit = (e: React.MouseEvent, meal: any) => {
    e.stopPropagation();
    setAddingToDate(null);
    setEditingMeal(meal);
    setFormState({
      name: meal.name, type: meal.type || 'Перекус', calories: meal.calories, protein: meal.protein, fat: meal.fat, carbs: meal.carbs
    });
  };

  // Открытие окна ДОБАВЛЕНИЯ
  const handleOpenAdd = (e: React.MouseEvent, date: string) => {
    e.stopPropagation();
    setEditingMeal(null);
    setAddingToDate(date);
    setAddMode('db'); // По умолчанию открываем вкладку выбора из базы
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

  const categoryOrder = ['Завтрак', 'Обед', 'Ужин', 'Перекус днем', 'Перекус вечером', 'Перекус'];

  return (
    <div className="p-8 w-full max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in duration-300 relative">
      <header className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">История питания</h1>
          <p className="text-slate-400">Твой прогресс по дням</p>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {history.length === 0 ? (
          <div className="text-slate-500 text-center py-10">История пока пуста.</div>
        ) : (
          history.map((day: any) => {
            const calPercent = Math.min((day.totalCalories / target.calories) * 100, 100) || 0;
            const proPercent = Math.min((day.totalProtein / target.protein) * 100, 100) || 0;
            const fatPercent = Math.min((day.totalFat / target.fat) * 100, 100) || 0;
            const carbPercent = Math.min((day.totalCarbs / target.carbs) * 100, 100) || 0;
            const isExpanded = expandedDays.includes(day.id);

            const groupedMeals = day.meals.reduce((acc: any, meal: any) => {
              const type = meal.type || 'Перекус';
              if (!acc[type]) acc[type] = [];
              acc[type].push(meal);
              return acc;
            }, {});

            return (
              <div key={day.id} className="bg-[#1E2128] border border-slate-800 rounded-2xl flex flex-col transition-all overflow-hidden">
                <div onClick={() => toggleDay(day.id)} className="p-6 cursor-pointer hover:bg-slate-800/30 transition-colors select-none">
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <ChevronDown size={24} className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-teal-400' : ''}`} />
                      <h2 className="text-xl font-bold text-white">{formatDate(day.date)}</h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => handleOpenAdd(e, day.date)}
                        className="p-1.5 bg-[#15171C] border border-slate-800 hover:border-teal-500 hover:text-teal-400 text-slate-400 rounded-lg transition-all flex items-center gap-1"
                        title="Добавить прием пищи в этот день"
                      >
                        <Plus size={16} /> <span className="text-xs font-medium pr-1 hidden md:block">Добавить</span>
                      </button>
                      <span className="text-sm px-3 py-1 bg-slate-800 rounded-lg text-slate-400">
                        Приемов пищи: {day.meals.length}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#15171C] p-3 rounded-xl"><span className="text-slate-500 text-xs block mb-1">Калории</span><span className="text-white font-bold text-lg">{Math.round(day.totalCalories)} <span className="text-xs text-slate-500 font-normal">/ {target.calories}</span></span><div className="w-full bg-slate-800 h-1.5 rounded-full mt-2"><div className="bg-teal-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${calPercent}%` }}></div></div></div>
                    <div className="bg-[#15171C] p-3 rounded-xl"><span className="text-slate-500 text-xs block mb-1">Белки</span><span className="text-blue-400 font-bold text-lg">{Math.round(day.totalProtein)}г <span className="text-xs text-slate-500 font-normal">/ {target.protein}г</span></span><div className="w-full bg-slate-800 h-1.5 rounded-full mt-2"><div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${proPercent}%` }}></div></div></div>
                    <div className="bg-[#15171C] p-3 rounded-xl"><span className="text-slate-500 text-xs block mb-1">Жиры</span><span className="text-yellow-400 font-bold text-lg">{Math.round(day.totalFat)}г <span className="text-xs text-slate-500 font-normal">/ {target.fat}г</span></span><div className="w-full bg-slate-800 h-1.5 rounded-full mt-2"><div className="bg-yellow-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${fatPercent}%` }}></div></div></div>
                    <div className="bg-[#15171C] p-3 rounded-xl"><span className="text-slate-500 text-xs block mb-1">Углеводы</span><span className="text-purple-400 font-bold text-lg">{Math.round(day.totalCarbs)}г <span className="text-xs text-slate-500 font-normal">/ {target.carbs}г</span></span><div className="w-full bg-slate-800 h-1.5 rounded-full mt-2"><div className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${carbPercent}%` }}></div></div></div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-800/50 bg-[#15171C]/50 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    {day.meals.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center">В этот день записей не было.</p>
                    ) : (
                      categoryOrder.filter(cat => groupedMeals[cat]).map(category => (
                        <div key={category} className="flex flex-col gap-2">
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{category}</h4>
                          <div className="flex flex-col gap-2">
                            {groupedMeals[category].map((meal: any) => (
                              <div key={meal.id} className="flex items-center justify-between bg-[#1E2128] p-3 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors group">
                                <div>
                                  <h5 className="text-slate-200 font-medium text-sm">{meal.name}</h5>
                                  <div className="flex gap-3 text-xs mt-1">
                                    <span className="text-slate-500">Б: {Math.round(meal.protein)}г</span>
                                    <span className="text-slate-500">Ж: {Math.round(meal.fat)}г</span>
                                    <span className="text-slate-500">У: {Math.round(meal.carbs)}г</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-teal-400/80 font-bold text-sm">{Math.round(meal.calories)} ккал</span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => handleOpenEdit(e, meal)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"><Edit2 size={16} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); dispatch(removeMeal(meal.id)); }} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"><Trash2 size={16} /></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Модальное окно (Добавление и Редактирование) */}
      {(editingMeal || addingToDate) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#1E2128] p-6 rounded-3xl border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => { setEditingMeal(null); setAddingToDate(null); }} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">
              {addingToDate ? `Добавить еду (${formatDate(addingToDate)})` : 'Редактировать запись'}
            </h3>

            {/* Вкладки: Из базы / Вручную (только при добавлении) */}
            {addingToDate && (
              <div className="flex bg-[#15171C] rounded-xl p-1 mb-6 border border-slate-800">
                <button 
                  onClick={() => setAddMode('db')} 
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${addMode === 'db' ? 'bg-teal-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Из дневника
                </button>
                <button 
                  onClick={() => setAddMode('manual')} 
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${addMode === 'manual' ? 'bg-teal-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Свой вариант
                </button>
              </div>
            )}

            <div className="flex flex-col gap-4 mb-6">
              {/* Общий выбор категории для обоих режимов */}
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Категория</label>
                <div className="flex flex-wrap gap-2">
                  {mealTypesList.map(type => (
                    <button
                      key={type}
                      onClick={() => setFormState({...formState, type})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        formState.type === type ? 'bg-teal-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* РЕЖИМ: ВЫБОР ИЗ БАЗЫ */}
              {addingToDate && addMode === 'db' && (
                <>
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Продукт из базы</label>
                    <select 
                      value={selectedProductId} 
                      onChange={e => {
                        const id = e.target.value === '' ? '' : Number(e.target.value);
                        setSelectedProductId(id);
                        const prod = products.find(p => p.id === id);
                        if(prod) setAmount(prod.unit === '100г' ? 100 : 1);
                      }}
                      className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:border-teal-500 transition-colors text-sm cursor-pointer appearance-none"
                    >
                      <option value="" disabled>-- Выбрать продукт --</option>
                      {Object.keys(groupedProducts).map(cat => (
                        <optgroup key={cat} label={cat} className="text-slate-400 bg-[#1E2128]">
                          {groupedProducts[cat].map((p: any) => (
                            <option key={p.id} value={p.id} className="text-white">{p.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {selectedProduct && (
                    <div className="animate-in fade-in duration-300">
                      <label className="text-xs text-slate-500 mb-1.5 block">Количество ({isGrams ? 'граммы' : 'штуки'})</label>
                      <div className="relative mb-4">
                        <input 
                          type="number" 
                          autoFocus
                          value={amount}
                          onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-[#15171C] border border-slate-800 text-white text-center text-2xl font-bold rounded-xl py-2 outline-none focus:border-teal-500 transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{isGrams ? 'г' : 'шт'}</span>
                      </div>

                      <div className="bg-[#15171C] rounded-xl p-4 border border-slate-800/50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-slate-400 text-sm">Итого калорий:</span>
                          <span className="text-teal-400 font-bold text-xl">{dynamicStats?.calories}</span>
                        </div>
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

              {/* РЕЖИМ: РУЧНОЙ ВВОД (или редактирование) */}
              {(!addingToDate || addMode === 'manual') && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-4">
                    <label className="text-xs text-slate-500 mb-1.5 block">Название (и вес)</label>
                    <input type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} placeholder="Например: Творог (150г)" className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-colors text-sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 mb-1.5 block">Калории</label>
                      <input type="number" value={formState.calories || ''} onChange={e => setFormState({...formState, calories: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-colors text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-blue-400/70 mb-1.5 block">Белки (г)</label>
                      <input type="number" value={formState.protein || ''} onChange={e => setFormState({...formState, protein: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-yellow-400/70 mb-1.5 block">Жиры (г)</label>
                      <input type="number" value={formState.fat || ''} onChange={e => setFormState({...formState, fat: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500 transition-colors text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-purple-400/70 mb-1.5 block">Углеводы (г)</label>
                      <input type="number" value={formState.carbs || ''} onChange={e => setFormState({...formState, carbs: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors text-sm" />
                    </div>
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