#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    console.log('🔧 Running before_prepare hook...');
    
    const projectRoot = context.opts.projectRoot;
    const platformsDir = path.join(projectRoot, 'platforms');
    
    // Ensure www directory exists
    const wwwDir = path.join(projectRoot, 'www');
    if (!fs.existsSync(wwwDir)) {
        console.log('📁 Creating www directory...');
        fs.mkdirSync(wwwDir, { recursive: true });
        
        // Create a basic index.html if it doesn't exist
        const indexPath = path.join(wwwDir, 'index.html');
        if (!fs.existsSync(indexPath)) {
            const basicIndex = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Islamic Quiz Card Game</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #1B5E20;
            color: white;
            text-align: center;
            padding: 50px 20px;
            margin: 0;
        }
    </style>
</head>
<body>
    <h1>Islamic Quiz Card Game</h1>
    <p>بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
    <p>Loading...</p>
    <p>Please run "npm run build" in the root directory to build the web assets.</p>
    <script src="cordova.js"></script>
</body>
</html>
            `.trim();
            
            fs.writeFileSync(indexPath, basicIndex);
            console.log('📄 Created basic index.html');
        }
    }
    
    // Check if web assets are built
    const frontendDist = path.join(projectRoot, '../frontend/dist');
    if (!fs.existsSync(frontendDist)) {
        console.warn('⚠️  Frontend assets not found. Run "npm run build" in the root directory first.');
    }
    
    console.log('✅ before_prepare hook completed');
};