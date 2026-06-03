const fs = require('fs');
const path = 'c:/Users/АРМ-1/Desktop/calorie-track-main/src/pages/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace 1
content = content.replace(
  'import { ChevronDown, Trash2 } from \'lucide-react\';',
  'import { ChevronDown, Trash2, Plus, X } from \'lucide-react\';\nimport { MealForm } from \'../components/ui/MealForm\';'
);

// replace 2
content = content.replace(
  'const [isCalorieModalOpen, setIsCalorieModalOpen] = useState(false);',
  'const [isCalorieModalOpen, setIsCalorieModalOpen] = useState(false);\n  const [isMealFormOpen, setIsMealFormOpen] = useState(false);'
);

// replace 3
content = content.replace(
  '<div className="flex flex-col gap-4 mt-4">',
  '<div className="flex items-center justify-between mt-4">\n        <h2 className="text-xl font-bold text-white">Список съеденного</h2>\n        <button\n          onClick={() => setIsMealFormOpen(true)}\n          className="flex items-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 px-4 py-2 rounded-xl transition-colors text-sm font-medium"\n        >\n          <Plus size={16} />\n          Добавить\n        </button>\n      </div>\n      <div className="flex flex-col gap-4 mt-0">'
);

// replace 4
const targetStr = '{isCalorieModalOpen && (';
const replaceStr = '{isMealFormOpen && (\n        <div \n          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"\n          onClick={() => setIsMealFormOpen(false)}\n        >\n          <div \n            className="relative w-full max-w-md animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto rounded-3xl"\n            onClick={(e) => e.stopPropagation()}\n          >\n            <button \n              onClick={() => setIsMealFormOpen(false)}\n              className="absolute -top-10 right-0 text-slate-400 hover:text-white transition-colors"\n            >\n              <X size={24} />\n            </button>\n            <MealForm onClose={() => setIsMealFormOpen(false)} targetDate={selectedDate} />\n          </div>\n        </div>\n      )}\n\n      ' + targetStr;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync(path, content, 'utf8');
console.log('Dashboard.tsx updated!');
