const express = require('express');
const { promisePool } = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const query = `SELECT * FROM recipes r ORDER BY r.created_at DESC`;

        const [recipes] = await promisePool.execute(query);
        
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

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID debe ser un número válido'
            });
        }
        
        const query = `SELECT * FROM recipes r WHERE r.id = ?`;
        
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

router.post('/', async (req, res) => {
    try {
        const { user_id, title, description, steps, cook_time, difficulty } = req.body;
        
        if (!user_id || !title) {
            return res.status(400).json({
                success: false,
                message: 'user_id y title son campos obligatorios'
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
        
        const query = `
            INSERT INTO recipes (user_id, title, description, steps, cook_time, difficulty)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await promisePool.execute(query, [
            user_id,
            title,
            description || null,
            steps || null,
            cook_time || null,
            difficulty || 'easy'
        ]);
        
        const [newRecipe] = await promisePool.execute(
            'SELECT * FROM recipes WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newRecipe[0]);
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

