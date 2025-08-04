const fs = require('fs-extra');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../../frontend/dist');
const TARGET_DIR = path.join(__dirname, '../www');

async function copyAssets() {
    try {
        console.log('📱 Starting mobile asset copy...');
        
        // Ensure target directory exists
        await fs.ensureDir(TARGET_DIR);
        
        // Check if source directory exists
        if (!await fs.pathExists(SOURCE_DIR)) {
            console.error('❌ Source directory not found:', SOURCE_DIR);
            console.log('💡 Run "npm run build" in the root directory first');
            process.exit(1);
        }
        
        // Clear target directory
        await fs.emptyDir(TARGET_DIR);
        console.log('🧹 Cleared www directory');
        
        // Copy all files from frontend/dist to www
        await fs.copy(SOURCE_DIR, TARGET_DIR);
        console.log('📁 Copied frontend assets to www directory');
        
        // Create mobile-specific index.html modifications
        await modifyIndexForMobile();
        
        // Create cordova-specific files
        await createCordovaFiles();
        
        // Copy icons and splash screens (if they exist)
        await copyIconsAndSplash();
        
        console.log('✅ Mobile assets copied successfully!');
        
    } catch (error) {
        console.error('❌ Error copying mobile assets:', error);
        process.exit(1);
    }
}

async function modifyIndexForMobile() {
    const indexPath = path.join(TARGET_DIR, 'index.html');
    
    if (await fs.pathExists(indexPath)) {
        let indexContent = await fs.readFile(indexPath, 'utf8');
        
        // Add Cordova script tag before closing body tag
        const cordovaScript = '    <script src="cordova.js"></script>\n';
        indexContent = indexContent.replace('</body>', cordovaScript + '</body>');
        
        // Add mobile-specific meta tags
        const mobileMetaTags = `
    <!-- Mobile specific meta tags -->
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="initial-scale=1, width=device-width, viewport-fit=cover">
    <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: gap: content:">
`;
        
        // Insert mobile meta tags after existing viewport tag
        indexContent = indexContent.replace(
            /<meta name="viewport"[^>]*>/,
            mobileMetaTags
        );
        
        // Modify title for mobile
        indexContent = indexContent.replace(
            /<title>.*<\/title>/,
            '<title>Islamic Quiz</title>'
        );
        
        await fs.writeFile(indexPath, indexContent);
        console.log('📝 Modified index.html for mobile');
    }
}

async function createCordovaFiles() {
    // Create .cordova directory if it doesn't exist
    const cordovaDir = path.join(__dirname, '../.cordova');
    await fs.ensureDir(cordovaDir);
    
    // Create basic Cordova config
    const cordovaConfig = {
        lib: {
            www: {
                id: 'cordova-app-hello-world',
                version: '6.0.0',
                uri: 'https://github.com/apache/cordova-app-hello-world/tarball/6.0.0'
            }
        }
    };
    
    await fs.writeJson(path.join(cordovaDir, 'config.json'), cordovaConfig, { spaces: 2 });
    
    // Create error page for mobile
    const errorPageContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connection Error - Islamic Quiz</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
            color: white;
            text-align: center;
            padding: 50px 20px;
            margin: 0;
        }
        .error-container {
            max-width: 400px;
            margin: 0 auto;
        }
        .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        .error-title {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .error-message {
            font-size: 16px;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .retry-button {
            background: #FFD700;
            color: #1B5E20;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">📱</div>
        <h1 class="error-title">Connection Error</h1>
        <p class="error-message">
            Unable to connect to the game server. Please check your internet connection and try again.
        </p>
        <button class="retry-button" onclick="location.reload()">
            Try Again
        </button>
    </div>
</body>
</html>
`;
    
    await fs.writeFile(path.join(TARGET_DIR, 'error.html'), errorPageContent);
    console.log('📄 Created error page for mobile');
}

async function copyIconsAndSplash() {
    const resDir = path.join(__dirname, '../res');
    
    // Create default icons and splash screens if they don't exist
    if (!await fs.pathExists(resDir)) {
        console.log('⚠️  No res directory found. Creating placeholder resources...');
        await createDefaultResources();
    }
}

async function createDefaultResources() {
    const resDir = path.join(__dirname, '../res');
    
    // Create directories
    await fs.ensureDir(path.join(resDir, 'android/icon'));
    await fs.ensureDir(path.join(resDir, 'android/splash'));
    await fs.ensureDir(path.join(resDir, 'ios/icon'));
    await fs.ensureDir(path.join(resDir, 'ios/splash'));
    await fs.ensureDir(path.join(resDir, 'android/xml'));
    
    // Create network security config for Android
    const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.0.0/8</domain>
        <domain includeSubdomains="true">192.168.0.0/16</domain>
        <domain includeSubdomains="true">172.16.0.0/12</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>`;
    
    await fs.writeFile(
        path.join(resDir, 'android/xml/network_security_config.xml'),
        networkSecurityConfig
    );
    
    console.log('📱 Created default mobile resources');
    console.log('💡 Note: Add proper app icons and splash screens to the res directory');
}

// Run the script
if (require.main === module) {
    copyAssets();
}

module.exports = { copyAssets };