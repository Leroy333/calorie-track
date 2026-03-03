import { useState } from 'react';
import { Home, Calendar, Book, Settings, Flame, X, PlusCircle } from 'lucide-react'; // Добавил PlusCircle
import { MealForm } from '../ui/MealForm'; 
import { SettingsForm } from '../ui/SettingsForm';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const [isMealFormOpen, setIsMealFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Хук для определения текущей страницы (чтобы подсвечивать активный пункт меню)
  const location = useLocation();

  const menu = [
    { 
      icon: <Home size={18} />, 
      label: 'Дашборд', 
      path: '/' 
    },
    { 
      icon: <Book size={18} />, 
      label: 'Дневник Питания', 
      path: '/diary' 
    },
    { 
      icon: <Calendar size={18} />, 
      label: 'Календарь',
      path: '/calendar'
    },
    { 
      icon: <PlusCircle size={18} />, 
      label: 'Добавить вручную',
      onClick: () => setIsMealFormOpen(true) 
    },
    { 
      icon: <Settings size={18} />, 
      label: 'Настройки',
      onClick: () => setIsSettingsOpen(true)
    },
  ];

  return (
    <>
      <aside className="w-64 bg-[#1E2128] h-screen text-slate-400 p-4 flex flex-col fixed left-0 top-0 z-40 border-r border-slate-800">
        <div className="flex items-center gap-2 text-white font-bold text-xl mb-10 px-2">
          <Flame className="text-teal-500" /> CalorieTrack
        </div>
        <nav className="flex flex-col gap-2">
          {menu.map((item, idx) => {
            // Проверяем, совпадает ли путь элемента с текущим адресом в браузере
            const isActive = item.path ? location.pathname === item.path : false;
            
            const baseStyles = "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left";
            const activeStyles = isActive ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-slate-800 hover:text-white';

            // Если у элемента есть функция onClick -> это модальное окно (рендерим button)
            if (item.onClick) {
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`${baseStyles} ${activeStyles}`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            }

            // Если у элемента есть путь -> это страница (рендерим Link)
            return (
              <Link
                key={idx}
                to={item.path || '#'}
                className={`${baseStyles} ${activeStyles}`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Модальное окно Настроек */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsSettingsOpen(false)} className="absolute -top-10 right-0 text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <SettingsForm onClose={() => setIsSettingsOpen(false)} />
          </div>
        </div>
      )}

      {/* Модальное окно ручного добавления еды */}
      {isMealFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsMealFormOpen(false)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <MealForm onClose={() => setIsMealFormOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};