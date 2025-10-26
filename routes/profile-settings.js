const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const db = require('../database/init');

// Функция для обработки и обрезки изображения
async function processImage(imageBuffer, width, height) {
    return await sharp(imageBuffer)
        .resize(width, height, {
            fit: 'cover',
            position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer();
}

// Обновление аватара
router.post('/update-avatar', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Загружаем изображение по URL
        const response = await fetch(avatarUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const imageBuffer = await response.arrayBuffer();
        
        // Обрабатываем и обрезаем изображение (150x150 для аватара)
        const processedImage = await processImage(Buffer.from(imageBuffer), 150, 150);
        
        // Сохраняем URL
        db.run(
            'UPDATE users SET avatar_url = ? WHERE id = ?',
            [avatarUrl, req.session.user.id],
            function(err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ success: true, message: 'Avatar updated successfully' });
            }
        );
    } catch (error) {
        console.error('Error processing avatar:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

// Обновление баннера
router.post('/update-banner', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { bannerUrl } = req.body;
    
    if (!bannerUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Загружаем изображение по URL
        const response = await fetch(bannerUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const imageBuffer = await response.arrayBuffer();
        
        // Обрабатываем и обрезаем изображение (1200x300 для баннера)
        const processedImage = await processImage(Buffer.from(imageBuffer), 1200, 300);
        
        // Сохраняем URL
        db.run(
            'UPDATE users SET banner_url = ? WHERE id = ?',
            [bannerUrl, req.session.user.id],
            function(err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ success: true, message: 'Banner updated successfully' });
            }
        );
    } catch (error) {
        console.error('Error processing banner:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

module.exports = router;
