import { Provider } from 'react-redux';
import { store } from './store';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  return (
    <Provider store={store}>
      <div className="flex bg-[#15171C] min-h-screen font-sans">
        <Sidebar />
        {/* Добавили ml-64 сюда 👇 */}
        <div className="flex-1 ml-64">
          <Dashboard />
        </div>
      </div>
    </Provider>
  );
}