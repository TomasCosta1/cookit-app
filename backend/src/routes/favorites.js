const express = require('express');
const { promisePool } = require('../config/database');
const router = express.Router();

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'El ID de usuario debe ser un número válido'
            });
        }

        const query = `
            SELECT r.*, uxr.id as favorite_id
            FROM recipes r
            INNER JOIN usersXrecipes uxr ON r.id = uxr.recipe_id
            WHERE uxr.user_id = ?
            ORDER BY uxr.id DESC
        `;
        
        const [favorites] = await promisePool.execute(query, [userId]);
        
        res.status(200).json(favorites);
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

router.get('/check/:userId/:recipeId', async (req, res) => {
    try {
        const { userId, recipeId } = req.params;
        
        if (isNaN(userId) || isNaN(recipeId)) {
            return res.status(400).json({
                success: false,
                message: 'Los IDs deben ser números válidos'
            });
        }

        const query = `
            SELECT id FROM usersXrecipes 
            WHERE user_id = ? AND recipe_id = ?
        `;
        
        const [result] = await promisePool.execute(query, [userId, recipeId]);
        
        res.status(200).json({
            isFavorite: result.length > 0,
            favoriteId: result.length > 0 ? result[0].id : null
        });
    } catch (error) {
        console.error('Error al verificar favorito:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { user_id, recipe_id } = req.body;
        
        if (!user_id || !recipe_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id y recipe_id son campos obligatorios'
            });
        }

        if (isNaN(user_id) || isNaN(recipe_id)) {
            return res.status(400).json({
                success: false,
                message: 'Los IDs deben ser números válidos'
            });
        }

        const [existing] = await promisePool.execute(
            'SELECT id FROM usersXrecipes WHERE user_id = ? AND recipe_id = ?',
            [user_id, recipe_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'La receta ya está en favoritos'
            });
        }

        const [recipe] = await promisePool.execute(
            'SELECT id FROM recipes WHERE id = ?',
            [recipe_id]
        );

        if (recipe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Receta no encontrada'
            });
        }

        const query = `
            INSERT INTO usersXrecipes (user_id, recipe_id)
            VALUES (?, ?)
        `;
        
        const [result] = await promisePool.execute(query, [user_id, recipe_id]);
        
        res.status(201).json({
            success: true,
            message: 'Receta agregada a favoritos',
            favoriteId: result.insertId
        });
    } catch (error) {
        console.error('Error al agregar favorito:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

router.delete('/:userId/:recipeId', async (req, res) => {
    try {
        const { userId, recipeId } = req.params;
        
        if (isNaN(userId) || isNaN(recipeId)) {
            return res.status(400).json({
                success: false,
                message: 'Los IDs deben ser números válidos'
            });
        }

        const query = `
            DELETE FROM usersXrecipes 
            WHERE user_id = ? AND recipe_id = ?
        `;
        
        const [result] = await promisePool.execute(query, [userId, recipeId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Receta eliminada de favoritos'
        });
    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

module.exports = router;
