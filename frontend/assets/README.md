# Islamic Quiz Card Game - Asset Requirements

## Directory Structure
```
assets/
├── cards/
│   ├── card-back.png (200x300px)
│   ├── card-template-blessing.png (200x300px)
│   ├── card-template-challenge.png (200x300px)
│   ├── card-template-knowledge.png (200x300px)
│   └── card-template-wisdom.png (200x300px)
├── backgrounds/
│   ├── bg-menu.jpg (1920x1080px)
│   ├── bg-game.jpg (1920x1080px)
│   ├── bg-lobby.jpg (1920x1080px)
│   └── bg-victory.jpg (1920x1080px)
└── ui/
    ├── button-primary.png
    ├── button-secondary.png
    └── frame-gold.png
```

## Image Specifications

### Card Designs (200x300px, PNG with transparency)

1. **card-back.png**
   - Deep emerald green background (#1B5E20)
   - Intricate gold (#FFD700) geometric arabesque patterns
   - 8-pointed star in center
   - Delicate calligraphy border

2. **card-template-blessing.png**
   - Golden sunrise background with subtle rays
   - Ornate Islamic frame with geometric patterns
   - Empty center area for text (120x180px)
   - Golden star motif at top

3. **card-template-challenge.png**
   - Deep red gradient background (#FF6B6B to #D32F2F)
   - Crescent moon symbol at top
   - Islamic geometric border pattern
   - Empty text area in center (120x180px)

4. **card-template-knowledge.png**
   - Emerald green background (#4CAF50)
   - Open Quran book motif at top
   - Islamic geometric patterns
   - Golden accents

5. **card-template-wisdom.png**
   - Deep blue gradient (#2196F3)
   - Mosque dome silhouette at top
   - Stars and crescent moon
   - Islamic geometric frame

### Background Images (1920x1080px, JPEG)

1. **bg-menu.jpg**
   - Serene mosque courtyard with fountain
   - Lush greenery
   - Islamic geometric tile patterns
   - Golden hour lighting

2. **bg-game.jpg**
   - Grand mosque library interior
   - Ornate wooden shelves
   - Islamic geometric patterns on ceiling
   - Warm ambient lighting

3. **bg-lobby.jpg**
   - Elegant majlis (meeting hall)
   - Ornate carpets
   - Arched doorways
   - Traditional seating

4. **bg-victory.jpg**
   - Night sky with crescent moon and stars
   - Silhouette of mosque minarets
   - Golden fireworks in geometric patterns
   - Celebration atmosphere

## Notes
- All images will be loaded in BootScene.js
- The game will use placeholder graphics if images are not found
- Images should be optimized for web use (compressed but high quality)
- Consider creating @2x versions for high-DPI displays