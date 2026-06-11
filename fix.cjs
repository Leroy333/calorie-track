const fs = require('fs');
let c = fs.readFileSync('src/pages/FoodDiary.tsx', 'utf8');

c = c.replace(/const \[isYarcheView, setIsYarcheView\] = useState\(false\);\r?\n?/, '');

const oldFilter = `const filteredProductsRaw = products.filter(p => { if (isYarcheView) { if (!isYarcheProduct(p) && !p.recent) return false; } else { if (isYarcheProduct(p) && !p.recent) return false; } const query = searchQuery.trim();`;
const newFilter = `const filteredProductsRaw = products.filter(p => { const query = searchQuery.trim();`;
c = c.replace(oldFilter, newFilter);

const oldSlice = `const filteredProducts = isYarcheView ? filteredProductsRaw.slice(0, 150) : filteredProductsRaw;`;
const newSlice = `const filteredProducts = filteredProductsRaw.slice(0, 300);`;
c = c.replace(oldSlice, newSlice);

const oldHeader = `{isYarcheView ? 'ЯРЧЕ 🛒' : 'Дневник Питания 🥗'}</h1>
          <p className="text-slate-400 text-sm md:text-base">{isYarcheView ? 'Каталог продуктов магазина ЯРЧЕ.' : 'Твоя база продуктов. Выбери еду или отредактируй состав.'}`;
const newHeader = `Дневник Питания 🥗</h1>
          <p className="text-slate-400 text-sm md:text-base">Твоя база продуктов. Выбери еду или отредактируй состав.`;
c = c.replace(oldHeader, newHeader);

c = c.replace(/<button[\s\S]*?onClick=\{\(\) => setIsYarcheView\(!isYarcheView\)\}[\s\S]*?<\/button>/, '');

const oldH3 = `<h3 className="text-white font-medium mb-1 group-hover:text-teal-400 transition-colors pr-2 text-sm md:text-base">{product.name}</h3>`;
const newH3 = `<div className="flex items-start gap-2 mb-1">
                      <h3 className="text-white font-medium group-hover:text-teal-400 transition-colors pr-2 text-sm md:text-base leading-tight">{product.name}</h3>
                      {isYarcheProduct(product) && (
                        <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap mt-0.5">Ярче</span>
                      )}
                    </div>`;
c = c.replace(oldH3, newH3);

fs.writeFileSync('src/pages/FoodDiary.tsx', c);
console.log('Done!');
