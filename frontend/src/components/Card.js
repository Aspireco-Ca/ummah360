import Phaser from 'phaser';

class Card extends Phaser.GameObjects.Container {
    constructor(scene, type, data) {
        super(scene, 0, 0);
        
        this.scene = scene;
        this.cardType = type;
        this.cardData = data;
        this.isFlipped = false;
        this.isSelected = false;
        this.isPlayable = true;
        
        this.createCard();
        this.setupInteractions();
        
        scene.add.existing(this);
    }

    createCard() {
        // Determine which card template to use based on type
        const templateKey = this.getCardTemplateKey();
        
        // Card background - use HD version if available, fallback to generated
        this.cardBack = this.scene.add.image(0, 0, 
            this.scene.textures.exists('card-back-hd') ? 'card-back-hd' : 'card-back'
        );
        
        // Card front - use template if available, fallback to generic
        this.cardFront = this.scene.add.image(0, 0, 
            this.scene.textures.exists(templateKey) ? templateKey : 'card-front'
        );
        
        // Initially show back
        this.cardFront.setVisible(false);
        
        // Card type indicator (color border) - only show if using placeholder
        this.cardBorder = this.scene.add.graphics();
        if (!this.scene.textures.exists(templateKey)) {
            this.updateCardBorder();
        }
        
        // Card content (text and icons) - always create for dynamic content
        this.createCardContent();
        
        // Adjust text styling if using templates
        if (this.scene.textures.exists(templateKey)) {
            this.adjustTextForTemplate();
        }
        
        // Add to container
        this.add([this.cardBack, this.cardFront, this.cardBorder]);
    }

    getCardTemplateKey() {
        // Map card types to template keys
        const templateMap = {
            'blessing': 'card-template-blessing',
            'challenge': 'card-template-challenge',
            'knowledge': 'card-template-knowledge',
            'wisdom': 'card-template-wisdom'
        };
        
        return templateMap[this.cardType] || 'card-front';
    }

    adjustTextForTemplate() {
        // Adjust text styling for better visibility on templates
        if (this.titleText) {
            this.titleText.setStyle({
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center',
                wordWrap: { width: 160 }
            });
            this.titleText.y = -60; // Move up to fit in template center area
        }
        
        if (this.descriptionText) {
            this.descriptionText.setStyle({
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 1,
                align: 'center',
                wordWrap: { width: 150 }
            });
            this.descriptionText.y = -20; // Move up to fit in template center area
        }
        
        // Hide programmatic icons since templates have their own
        if (this.cardIcon) {
            this.cardIcon.setVisible(false);
        }
        if (this.geometricPattern) {
            this.geometricPattern.setVisible(false);
        }
    }

    createCardContent() {
        // Card title
        this.titleText = this.scene.add.text(0, -120, this.cardData.title, {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#1B5E20',
            align: 'center',
            wordWrap: { width: 180 }
        }).setOrigin(0.5);
        
        // Card description
        this.descriptionText = this.scene.add.text(0, -80, this.cardData.description, {
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
            fill: '#2E7D32',
            align: 'center',
            wordWrap: { width: 170 }
        }).setOrigin(0.5);
        
        // Card icon based on type
        this.cardIcon = this.createCardIcon();
        
        // Islamic geometric pattern
        this.geometricPattern = this.createGeometricPattern();
        
        // Add content to front (hidden initially)
        this.titleText.setVisible(false);
        this.descriptionText.setVisible(false);
        if (this.cardIcon) this.cardIcon.setVisible(false);
        if (this.geometricPattern) this.geometricPattern.setVisible(false);
        
        this.add([this.titleText, this.descriptionText]);
        if (this.cardIcon) this.add(this.cardIcon);
        if (this.geometricPattern) this.add(this.geometricPattern);
    }

    createCardIcon() {
        const iconGraphics = this.scene.add.graphics();
        
        switch (this.cardType) {
            case 'blessing':
                // Star of blessing
                iconGraphics.fillStyle(0xFFD700);
                this.drawStar(iconGraphics, 0, -20, 8, 15, 8);
                iconGraphics.lineStyle(2, 0x1B5E20);
                this.drawStarOutline(iconGraphics, 0, -20, 8, 15, 8);
                break;
                
            case 'challenge':
                // Cresceant moon
                iconGraphics.fillStyle(0x2E7D32);
                iconGraphics.fillCircle(-5, -20, 12);
                iconGraphics.fillStyle(0xFFFFFF);
                iconGraphics.fillCircle(0, -20, 12);
                break;
                
            case 'knowledge':
                // Book icon
                iconGraphics.fillStyle(0x1B5E20);
                iconGraphics.fillRoundedRect(-15, -30, 30, 20, 3);
                iconGraphics.lineStyle(1, 0xFFD700);
                iconGraphics.strokeRoundedRect(-15, -30, 30, 20, 3);
                // Pages
                iconGraphics.lineStyle(1, 0xFFD700);
                iconGraphics.lineBetween(-10, -25, 10, -25);
                iconGraphics.lineBetween(-10, -20, 10, -20);
                iconGraphics.lineBetween(-10, -15, 5, -15);
                break;
                
            case 'wisdom':
                // Mosque dome
                iconGraphics.fillStyle(0x2E7D32);
                iconGraphics.fillCircle(0, -25, 15);
                iconGraphics.fillTriangle(-3, -35, 3, -35, 0, -45);
                iconGraphics.fillStyle(0xFFD700);
                iconGraphics.fillCircle(0, -42, 2);
                break;
                
            default:
                // Default Islamic star
                iconGraphics.fillStyle(0xFFD700);
                this.drawStar(iconGraphics, 0, -20, 8, 12, 6);
                break;
        }
        
        return iconGraphics;
    }

    createGeometricPattern() {
        const pattern = this.scene.add.graphics();
        pattern.lineStyle(1, 0x1B5E20, 0.3);
        
        // Simple Islamic geometric pattern
        const centerX = 0;
        const centerY = 20;
        const radius = 25;
        
        // Octagon
        for (let i = 0; i < 8; i++) {
            const angle1 = (i * Math.PI * 2) / 8;
            const angle2 = ((i + 1) * Math.PI * 2) / 8;
            
            const x1 = centerX + Math.cos(angle1) * radius;
            const y1 = centerY + Math.sin(angle1) * radius;
            const x2 = centerX + Math.cos(angle2) * radius;
            const y2 = centerY + Math.sin(angle2) * radius;
            
            pattern.lineBetween(x1, y1, x2, y2);
        }
        
        // Inner star
        for (let i = 0; i < 8; i += 2) {
            const angle = (i * Math.PI * 2) / 8;
            const x = centerX + Math.cos(angle) * (radius * 0.6);
            const y = centerY + Math.sin(angle) * (radius * 0.6);
            
            if (i === 0) {
                pattern.moveTo(x, y);
            } else {
                pattern.lineTo(x, y);
            }
        }
        pattern.closePath();
        pattern.strokePath();
        
        return pattern;
    }

    drawStar(graphics, x, y, points, outerRadius, innerRadius) {
        const step = Math.PI / points;
        let path = [];
        
        for (let i = 0; i <= points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step - Math.PI / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                path.push(['moveTo', px, py]);
            } else {
                path.push(['lineTo', px, py]);
            }
        }
        
        path.push(['closePath']);
        
        graphics.beginPath();
        path.forEach(([method, ...args]) => {
            graphics[method](...args);
        });
        graphics.fillPath();
    }

    drawStarOutline(graphics, x, y, points, outerRadius, innerRadius) {
        const step = Math.PI / points;
        let path = [];
        
        for (let i = 0; i <= points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step - Math.PI / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                path.push(['moveTo', px, py]);
            } else {
                path.push(['lineTo', px, py]);
            }
        }
        
        path.push(['closePath']);
        
        graphics.beginPath();
        path.forEach(([method, ...args]) => {
            graphics[method](...args);
        });
        graphics.strokePath();
    }

    updateCardBorder() {
        this.cardBorder.clear();
        
        let borderColor;
        switch (this.cardType) {
            case 'blessing':
                borderColor = 0xFFD700; // Gold
                break;
            case 'challenge':
                borderColor = 0xFF6B6B; // Red
                break;
            case 'knowledge':
                borderColor = 0x4CAF50; // Green
                break;
            case 'wisdom':
                borderColor = 0x2196F3; // Blue
                break;
            default:
                borderColor = 0x9E9E9E; // Gray
                break;
        }
        
        this.cardBorder.lineStyle(this.isSelected ? 4 : 2, borderColor, this.isSelected ? 1 : 0.8);
        this.cardBorder.strokeRoundedRect(-100, -150, 200, 300, 20);
        
        if (this.isSelected) {
            // Add glow effect
            this.cardBorder.lineStyle(8, borderColor, 0.3);
            this.cardBorder.strokeRoundedRect(-102, -152, 204, 304, 22);
        }
    }

    setupInteractions() {
        this.setSize(200, 300);
        this.setInteractive();
        
        // Hover effects
        this.on('pointerover', this.onHover, this);
        this.on('pointerout', this.onHoverOut, this);
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointerup', this.onPointerUp, this);
    }

    onHover() {
        if (!this.isPlayable) return;
        
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            y: this.y - 10,
            duration: 200,
            ease: 'Power2'
        });
        
        // Show card details if not flipped
        if (!this.isFlipped) {
            this.flip(true);
        }
    }

    onHoverOut() {
        if (!this.isPlayable) return;
        
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            y: this.y + 10,
            duration: 200,
            ease: 'Power2'
        });
        
        // Hide card details if not selected
        if (!this.isSelected && this.isFlipped) {
            this.flip(false);
        }
    }

    onPointerDown() {
        if (!this.isPlayable) return;
        
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100,
            ease: 'Power2'
        });
    }

    onPointerUp() {
        if (!this.isPlayable) return;
        
        this.scene.tweens.add({
            targets: this,
            scaleX: this.isSelected ? 1.1 : 1,
            scaleY: this.isSelected ? 1.1 : 1,
            duration: 100,
            ease: 'Power2'
        });
        
        // Toggle selection
        this.toggleSelection();
        
        // Emit card played event
        this.emit('cardPlayed', this);
    }

    flip(showFront) {
        if (this.isFlipped === showFront) return;
        
        this.isFlipped = showFront;
        
        // Flip animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                // Switch card faces
                this.cardBack.setVisible(!showFront);
                this.cardFront.setVisible(showFront);
                this.titleText.setVisible(showFront);
                this.descriptionText.setVisible(showFront);
                if (this.cardIcon) this.cardIcon.setVisible(showFront);
                if (this.geometricPattern) this.geometricPattern.setVisible(showFront);
                
                // Flip back
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1,
                    duration: 150,
                    ease: 'Power2'
                });
            }
        });
    }

    toggleSelection() {
        this.isSelected = !this.isSelected;
        this.updateCardBorder();
        
        if (this.isSelected) {
            // Keep flipped when selected
            if (!this.isFlipped) {
                this.flip(true);
            }
        }
    }

    setPlayable(playable) {
        this.isPlayable = playable;
        this.alpha = playable ? 1 : 0.6;
        
        if (!playable) {
            this.disableInteractive();
        } else {
            this.setInteractive();
        }
    }

    playCard() {
        if (!this.isPlayable) return false;
        
        // Play animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0,
            rotation: Math.PI / 4,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
        
        // Play card sound
        if (this.scene.sound.get('card-flip')) {
            this.scene.sound.play('card-flip');
        }
        
        return true;
    }

    // Utility methods
    getCardData() {
        return {
            type: this.cardType,
            title: this.cardData.title,
            description: this.cardData.description,
            effect: this.cardData.effect
        };
    }

    applyEffect() {
        // Override in subclasses or handle in game scene
        return this.cardData.effect;
    }

    // Animation methods
    animateEntry(fromX, fromY, toX, toY, delay = 0) {
        this.x = fromX;
        this.y = fromY;
        this.alpha = 0;
        this.scaleX = 0.1;
        this.scaleY = 0.1;
        
        this.scene.time.delayedCall(delay, () => {
            this.scene.tweens.add({
                targets: this,
                x: toX,
                y: toY,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 600,
                ease: 'Back.easeOut'
            });
        });
    }

    animateGlow() {
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0.7 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    stopGlow() {
        this.scene.tweens.killTweensOf(this);
        this.alpha = 1;
    }
}

export default Card;