const fs = require('fs');
const content = fs.readFileSync('src/pages/FoodDiary.tsx', 'utf8');

const oldStr = `              {groupedProducts[category].map(product => (
                <div 
                  key={category + '-' + product.id} 
                  onClick={() => handleOpenModal(product)}
                  className="bg-[#15171C] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between hover:border-teal-500/50 cursor-pointer transition-colors group"
                >
                  <div>
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-white font-medium group-hover:text-teal-400 transition-colors pr-2 text-sm md:text-base leading-tight">{product.name}</h3>
                      {isYarcheProduct(product) && (
                        <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap mt-0.5">Ярче</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">База: {product.unit} • <span className="text-teal-500/70 font-medium">{product.calories} ккал</span></p>
                    <div className="flex gap-2 md:gap-3 text-xs text-slate-400">
                      <span>Б: {product.protein}</span>
                      <span>Ж: {product.fat}</span>
                      <span>У: {product.carbs}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">`;

const newStr = `              {groupedProducts[category].map(product => (
                <div 
                  key={category + '-' + product.id} 
                  onClick={() => handleOpenModal(product)}
                  className="bg-[#15171C] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between hover:border-teal-500/50 cursor-pointer transition-colors group relative"
                >
                  {isYarcheProduct(product) && (
                    <div className="absolute top-0 right-0 bg-orange-500/10 text-orange-500 border-l border-b border-orange-500/20 text-[9px] font-bold px-2 py-0.5 rounded-tr-xl rounded-bl-lg uppercase tracking-wider whitespace-nowrap">
                      Ярче
                    </div>
                  )}
                  <div className="flex-1 pr-4">
                    <div className="mb-1">
                      <h3 className="text-white font-medium group-hover:text-teal-400 transition-colors pr-2 text-sm md:text-base leading-tight">{product.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">База: {product.unit} • <span className="text-teal-500/70 font-medium">{product.calories} ккал</span></p>
                    <div className="flex gap-2 md:gap-3 text-xs text-slate-400">
                      <span>Б: {product.protein}</span>
                      <span>Ж: {product.fat}</span>
                      <span>У: {product.carbs}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">`;

const newContent = content.replace(oldStr, newStr);
if (newContent === content) {
    console.log('Error: content not replaced. string not found?');
    process.exit(1);
}
fs.writeFileSync('src/pages/FoodDiary.tsx', newContent);
console.log('Success');
