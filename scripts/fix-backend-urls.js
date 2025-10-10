/**
 * Script to fix hardcoded localhost:5005 URLs in API routes
 * Replaces them with environment variable BACKEND_URL
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/api/leetcode/[username]/suggestions/route.ts',
  'app/api/leetcode/[username]/topics/route.ts',
  'app/api/leetcode/[username]/activity/route.ts',
  'app/api/leetcode/[username]/submission/route.ts',
  'app/api/leetcode/[username]/languages/route.ts',
  'lib/test-auth.ts',
];

const rootDir = path.join(__dirname, '..');

filesToFix.forEach(file => {
  const filePath = path.join(rootDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Check if file already has BACKEND_URL constant
  const hasBACKEND_URL = content.includes('const BACKEND_URL');
  
  if (!hasBACKEND_URL) {
    // Add BACKEND_URL constant after imports
    const importEndIndex = content.indexOf('\n\nexport') || content.indexOf('\n\nconst');
    if (importEndIndex > 0) {
      content = content.slice(0, importEndIndex) + 
        '\n\nconst BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || \'http://localhost:5005\'' +
        content.slice(importEndIndex);
    }
  }
  
  // Replace all hardcoded URLs
  content = content.replace(/http:\/\/localhost:5005/g, '${BACKEND_URL}');
  content = content.replace(/`\$\{BACKEND_URL\}/g, '`${BACKEND_URL}');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } else {
    console.log(`ℹ️  No changes needed: ${file}`);
  }
});

console.log('\n✨ Done! All files have been updated.');
