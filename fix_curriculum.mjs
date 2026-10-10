import fs from 'fs';

let c = fs.readFileSync('src/data/lessons/curriculum.ts', 'utf8');

c = c.replace(/id: 'level-5',\s*number: 5,\s*title: 'Capitalization',/, "id: 'level-5',\n    number: 5,\n    title: 'Capitalization',\n    category: 'capitalization',");
c = c.replace(/id: 'level-6',\s*number: 6,\s*title: 'Punctuation',/, "id: 'level-6',\n    number: 6,\n    title: 'Punctuation',\n    category: 'punctuation',");
c = c.replace(/id: 'level-7',\s*number: 7,\s*title: 'Numbers and Symbols',/, "id: 'level-7',\n    number: 7,\n    title: 'Numbers and Symbols',\n    category: 'numbers-symbols',");
c = c.replace(/id: 'level-8',\s*number: 8,\s*title: 'Sentence Fluency',/, "id: 'level-8',\n    number: 8,\n    title: 'Sentence Fluency',\n    category: 'sentence-fluency',");
c = c.replace(/id: 'level-9',\s*number: 9,\s*title: 'Advanced Typing',/, "id: 'level-9',\n    number: 9,\n    title: 'Advanced Typing',\n    category: 'advanced',");
c = c.replace(/id: 'level-10',\s*number: 10,\s*title: 'Expert Challenges',/, "id: 'level-10',\n    number: 10,\n    title: 'Expert Challenges',\n    category: 'expert',");

c = c.replaceAll("category: 'numbers'", "category: 'numbers-symbols'");
c = c.replaceAll("category: 'symbols'", "category: 'numbers-symbols'");
c = c.replaceAll("category: 'fluency'", "category: 'sentence-fluency'");

fs.writeFileSync('src/data/lessons/curriculum.ts', c);
console.log('Curriculum categories updated successfully');
