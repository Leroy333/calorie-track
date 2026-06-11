const fs = require('fs');
let c = fs.readFileSync('src/pages/FoodDiary.tsx', 'utf8');

c = c.replace(/<h1 className="text-2xl md:text-3xl font-bold text-white mb-2">\{isYarcheView \? '[\s\S]*?' : '[\s\S]*?'\}<\/h1>/, '<h1 className="text-2xl md:text-3xl font-bold text-white mb-2">\u0414\u043D\u0435\u0432\u043D\u0438\u043A \u041F\u0438\u0442\u0430\u043D\u0438\u044F \uD83E\uDD57</h1>');

c = c.replace(/<p className="text-slate-400 text-sm md:text-base">\{isYarcheView \? '[\s\S]*?' : '[\s\S]*?'\}<\/p>/, '<p className="text-slate-400 text-sm md:text-base">\u0422\u0432\u043E\u044F \u0431\u0430\u0437\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432. \u0412\u044B\u0431\u0435\u0440\u0438 \u0435\u0434\u0443 \u0438\u043B\u0438 \u043E\u0442\u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0443\u0439 \u0441\u043E\u0441\u0442\u0430\u0432.</p>');

fs.writeFileSync('src/pages/FoodDiary.tsx', c);
