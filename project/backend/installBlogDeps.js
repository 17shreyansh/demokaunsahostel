require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installing Blog System Dependencies...\n');

const backendDeps = [
  'express-rate-limit',
  'sanitize-html',
  'sharp',
  'helmet',
  'compression',
  'node-cron'
];

const frontendDeps = [
  '@tiptap/react',
  '@tiptap/starter-kit',
  '@tiptap/extension-link',
  '@tiptap/extension-image',
  '@tiptap/extension-table',
  '@tiptap/extension-table-row',
  '@tiptap/extension-table-cell',
  '@tiptap/extension-table-header',
  '@tiptap/extension-task-list',
  '@tiptap/extension-task-item',
  '@tiptap/extension-highlight',
  '@tiptap/extension-text-align',
  '@tiptap/extension-color',
  '@tiptap/extension-text-style',
  '@tiptap/extension-placeholder',
  'react-helmet-async',
  'chart.js',
  'react-chartjs-2',
  'dompurify',
  'date-fns'
];

try {
  console.log('📦 Installing Backend Dependencies...');
  execSync(`npm install ${backendDeps.join(' ')}`, {
    cwd: path.join(__dirname),
    stdio: 'inherit'
  });
  console.log('✅ Backend dependencies installed\n');

  console.log('📦 Installing Frontend Dependencies...');
  execSync(`npm install ${frontendDeps.join(' ')}`, {
    cwd: path.join(__dirname, '../frontend'),
    stdio: 'inherit'
  });
  console.log('✅ Frontend dependencies installed\n');

  console.log('✨ All dependencies installed successfully!\n');
  console.log('📝 Next steps:');
  console.log('1. Update .env file with required variables');
  console.log('2. Run: node createAuthor.js (to create initial author)');
  console.log('3. Start backend: npm run dev');
  console.log('4. Start frontend: cd ../frontend && npm run dev');
  console.log('5. Access admin panel and create your first blog post');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
