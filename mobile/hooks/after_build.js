#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    console.log('🔧 Running after_build hook...');
    
    const projectRoot = context.opts.projectRoot;
    const platforms = context.opts.platforms || [];
    
    platforms.forEach(platform => {
        console.log(`📱 Processing ${platform} build...`);
        
        switch (platform) {
            case 'android':
                processAndroidBuild(projectRoot);
                break;
            case 'ios':
                processIOSBuild(projectRoot);
                break;
            default:
                console.log(`ℹ️  No specific processing for platform: ${platform}`);
        }
    });
    
    console.log('✅ after_build hook completed');
};

function processAndroidBuild(projectRoot) {
    const androidPlatformDir = path.join(projectRoot, 'platforms', 'android');
    
    if (!fs.existsSync(androidPlatformDir)) {
        console.log('⚠️  Android platform directory not found');
        return;
    }
    
    // Check APK files
    const buildDir = path.join(androidPlatformDir, 'app', 'build', 'outputs', 'apk');
    if (fs.existsSync(buildDir)) {
        const apkFiles = findAPKFiles(buildDir);
        if (apkFiles.length > 0) {
            console.log('📦 Android APK files built:');
            apkFiles.forEach(apk => {
                const stats = fs.statSync(apk);
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                console.log(`   ${path.basename(apk)} (${sizeMB} MB)`);
            });
        }
    }
    
    // Performance optimizations for Android
    optimizeAndroidBuild(androidPlatformDir);
}

function processIOSBuild(projectRoot) {
    const iosPlatformDir = path.join(projectRoot, 'platforms', 'ios');
    
    if (!fs.existsSync(iosPlatformDir)) {
        console.log('⚠️  iOS platform directory not found');
        return;
    }
    
    console.log('🍎 iOS build processed');
    
    // Performance optimizations for iOS
    optimizeIOSBuild(iosPlatformDir);
}

function findAPKFiles(dir, apkFiles = []) {
    if (!fs.existsSync(dir)) return apkFiles;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            findAPKFiles(fullPath, apkFiles);
        } else if (item.endsWith('.apk')) {
            apkFiles.push(fullPath);
        }
    });
    
    return apkFiles;
}

function optimizeAndroidBuild(androidDir) {
    try {
        // Optimize build.gradle if needed
        const buildGradlePath = path.join(androidDir, 'app', 'build.gradle');
        if (fs.existsSync(buildGradlePath)) {
            console.log('🔧 Checking Android build optimizations...');
            
            let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
            let modified = false;
            
            // Ensure minifyEnabled is set for release builds
            if (!buildGradle.includes('minifyEnabled true') && buildGradle.includes('buildTypes')) {
                console.log('💡 Consider enabling minifyEnabled for release builds');
            }
            
            // Check if splits are configured for APK size optimization
            if (!buildGradle.includes('splits {')) {
                console.log('💡 Consider adding APK splits for better app size management');
            }
            
            if (modified) {
                fs.writeFileSync(buildGradlePath, buildGradle);
                console.log('✅ Android build.gradle optimized');
            }
        }
        
        // Check AndroidManifest.xml
        const manifestPath = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
        if (fs.existsSync(manifestPath)) {
            const manifest = fs.readFileSync(manifestPath, 'utf8');
            
            // Check for performance-related attributes
            if (!manifest.includes('android:hardwareAccelerated="true"')) {
                console.log('💡 Consider enabling hardware acceleration in AndroidManifest.xml');
            }
        }
        
    } catch (error) {
        console.warn('⚠️  Error optimizing Android build:', error.message);
    }
}

function optimizeIOSBuild(iosDir) {
    try {
        console.log('🔧 Checking iOS build optimizations...');
        
        // Check for common iOS optimizations
        const projectFiles = fs.readdirSync(iosDir).filter(file => file.endsWith('.xcodeproj'));
        
        if (projectFiles.length > 0) {
            console.log('📱 iOS project found:', projectFiles[0]);
            
            // Here you could add iOS-specific optimizations
            // such as checking Info.plist settings, build settings, etc.
        }
        
    } catch (error) {
        console.warn('⚠️  Error optimizing iOS build:', error.message);
    }
}

// Performance tips for users
function showPerformanceTips() {
    console.log('\n🚀 Performance Tips:');
    console.log('   • Use "cordova build --release" for production builds');
    console.log('   • Enable minification in Android builds');
    console.log('   • Optimize images and assets before building');
    console.log('   • Test on real devices, not just emulators');
    console.log('   • Monitor app size and loading times');
}