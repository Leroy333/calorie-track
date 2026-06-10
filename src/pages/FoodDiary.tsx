import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, addMeal, editProduct } from '../store/dashboardSlice';
import type { AppDispatch, RootState } from '../store';
import { Plus, X, Edit2, Search } from 'lucide-react';

export const FoodDiary = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.dashboard.products);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isYarcheView, setIsYarcheView] = useState(false);
  
  // Стейт для добавления продукта
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [amount, setAmount] = useState<number | ''>('');

  const [mealType, setMealType] = useState('Завтрак');
  const mealTypesList = ['Завтрак', 'Обед', 'Ужин', 'Перекус днем', 'Перекус вечером'];

  // Стейты для редактирования продукта
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', calories: 0, protein: 0, fat: 0, carbs: 0 });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const escapedQuery = searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const searchRegex = new RegExp(`(^|[^а-яА-ЯёЁa-zA-Z0-9])` + escapedQuery, 'i');

  const isYarcheProduct = (p: any) => p.category.startsWith('ЯРЧЕ - ');

  const filteredProductsRaw = products.filter(p => { if (isYarcheView) { if (!isYarcheProduct(p) && !p.recent) return false; } else { if (isYarcheProduct(p) && !p.recent) return false; } const query = searchQuery.trim(); if (!query) return true; if (query.length < 2) return true; return searchRegex.test(p.name) || searchRegex.test(p.category); });

  const filteredProducts = isYarcheView && !searchQuery.trim() ? filteredProductsRaw.slice(0, 150) : filteredProductsRaw;

  const groupedProducts = filteredProducts.reduce((acc, product) => { let cat = product.category; if (cat.startsWith('ЯРЧЕ - ')) { cat = cat.replace('ЯРЧЕ - ', ''); } if (product.recent) { if (!acc['Недавнее']) acc['Недавнее'] = []; acc['Недавнее'].push(product); if (!acc[cat]) acc[cat] = []; acc[cat].push(product); } else { if (!acc[cat]) acc[cat] = []; acc[cat].push(product); } return acc; }, {} as Record<string, typeof products>); const categoryKeys = Object.keys(groupedProducts).sort((a, b) => { if (a === 'Недавнее') return -1; if (b === 'Недавнее') return 1; return a.localeCompare(b); });

  const handleOpenModal = (product: any) => {
    setSelectedProduct(product);
    setAmount(product.unit === '100г' ? 100 : 1);
  };

  const handleOpenEdit = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      calories: product.calories,
      protein: product.protein,
      fat: product.fat,
      carbs: product.carbs,
    });
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    dispatch(editProduct({ id: editingProduct.id, ...editForm }));
    setEditingProduct(null);
  };

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
    dispatch(addMeal({
      name: `${selectedProduct.name} (${numAmount}${isGrams ? 'г' : ' шт'})`,
      type: mealType,
      calories: dynamicStats!.calories,
      protein: dynamicStats!.protein,
      fat: dynamicStats!.fat,
      carbs: dynamicStats!.carbs,
      productId: selectedProduct.id
    }));
    setSelectedProduct(null);
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto flex flex-col gap-4 md:gap-8 animate-in fade-in duration-300 relative pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{isYarcheView ? 'ЯРЧЕ 🛒' : 'Дневник Питания 🥗'}</h1>
          <p className="text-slate-400 text-sm md:text-base">{isYarcheView ? 'Каталог продуктов магазина ЯРЧЕ.' : 'Твоя база продуктов. Выбери еду или отредактируй состав.'}</p>
        </div>
        <button
          onClick={() => setIsYarcheView(!isYarcheView)}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap"
        >
          {isYarcheView ? 'В Дневник' : 'Каталог ЯРЧЕ'}
        </button>
      </header>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Поиск продуктов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1E2128] border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-teal-500 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-4 md:gap-8">
        {categoryKeys.map(category => (
          <div key={category} className="bg-[#1E2128] rounded-2xl border border-slate-800 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-teal-400 mb-4">{category}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {groupedProducts[category].map(product => (
                <div 
                  key={category + '-' + product.id} 
                  onClick={() => handleOpenModal(product)}
                  className="bg-[#15171C] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between hover:border-teal-500/50 cursor-pointer transition-colors group"
                >
                  <div>
                    <h3 className="text-white font-medium mb-1 group-hover:text-teal-400 transition-colors pr-2 text-sm md:text-base">{product.name}</h3>
                    <p className="text-xs text-slate-500 mb-2">База: {product.unit} • <span className="text-teal-500/70 font-medium">{product.calories} ккал</span></p>
                    <div className="flex gap-2 md:gap-3 text-xs text-slate-400">
                      <span>Б: {product.protein}</span>
                      <span>Ж: {product.fat}</span>
                      <span>У: {product.carbs}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleOpenEdit(e, product)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800/50 text-slate-500 hover:bg-slate-700 hover:text-white transition-all md:opacity-0 md:group-hover:opacity-100"
                      title="Редактировать КБЖУ"
                    >
                      <Edit2 size={16} />
                    </button>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800 text-slate-400 md:group-hover:bg-teal-500 md:group-hover:text-slate-900 transition-all">
                      <Plus size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно указания веса */}
      {selectedProduct && dynamicStats && !editingProduct && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="relative w-full max-w-sm bg-[#1E2128] p-6 rounded-3xl border border-slate-800 animate-in fade-in zoom-in duration-200 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold text-white mb-1 pr-6">{selectedProduct.name}</h3>
            <p className="text-sm text-slate-400 mb-6">Введи количество ({isGrams ? 'граммы' : 'штуки'})</p>
            
            {/* Блок ввода количества */}
            <div className="relative mb-6">
              <input 
                type="number" 
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#15171C] border border-slate-800 text-white text-center text-3xl font-bold rounded-2xl py-3 outline-none focus:border-teal-500 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{isGrams ? 'г' : 'шт'}</span>
            </div>

            {/* Блок выбора типа приема пищи */}
            <div className="mb-6">
              <label className="text-xs text-slate-500 mb-2 block">В какой прием пищи добавить?</label>
              <div className="flex flex-wrap gap-2">
                {mealTypesList.map(type => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      mealType === type 
                        ? 'bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/20' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#15171C] rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-400 text-sm">Итого калорий:</span>
                <span className="text-teal-400 font-bold text-xl">{dynamicStats.calories}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Белки</span><span className="text-blue-400 font-medium">{dynamicStats.protein}г</span></div>
                <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Жиры</span><span className="text-yellow-400 font-medium">{dynamicStats.fat}г</span></div>
                <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Углеводы</span><span className="text-purple-400 font-medium">{dynamicStats.carbs}г</span></div>
              </div>
            </div>

            <button onClick={handleSaveMeal} className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3.5 rounded-xl transition-all active:scale-95">
              Добавить в рацион
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно: РЕДАКТИРОВАНИЕ ПРОДУКТА */}
      {editingProduct && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setEditingProduct(null)}
        >
          <div 
            className="relative w-full max-w-md bg-[#1E2128] p-6 rounded-3xl border border-slate-800 animate-in fade-in zoom-in duration-200 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Редактировать продукт</h3>

            <div className="flex flex-col gap-4 mb-8">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Название</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-colors text-[16px] md:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Калории</label>
                  <input type="number" value={editForm.calories} onChange={e => setEditForm({...editForm, calories: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-colors text-[16px] md:text-sm" />
                </div>
                <div>
                  <label className="text-xs text-blue-400/70 mb-1.5 block">Белки (г)</label>
                  <input type="number" value={editForm.protein} onChange={e => setEditForm({...editForm, protein: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors text-[16px] md:text-sm" />
                </div>
                <div>
                  <label className="text-xs text-yellow-400/70 mb-1.5 block">Жиры (г)</label>
                  <input type="number" value={editForm.fat} onChange={e => setEditForm({...editForm, fat: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500 transition-colors text-[16px] md:text-sm" />
                </div>
                <div>
                  <label className="text-xs text-purple-400/70 mb-1.5 block">Углеводы (г)</label>
                  <input type="number" value={editForm.carbs} onChange={e => setEditForm({...editForm, carbs: Number(e.target.value)})} className="w-full bg-[#15171C] border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors text-[16px] md:text-sm" />
                </div>
              </div>
            </div>

            <button onClick={handleSaveEdit} className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3.5 rounded-xl transition-all active:scale-95">
              Сохранить изменения
            </button>
          </div>
        </div>
      )}
    </div>
  );
};