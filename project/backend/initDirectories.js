const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads', 'blog-images')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  } else {
    console.log(`✓ Directory exists: ${dir}`);
  }
});

console.log('\nAll required directories are ready!');
