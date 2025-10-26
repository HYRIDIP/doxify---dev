const express = require('express');
const router = express.Router();
const db = require('../database/init');

// Страница профиля пользователя
router.get('/:username', (req, res) => {
    const username = req.params.username;
    
    db.get(
        'SELECT id, username, email, avatar_url, banner_url, created_at FROM users WHERE username = ?',
        [username],
        (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            
            if (!user) {
                return res.status(404).send('User not found');
            }
            
            // Получаем все пасты пользователя
            db.all(
                `SELECT p.*, 
                        (SELECT COUNT(*) FROM paste_likes WHERE paste_id = p.id) as likes,
                        (SELECT COUNT(*) FROM paste_views WHERE paste_id = p.id) as views
                 FROM pastes p 
                 WHERE p.user_id = ? 
                 ORDER BY p.created_at DESC`,
                [user.id],
                (err, pastes) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Database error');
                    }
                    
                    res.render('pages/profile', {
                        user: req.session.user,
                        profileUser: user,
                        pastes: pastes || []
                    });
                }
            );
        }
    );
});

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
        // Валидация URL
        try {
            new URL(avatarUrl);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL' });
        }

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
        console.error('Error updating avatar:', error);
        res.status(500).json({ error: 'Failed to update avatar' });
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
        // Валидация URL
        try {
            new URL(bannerUrl);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL' });
        }

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
        console.error('Error updating banner:', error);
        res.status(500).json({ error: 'Failed to update banner' });
    }
});

// Получение настроек профиля (для AJAX)
router.get('/settings/data', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    db.get(
        'SELECT avatar_url, banner_url FROM users WHERE id = ?',
        [req.session.user.id],
        (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
                avatar_url: user.avatar_url,
                banner_url: user.banner_url
            });
        }
    );
});

// Удаление аватара
router.post('/remove-avatar', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    db.run(
        'UPDATE users SET avatar_url = NULL WHERE id = ?',
        [req.session.user.id],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, message: 'Avatar removed successfully' });
        }
    );
});

// Удаление баннера
router.post('/remove-banner', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    db.run(
        'UPDATE users SET banner_url = NULL WHERE id = ?',
        [req.session.user.id],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, message: 'Banner removed successfully' });
        }
    );
});

module.exports = router;
