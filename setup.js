#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🕌 Islamic Quiz Card Game - Setup Script');
console.log('بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ\n');

async function runCommand(command, description) {
    return new Promise((resolve, reject) => {
        console.log(`📦 ${description}...`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.warn(`⚠️  Warning: ${stderr}`);
            }
            console.log(`✅ ${description} completed`);
            resolve(stdout);
        });
    });
}

async function createEnvFile() {
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, '.env.example');
    
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
        console.log('📝 Creating .env file from example...');
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env file created');
        console.log('💡 Please edit .env file with your configuration');
    } else if (fs.existsSync(envPath)) {
        console.log('✅ .env file already exists');
    }
}

async function checkPorts() {
    console.log('🔍 Checking if ports are available...');
    
    const net = require('net');
    
    const checkPort = (port) => {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(port, () => {
                server.close(() => resolve(true));
            });
            server.on('error', () => resolve(false));
        });
    };
    
    const frontendPortAvailable = await checkPort(8080);
    const backendPortAvailable = await checkPort(4000);
    
    if (frontendPortAvailable) {
        console.log('✅ Frontend port 8080 is available');
    } else {
        console.log('⚠️  Port 8080 is in use - you may need to stop other services');
    }
    
    if (backendPortAvailable) {
        console.log('✅ Backend port 4000 is available');
    } else {
        console.log('⚠️  Port 4000 is in use - you may need to stop other services');
    }
}

async function createDirectories() {
    const directories = [
        'logs',
        'frontend/assets',
        'mobile/www',
        'mobile/res/android/icon',
        'mobile/res/android/splash',
        'mobile/res/ios/icon',
        'mobile/res/ios/splash'
    ];
    
    console.log('📁 Creating necessary directories...');
    
    directories.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ Created: ${dir}`);
        }
    });
}

async function main() {
    try {
        console.log('🚀 Starting setup process...\n');
        
        // Check Node.js version
        const nodeVersion = process.version;
        console.log(`📋 Node.js version: ${nodeVersion}`);
        
        if (parseInt(nodeVersion.slice(1)) < 16) {
            console.error('❌ Node.js 16+ is required. Please upgrade.');
            process.exit(1);
        }
        
        // Create directories
        await createDirectories();
        
        // Create .env file
        await createEnvFile();
        
        // Check ports
        await checkPorts();
        
        // Install dependencies
        await runCommand('npm install', 'Installing main dependencies');
        
        // Install mobile dependencies
        if (fs.existsSync(path.join(__dirname, 'mobile'))) {
            await runCommand('cd mobile && npm install', 'Installing mobile dependencies');
        }
        
        // Build frontend
        await runCommand('npm run build', 'Building frontend');
        
        console.log('\n🎉 Setup completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Edit .env file with your configuration');
        console.log('   2. Start development: npm run dev');
        console.log('   3. Start frontend: npm run dev-frontend');
        console.log('   4. Open browser: http://localhost:8080');
        console.log('\n📱 For mobile development:');
        console.log('   1. Install Cordova CLI: npm install -g cordova');
        console.log('   2. Setup mobile: npm run mobile:setup');
        console.log('   3. Build mobile: npm run mobile:build:android');
        
        console.log('\n🌟 May Allah bless this project! الحمد لله');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.log('\n💡 Troubleshooting tips:');
        console.log('   - Ensure Node.js 16+ is installed');
        console.log('   - Check internet connection');
        console.log('   - Try running: npm cache clean --force');
        console.log('   - Check if ports 8080 and 4000 are available');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };