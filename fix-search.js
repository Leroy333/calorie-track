const fs = require('fs');
let data = fs.readFileSync('src/pages/FoodDiary.tsx', 'utf8');
const oldStr = `  const filteredProductsRaw = products.filter(p => { if (isYarcheView) { if (!isYarcheProduct(p) && !p.recent) return false; } else { if (isYarcheProduct(p) && !p.recent) return false; } const query = searchQuery.trim(); if (!query) return true; if (query.length < 2) return true; return searchRegex.test(p.name) || searchRegex.test(p.category); });

  const filteredProducts = isYarcheView && !searchQuery.trim() ? filteredProductsRaw.slice(0, 150) : filteredProductsRaw;`;

const newStr = `  const filteredProductsRaw = products.filter(p => { 
    if (isYarcheView) { 
        if (!isYarcheProduct(p) && !p.recent) return false; 
    } else { 
        if (isYarcheProduct(p) && !p.recent) return false; 
    } 
    const query = searchQuery.trim(); 
    if (!query) return true; 
    if (query.length < 2) return true; 
    
    let catToSearch = p.category;
    if (catToSearch.startsWith('�B�B�$%t(H	�JH�]��X\��H�]��X\����\X�J	�+�(4*rBWB����������(�����(����(����ɕ��ɸ�͕�ɍ�I����ѕ�С�����������͕�ɍ�I����ѕ�С���Q�M��ɍ���(�����((������Ё���ѕɕ�Aɽ�Ս�̀��e�ɍ��Y��܀�����ѕɕ�Aɽ�Ս��I�ܹͱ������������聙��ѕɕ�Aɽ�Ս��I����()������ф�����Ց�̡���M�Ȥ���(������ф�􁑅ф�ɕ���������M�Ȱ����M�Ȥ�(�����̹�ɥѕ���M幌���Ɍ�����̽���������������ф����ј����(�������ͽ��������MՍ���͙ձ��ɕ����������)􁕱͔��(�������ͽ���������ɽ���ձ����Ё��������M�ȁ�����������)�