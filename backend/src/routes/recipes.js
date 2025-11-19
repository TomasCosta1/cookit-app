const express = require('express');
const { promisePool } = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { categoryId, category } = req.query;

        let query = `
            SELECT 
                r.*,
                c.category_name
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
        `;

        const params = [];

        if (categoryId !== undefined && categoryId !== '') {
            if (isNaN(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: 'categoryId debe ser un número válido'
                });
            }
            query += ' WHERE r.category_id = ?';
            params.push(parseInt(categoryId, 10));
        } else if (category !== undefined && category !== '') {
            query += ' WHERE c.category_name = ?';
            params.push(String(category));
        }

        query += ' ORDER BY r.created_at DESC';

        const [recipes] = await promisePool.execute(query, params);

        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error al obtener recetas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// Servir imagen BLOB de la receta (si existe)
router.get('/:id/image', async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID debe ser un número válido'
            });
        }

        const [rows] = await promisePool.execute(
            'SELECT img FROM recipes WHERE id = ?',
            [id]
        );

        if (!rows || rows.length === 0 || !rows[0].img) {
            return res.status(404).end();
        }

        const imgBuffer = rows[0].img;

        let mime = 'application/octet-stream';
        if (imgBuffer && imgBuffer.length >= 4) {
            const b0 = imgBuffer[0];
            const b1 = imgBuffer[1];
            const b2 = imgBuffer[2];
            const b3 = imgBuffer[3];

            if (b0 === 0xFF && b1 === 0xD8) mime = 'image/jpeg';
            else if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4E && b3 === 0x47) mime = 'image/png';
            else if (b0 === 0x47 && b1 === 0x49 && b2 === 0x46 && b3 === 0x38) mime = 'image/gif';
            else if (imgBuffer.length >= 12 && imgBuffer.toString('ascii', 0, 4) === 'RIFF' && imgBuffer.toString('ascii', 8, 12) === 'WEBP') mime = 'image/webp';
        }

        res.setHeader('Content-Type', mime);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.end(imgBuffer);
    } catch (error) {
        console.error('Error al servir imagen de receta:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID debe ser un número válido'
            });
        }
        
        const query = `
            SELECT 
                r.*,
                c.category_name
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            WHERE r.id = ?
        `;
        
        const [recipes] = await promisePool.execute(query, [id]);
        
        if (recipes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Receta no encontrada'
            });
        }
        
        res.status(200).json(recipes[0]);
    } catch (error) {
        console.error('Error al obtener receta por ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

router.get('/:id/ingredients', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID debe ser un número válido'
            });
        }
        
        const [recipes] = await promisePool.execute(
            'SELECT id FROM recipes WHERE id = ?',
            [id]
        );
        
        if (recipes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Receta no encontrada'
            });
        }
        
        const query = `
            SELECT i.id, i.name 
            FROM recipe_ingredients ri 
            INNER JOIN ingredients i ON ri.ingredient_id = i.id 
            WHERE ri.recipe_id = ?
            ORDER BY i.name ASC
        `;
        
        const [ingredients] = await promisePool.execute(query, [id]);
        
        res.status(200).json({
            success: true,
            recipe_id: parseInt(id),
            ingredients: ingredients,
            total: ingredients.length
        });
    } catch (error) {
        console.error('Error al obtener ingredientes de la receta:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { user_id, title, description, steps, cook_time, difficulty, category_id, ingredient_ids, url_video } = req.body;
        
        // Validaciones obligatorias
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'user_id es obligatorio' });
        }
        if (!title || String(title).trim() === '') {
            return res.status(400).json({ success: false, message: 'title es obligatorio' });
        }
        if (!description || String(description).trim() === '') {
            return res.status(400).json({ success: false, message: 'description es obligatorio' });
        }
        if (!steps || String(steps).trim() === '') {
            return res.status(400).json({ success: false, message: 'steps es obligatorio' });
        }
        if (!Array.isArray(ingredient_ids) || ingredient_ids.length === 0) {
            return res.status(400).json({ success: false, message: 'ingredients es obligatorio (ingredient_ids debe contener al menos 1 id)' });
        }
        if (!category_id || category_id === '' || category_id === null || category_id === undefined) {
            return res.status(400).json({ success: false, message: 'category_id es obligatorio' });
        }
        if (!url_video || String(url_video).trim() === '') {
            return res.status(400).json({ success: false, message: 'url_video es obligatorio' });
        }
        
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (difficulty && !validDifficulties.includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: 'difficulty debe ser: easy, medium o hard'
            });
        }
        
        if (cook_time && (isNaN(cook_time) || cook_time < 0)) {
            return res.status(400).json({
                success: false,
                message: 'cook_time debe ser un número positivo'
            });
        }

        if (isNaN(category_id) || category_id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'category_id debe ser un número válido'
            });
        }
        const [categoryCheck] = await promisePool.execute(
            'SELECT id FROM categories WHERE id = ?',
            [parseInt(category_id)]
        );
        if (categoryCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'La categoría especificada no existe'
            });
        }
        
        // Transacción: crear receta y asociar ingredientes
        const conn = await promisePool.getConnection();
        try {
            await conn.beginTransaction();

            const insertSql = `
                INSERT INTO recipes (user_id, title, description, steps, cook_time, difficulty, category_id, url_video)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await conn.execute(insertSql, [
                user_id,
                String(title).trim(),
                String(description).trim(),
                String(steps).trim(),
                cook_time || null,
                difficulty || 'easy',
                parseInt(category_id),
                String(url_video).trim()
            ]);

            const recipeId = result.insertId;

            // Normalizar IDs de ingredientes
            const ids = [...new Set(ingredient_ids
                .map((v) => parseInt(v, 10))
                .filter((n) => Number.isFinite(n) && n > 0))];

            if (ids.length === 0) {
                throw new Error('ingredient_ids inválidos');
            }

            const placeholders = ids.map(() => '(?, ?)').join(', ');
            const params = ids.flatMap((ingId) => [recipeId, ingId]);
            await conn.execute(
                `INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES ${placeholders}`,
                params
            );

            await conn.commit();

            const [newRecipe] = await promisePool.execute(
                'SELECT * FROM recipes WHERE id = ?',
                [recipeId]
            );

            res.status(201).json(newRecipe[0]);
        } catch (txErr) {
            try { await conn.rollback(); } catch (_) {}
            throw txErr;
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error('Error al crear receta:', error);
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'El usuario especificado no existe'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, steps, cook_time, difficulty } = req.body;
        
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID debe ser un número válido'
            });
        }
        
        const [existingRecipe] = await promisePool.execute(
            'SELECT * FROM recipes WHERE id = ?',
            [id]
        );
        
        if (existingRecipe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Receta no encontrada'
            });
        }
        
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (difficulty && !validDifficulties.includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: 'difficulty debe ser: easy, medium o hard'
            });
        }
        
        if (cook_time && (isNaN(cook_time) || cook_time < 0)) {
            return res.status(400).json({
                success: false,
                message: 'cook_time debe ser un número positivo'
            });
        }
        
        const updates = [];
        const values = [];
        
        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (steps !== undefined) {
            updates.push('steps = ?');
            values.push(steps);
        }
        if (cook_time !== undefined) {
            updates.push('cook_time = ?');
            values.push(cook_time);
        }
        if (difficulty !== undefined) {
            updates.push('difficulty = ?');
            values.push(difficulty);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }
        
        values.push(id);
        
        const query = `UPDATE recipes SET ${updates.join(', ')} WHERE id = ?`;
        
        await promisePool.execute(query, values);
        
        const [updatedRecipe] = await promisePool.execute(
            'SELECT * FROM recipes WHERE id = ?',
            [id]
        );
        
        res.status(200).json(updatedRecipe[0]);
    } catch (error) {
        console.error('Error al actualizar receta:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID debe ser un número válido'
            });
        }
        
        const [existingRecipe] = await promisePool.execute(
            'SELECT * FROM recipes WHERE id = ?',
            [id]
        );
        
        if (existingRecipe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Receta no encontrada'
            });
        }
        
        await promisePool.execute('DELETE FROM recipes WHERE id = ?', [id]);
        
        res.status(200).json({
            message: 'Receta eliminada exitosamente',
            data: existingRecipe[0]
        });
    } catch (error) {
        console.error('Error al eliminar receta:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

module.exports = router;

