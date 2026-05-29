import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTargetCalories } from '../../store/dashboardSlice';
import type { AppDispatch, RootState } from '../../store';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const CalorieEditModal = ({ onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentCalories = useSelector((state: RootState) => state.dashboard.target.calories);
  
  // Локальное состояние для инпута, инициализируется текущей нормой
  const [calories, setCalories] = useState(currentCalories);

  // Если данные из Redux подгрузятся позже, обновляем инпут
  useEffect(() => {
    setCalories(currentCalories);
  }, [currentCalories]);

  const handleSave = () => {
    dispatch(updateTargetCalories(calories));
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-[#1E2128] p-6 rounded-3xl border border-slate-800 animate-in fade-in zoom-in duration-200 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <h3 className="text-lg font-semibold text-white mb-6 text-center">Дневная норма ккал</h3>
        
        <div className="flex items-center justify-between gap-4 mb-6">
          <button 
            onClick={() => setCalories(prev => prev - 100)}
            className="w-14 h-14 flex items-center justify-center bg-[#15171C] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-2xl text-2xl font-medium transition-all active:scale-95"
          >
            -
          </button>
          
          <div className="flex-1 relative">
            <input 
              type="number" 
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full bg-[#15171C] border border-slate-800 text-white text-center text-3xl font-bold rounded-2xl py-3 outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          
          <button 
            onClick={() => setCalories(prev => prev + 100)}
            className="w-14 h-14 flex items-center justify-center bg-[#15171C] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-2xl text-2xl font-medium transition-all active:scale-95"
          >
            +
          </button>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3.5 rounded-xl transition-all active:scale-95"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};