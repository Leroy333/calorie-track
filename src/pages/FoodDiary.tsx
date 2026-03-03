import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, addMeal } from '../store/dashboardSlice';
import type { AppDispatch, RootState } from '../store';
import { Plus, X } from 'lucide-react';

export const FoodDiary = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.dashboard.products);
  
  // Стейты для управления модальным окном
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [amount, setAmount] = useState<number | ''>('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Группируем продукты по категориям
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // Открытие модалки с предзаполненным значением
  const handleOpenModal = (product: any) => {
    setSelectedProduct(product);
    // Если продукт в граммах, ставим по умолчанию 100. Если в штуках - 1.
    setAmount(product.unit === '100г' ? 100 : 1);
  };

  // Высчитываем динамические КБЖУ для отображения в модалке
  const isGrams = selectedProduct?.unit === '100г';
  const numAmount = Number(amount) || 0;
  const factor = isGrams ? numAmount / 100 : numAmount;

  const dynamicStats = selectedProduct ? {
    calories: Math.round(selectedProduct.calories * factor),
    protein: Number((selectedProduct.protein * factor).toFixed(1)),
    fat: Number((selectedProduct.fat * factor).toFixed(1)),
    carbs: Number((selectedProduct.carbs * factor).toFixed(1)),
  } : null;

  const handleSaveMeal = () => {
    if (!selectedProduct || !amount || numAmount <= 0) return;

    // Отправляем пересчитанную еду в базу
    dispatch(addMeal({
      name: `${selectedProduct.name} (${numAmount}${isGrams ? 'г' : ' шт'})`,
      calories: dynamicStats!.calories,
      protein: dynamicStats!.protein,
      fat: dynamicStats!.fat,
      carbs: dynamicStats!.carbs
    }));

    // Закрываем модалку
    setSelectedProduct(null);
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in duration-300 relative">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Дневник Питания 🥗</h1>
        <p className="text-slate-400">Твоя база продуктов. Выбери еду и укажи съеденное количество.</p>
      </header>

      <div className="flex flex-col gap-8">
        {Object.keys(groupedProducts).map(category => (
          <div key={category} className="bg-[#1E2128] rounded-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold text-teal-400 mb-4">{category}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedProducts[category].map(product => (
                <div 
                  key={product.id} 
                  onClick={() => handleOpenModal(product)}
                  className="bg-[#15171C] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between hover:border-teal-500/50 cursor-pointer transition-colors group"
                >
                  <div>
                    <h3 className="text-white font-medium mb-1 group-hover:text-teal-400 transition-colors">{product.name}</h3>
                    <p className="text-xs text-slate-500 mb-2">База: {product.unit} • <span className="text-teal-500/70 font-medium">{product.calories} ккал</span></p>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>Б: {product.protein}</span>
                      <span>Ж: {product.fat}</span>
                      <span>У: {product.carbs}</span>
                    </div>
                  </div>
                  
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800 text-slate-400 group-hover:bg-teal-500 group-hover:text-slate-900 transition-all">
                    <Plus size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно указания веса/количества */}
      {selectedProduct && dynamicStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#1E2128] p-6 rounded-3xl border border-slate-800 animate-in fade-in zoom-in duration-200 shadow-2xl">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-semibold text-white mb-1 pr-6">{selectedProduct.name}</h3>
            <p className="text-sm text-slate-400 mb-6">Введи количество ({isGrams ? 'граммы' : 'штуки'})</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <input 
                  type="number" 
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[#15171C] border border-slate-800 text-white text-center text-3xl font-bold rounded-2xl py-3 outline-none focus:border-teal-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                  {isGrams ? 'г' : 'шт'}
                </span>
              </div>
            </div>

            {/* Динамический пересчет КБЖУ */}
            <div className="bg-[#15171C] rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-400 text-sm">Итого калорий:</span>
                <span className="text-teal-400 font-bold text-xl">{dynamicStats.calories}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex flex-col items-center">
                  <span className="text-slate-500 text-xs mb-1">Белки</span>
                  <span className="text-blue-400 font-medium">{dynamicStats.protein}г</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-slate-500 text-xs mb-1">Жиры</span>
                  <span className="text-yellow-400 font-medium">{dynamicStats.fat}г</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-slate-500 text-xs mb-1">Углеводы</span>
                  <span className="text-purple-400 font-medium">{dynamicStats.carbs}г</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveMeal}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3.5 rounded-xl transition-all active:scale-95"
            >
              Добавить в рацион
            </button>
          </div>
        </div>
      )}
    </div>
  );
};