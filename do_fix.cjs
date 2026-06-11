const fs = require('fs');
let c = fs.readFileSync('src/pages/FoodDiary.tsx', 'utf8');

c = c.replace(/const \[isYarcheView, setIsYarcheView\] = useState(false);\r?\n?/, '');

const oldFilter = 'const filteredProductsRaw = products.filter(p => { if (isYarcheView) { if (!isYarcheProduct(p) && !p.recent) return false; } else { if (isYarcheProduct(p) && !p.recent) return false; } const query = searchQuery.trim();';
const newFilter = 'const filteredProductsRaw = products.filter(p => { const query = searchQuery.trim();';
c = c.replace(oldFilter, newFilter);

const oldSlice = 'const filteredProducts = isYarcheView ? filteredProductsRaw.slice(0, 150) : filteredProductsRaw;';
const newSlice = 'const filteredProducts = filteredProductsRaw.slice(0, 300);';
c = c.replace(oldSlice, newSlice);

const oldHeader = '{isYarcheView ? \'\u042F\u0420\u0427\u0415 \uD83D\uDED2\' : \'\u0414\u043D\u0435\u0432\u043D\u0438\u043A \u041F\u0438\u0442\u0430\u043D\u0438\u044F \uD83E\uDD57\'}</h1>\n          <p className="text-slate-400 text-sm md:text-base">{isYarcheView ? \'\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430 \u042F\u0420\u0427\u0415.\' : \'\u0422\u0432\u043E\u044F \u0431\u0430\u0437\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432. \u0412\u044B\u0431\u0435\u0440\u0438 \u0435\u0434\u0443 \u0438\u043B\u0438 \u043E\u0442\u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0443\u0439 \u0441\u043E\u0441\u0442\u0430\u0432.\'}';
const newHeader = '\u0414\u043D\u0435\u0432\u043D\u0438\u043A \u041F\u0438\u0442\u0430\u043D\u0438\u044F \u0D83E\uDD57</h1>\n          <p className="text-slate-400 text-sm md:text-base">\u0422\u0432\u043E\u044F \u0431\u0430\u0437\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432. \u0412\u044B\u0431\u0435\u0440\u0438 \u0435\u0434\u0443 \u0438\u043B\u0438 \u043E\u0442\u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0443\u0439 \u0441\u043E\u0441\u0442\u0430\u0432.';
c = c.replace(oldHeader, newHeader);

c = c.replace(/<button[\S\s]*?onClick=\{\(\) => setIsYarcheView\(!isYarcheView\)\}[\S\s]*?<\/button>/, '');

const oldH3 = '<h3 className="text-white font-medium mb-1 group-hover:text-teal-400 transition-colors pr-2 text-sm md:text-base">{product.name}</h3>';
const newH3 = '<div className="flex items-start gap-2 mb-1">\n                      <h3 className="text-white font-medium group-hover:text-teal-400 transition-colors pr-2 text-sm md:text-base leading-tight">{product.name}</h3>\n                      {isYarcheProduct(product) && (\n                        <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap mt-0.5">\u042F\u0440\u0447\u0435</span>\n                      )}\n                    </div>';
c = c.replace(oldH3, newH3);

fs.writeFileSync('src/pages/FoodDiary.tsx', c);