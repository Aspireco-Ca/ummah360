console.log('🎮 Starting Islamic Quiz Game...');

import Phaser from 'phaser';
import './styles/main.css';

console.log('✅ Phaser and CSS imported');

// Import scenes
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import LobbyScene from './scenes/LobbyScene';

console.log('✅ All scenes imported');

// Import networking
import NetworkManager from './networking/NetworkManager';

console.log('✅ NetworkManager imported');

class IslamicQuizGame {
    constructor() {
        console.log('🏗️ Creating IslamicQuizGame instance...');
        this.networkManager = new NetworkManager();
        console.log('✅ NetworkManager created');
        this.initializeGame();
    }

    initializeGame() {
        console.log('🚀 Initializing Phaser game...');
        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'game-container',
            backgroundColor: '#1B5E20',
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 320,
                    height: 480
                },
                max: {
                    width: 1920,
                    height: 1080
                }
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [
                BootScene,
                MenuScene,
                LobbyScene,
                GameScene
            ],
            input: {
                activePointers: 1,
                smoothFactor: 0.2
            },
            render: {
                antialias: true,
                pixelArt: false,
                roundPixels: false
            }
        };

        console.log('📝 Phaser config created:', config);
        
        this.game = new Phaser.Game(config);
        console.log('✅ Phaser game instance created');
        
        // Global reference for network manager
        this.game.networkManager = this.networkManager;
        console.log('✅ NetworkManager attached to game');
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.game.scale.resize(window.innerWidth, window.innerHeight);
        });

        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.game.scale.resize(window.innerWidth, window.innerHeight);
            }, 100);
        });

        // Prevent context menu on right click/long press
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
}

console.log('📄 Script loaded, waiting for DOM...');

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM Content Loaded!');
    
    // Clear the game container and remove loading screen
    const gameContainer = document.getElementById('game-container');
    console.log('🎯 Game container found:', gameContainer);
    
    if (gameContainer) {
        gameContainer.innerHTML = ''; // Clear loading content
        console.log('✅ Loading screen cleared');
    }
    
    // Start the game
    console.log('🎮 Starting game initialization...');
    try {
        new IslamicQuizGame();
    } catch (error) {
        console.error('❌ Failed to create game:', error);
    }
});

console.log('📋 Event listener registered');

// Handle page visibility for performance optimization
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause game when tab/app is not visible
        if (window.islamicQuizGame && window.islamicQuizGame.game.scene.isActive('GameScene')) {
            window.islamicQuizGame.game.scene.pause('GameScene');
        }
    } else {
        // Resume game when tab/app becomes visible
        if (window.islamicQuizGame && window.islamicQuizGame.game.scene.isPaused('GameScene')) {
            window.islamicQuizGame.game.scene.resume('GameScene');
        }
    }
});