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
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#1E2128] h-screen text-slate-400 p-4 hidden md:flex flex-col fixed left-0 top-0 z-40 border-r border-slate-800">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl mb-10 px-2 hover:opacity-80 transition-opacity">
          <Flame className="text-teal-500" /> CalorieTrack
        </Link>
        <nav className="flex flex-col gap-2">
          {menu.map((item, idx) => {
            const isActive = item.path ? location.pathname === item.path : false;
            const baseStyles = "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left";
            const activeStyles = isActive ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-slate-800 hover:text-white';

            if (item.onClick) {
              return (
                <button key={idx} onClick={item.onClick} className={`${baseStyles} ${activeStyles}`}>
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <Link key={idx} to={item.path || '#'} className={`${baseStyles} ${activeStyles}`}>
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#1E2128] border-t border-slate-800 z-40 flex items-center justify-around px-2 pb-safe">
        {menu.map((item, idx) => {
          const isActive = item.path ? location.pathname === item.path : false;
          const activeStyles = isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200';

          if (item.onClick) {
            return (
              <button key={idx} onClick={item.onClick} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeStyles}`}>
                {item.icon}
                <span className="text-[10px] font-medium leading-none text-center truncate w-full">{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={idx} to={item.path || '#'} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeStyles}`}>
              {item.icon}
              <span className="text-[10px] font-medium leading-none text-center truncate w-full">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Модальное окно Настроек */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div 
            className="relative w-full max-w-md animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setIsSettingsOpen(false)} className="absolute -top-10 right-0 text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <SettingsForm onClose={() => setIsSettingsOpen(false)} />
          </div>
        </div>
      )}

      {/* Модальное окно ручного добавления еды */}
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
            <MealForm onClose={() => setIsMealFormOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};