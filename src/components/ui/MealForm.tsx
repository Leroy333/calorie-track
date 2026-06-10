import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMeal, fetchProducts } from '../../store/dashboardSlice';
import type { AppDispatch, RootState } from '../../store';
import { Card } from './Card';
import type { Product } from '../../store/dashboardSlice';

interface MealFormProps {
  onClose: () => void;
  targetDate?: string;
}

export const MealForm = ({ onClose, targetDate }: MealFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.dashboard.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [amount, setAmount] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'Перекус',
    calories: '',
    protein: '',
    fat: '',
    carbs: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim(); if (!query) return products.slice(0, 100); if (query.length < 2) return [];
    return products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 100);
  }, [products, searchTerm]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const cat = product.category || 'Без категории';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, typeof products>);
  }, [filteredProducts]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    const defaultAmt = (product.unit && product.unit.includes('100')) ? '100' : '1';
    setAmount(defaultAmt);
    setSearchTerm(product.name);
    setIsDropdownOpen(false);
    
    setFormData({
      ...formData,
      name: product.name,
      calories: String(product.calories),
      protein: String(product.protein),
      fat: String(product.fat),
      carbs: String(product.carbs),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(addMeal({
      name: formData.name,
      type: formData.type,
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      fat: Number(formData.fat),
      carbs: Number(formData.carbs),
      targetDate: targetDate,
    }));

    setFormData({ name: '', type: 'Перекус', calories: '', protein: '', fat: '', carbs: '' });
    setSelectedProduct(null);
    setSearchTerm('');
    setAmount('');
    onClose();
  };

  return (
    <Card className="flex flex-col gap-4 overflow-visible">
      <h3 className="text-lg font-semibold text-white">Добавить прием пищи</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по дневнику..."
              className="bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-teal-500 w-full pr-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => { setSearchTerm(''); setIsDropdownOpen(true); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-[#1E2128] border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
              {Object.keys(groupedProducts).length === 0 ? (
                <div className="p-3 text-sm text-slate-400 text-center">Ничего не найдено</div>
              ) : (
                Object.entries(groupedProducts).map(([category, prods]) => (
                  <div key={category}>
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-800/50 sticky top-0 uppercase tracking-wider backdrop-blur-md">
                      {category}
                    </div>
                    {prods.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-teal-500/20 hover:text-teal-400 transition-colors"
                        onClick={() => handleProductSelect(p)}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 my-1">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-xs text-slate-500 uppercase font-medium">или введите вручную</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <input 
          type="text" 
          placeholder="Например: Самса из слоеного теста" 
          className="bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-teal-500 w-full"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        
        <div className="flex gap-3">
          <select
            className="bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-teal-500 flex-1"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option value="Завтрак">Завтрак</option>
            <option value="Обед">Обед</option>
            <option value="Ужин">Ужин</option>
            <option value="Перекус днем">Перекус днем</option>
            <option value="Перекус вечером">Перекус вечером</option>
            <option value="Перекус">Перекус</option>
          </select>

          <input 
            type="number" 
            placeholder={selectedProduct ? (selectedProduct.unit?.includes('100') ? 'Грамм' : 'Штук') : 'Вес / Кол-во'} 
            className="bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-teal-500 w-32"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              setAmount(val);
              if (selectedProduct && val) {
                const numVal = Number(val);
                const factor = (selectedProduct.unit && selectedProduct.unit.includes('100')) ? numVal / 100 : numVal;
                setFormData(prev => ({
                  ...prev,
                  calories: String(Math.round(selectedProduct.calories * factor)),
                  protein: String(Math.round(selectedProduct.protein * factor * 10) / 10),
                  fat: String(Math.round(selectedProduct.fat * factor * 10) / 10),
                  carbs: String(Math.round(selectedProduct.carbs * factor * 10) / 10),
                }));
              }
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input 
            type="number" 
            placeholder="Ккал" 
            className="bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-teal-500"
            value={formData.calories}
            onChange={(e) => { setFormData({...formData, calories: e.target.value}); setSelectedProduct(null); }}
            required
          />
          <input 
            type="number" 
            step="0.1"
            placeholder="Белки (г)" 
            className="bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-teal-500"
            value={formData.protein}
            onChange={(e) => { setFormData({...formData, protein: e.target.value}); setSelectedProduct(null); }}
            required
          />
          <input 
            type="number" 
            step="0.1"
            placeholder="Жиры (г)" 
            className="bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-teal-500"
            value={formData.fat}
            onChange={(e) => { setFormData({...formData, fat: e.target.value}); setSelectedProduct(null); }}
            required
          />
          <input 
            type="number" 
            step="0.1"
            placeholder="Углеводы (г)" 
            className="bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-teal-500"
            value={formData.carbs}
            onChange={(e) => { setFormData({...formData, carbs: e.target.value}); setSelectedProduct(null); }}
            required
          />
        </div>

        <button 
          type="submit" 
          className="mt-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold py-2 rounded-lg transition-colors"
        >
          Добавить в дневник
        </button>
      </form>
    </Card>
  );
};
