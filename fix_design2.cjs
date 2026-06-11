const fs = require('fs');
let content = fs.readFileSync('src/pages/FoodDiary.tsx', 'utf8');

const target1 = `className="bg-[#15171C] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between hover:border-teal-500/50 cursor-pointer transition-colors group"`;
const replacement1 = `className="bg-[#15171C] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between hover:border-teal-500/50 cursor-pointer transition-colors group relative"`;

content = content.replace(target1, replacement1);

const badgeRegex = /\{\s*isYarcheProduct\(product\)\s*&&\s*\([\s\S]*?<span[^>]*>Ярче<\/span>\s*\)\s*\}/;
content = content.replace(badgeRegex, '');

const newBadge = `                  {isYarcheProduct(product) && (
                    <div className="absolute top-0 right-0 bg-orange-500/10 text-orange-500 border-l border-b border-orange-500/20 text-[9px] font-bold px-2 py-0.5 rounded-tr-xl rounded-bl-lg uppercase tracking-wider whitespace-nowrap">
                      Ярче
                    </div>
                  )}
`;

const textContainerRegex = /<div>\s*<div className="flex items-start gap-2 mb-1">\s*<h3 className="text-white font-medium group-hover:text-teal-400 transition-colors pr-2 text-sm md:text-base leading-tight">\{product\.name\}<\/h3>\s*<\/div>/;

const textContainerReplacement = `<div className="flex-1 pr-4">
                    <div className="mb-1">
                      <h3 className="text-white font-medium group-hover:text-teal-400 transition-colors pr-2 text-sm md:text-base leading-tight">{product.name}</h3>
                    </div>`;

content = content.replace(textContainerRegex, newBadge + textContainerReplacement);

content = content.replace('<div className="flex items-center gap-2">', '<div className="flex items-center gap-2 shrink-0">');

fs.writeFileSync('src/pages/FoodDiary.tsx', content);
console.log('Done');
