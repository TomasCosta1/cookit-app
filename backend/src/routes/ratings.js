const express = require('express')
const { promisePool } = require('../config/database')
const router = express.Router()

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID debe ser un número válido'
            })
        }

        const query = `SELECT AVG(rating) as average FROM ratings WHERE recipe_id = ?`

        const [mean] = await promisePool.execute(query, [id])

        let meanValue = mean[0].average

        if (meanValue === null) {meanValue = 0} else {meanValue = parseFloat(meanValue)}

        res.status(200).json(meanValue)
    } catch (error) {
        console.error('Error buscando las calificaciones de la receta')
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
})

router.post('/', async (req, res) => {
    try {
        const { user_id, recipe_id, rating } = req.body;

        if (!user_id || !recipe_id || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: 'user_id, recipe_id y rating son campos obligatorios'
            })
        }

        if (isNaN(user_id) || isNaN(recipe_id) || isNaN(rating)) {
            return res.status(400).json({
                success: false,
                message: 'Los IDs y rating deben ser números válidos'
            })
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'El rating debe estar entre 1 y 5'
            })
        }

        const [existing] = await promisePool.execute(
            'SELECT id FROM ratings WHERE user_id = ? AND recipe_id = ?',
            [user_id, recipe_id]
        )

        if (existing.length > 0) {
            await promisePool.execute(
                'UPDATE ratings SET rating = ? WHERE user_id = ? AND recipe_id = ?',
                [rating, user_id, recipe_id]
            )

            return res.status(200).json({
                success: true,
                message: 'Rating actualizado exitosamente'
            })
        } else {
            await promisePool.execute(
                'INSERT INTO ratings (user_id, recipe_id, rating) VALUES (?, ?, ?)',
                [user_id, recipe_id, rating]
            )

            return res.status(201).json({
                success: true,
                message: 'Rating creado exitosamente'
            })
        }
    } catch (error) {
        console.error('Error al guardar rating:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
})

module.exports = router