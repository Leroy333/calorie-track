import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.resolve(__dirname, '../yarche_products_cleaned.csv');
  const csvData = fs.readFileSync(csvPath, 'utf8');
  
  const rows = csvData.split('\n').filter(row => row.trim() !== '');
  const products = [];
  let isFirst = true;

  for (const row of rows) {
    if (isFirst) {
      isFirst = false;
      continue;
    }
    
    const parts = row.split(';');
    if (parts.length >= 6) {
      let name = parts[0];
      if (name.startsWith('"') && name.endsWith('"')) name = name.slice(1, -1);
      
      let category = parts[1];
      if (category.startsWith('"') && category.endsWith('"')) category = category.slice(1, -1);
      
      const cal = parseFloat(parts[2].replace(',', '.'));
      const prot = parseFloat(parts[3].replace(',', '.'));
      const fat = parseFloat(parts[4].replace(',', '.'));
      const carb = parseFloat(parts[5].replace(',', '.'));
      
      products.push({
        name: name.trim(),
        category: 'ЯРЧЕ - ' + category.trim(),
        unit: '100г',
        calories: isNaN(cal) ? 0 : cal,
        protein: isNaN(prot) ? 0 : prot,
        fat: isNaN(fat) ? 0 : fat,
        carbs: isNaN(carb) ? 0 : carb,
      });
    }
  }

  await prisma.product.deleteMany({
    where: {
      category: {
        startsWith: 'ЯРЧЕ - '
      }
    }
  });

  await prisma.product.createMany({
    data: products
  });

  console.log('Yarche products seeded successfully: ' + products.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
