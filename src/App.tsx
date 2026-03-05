import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { FoodDiary } from './pages/FoodDiary';
import { Calendar } from './pages/Calendar';

// Здесь НЕТ импорта App из './App' !

export const App = () => {
  return (
    <Router>
      <div className="flex h-screen bg-[#0F1115]">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/diary" element={<FoodDiary />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// Обязательно добавляем экспорт по умолчанию в самом конце:
export default App;