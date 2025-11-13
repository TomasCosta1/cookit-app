const express = require('express');
const { promisePool } = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const query = `SELECT * FROM categories`;

        const [categories] = await promisePool.execute(query);

        res.status(200).json(categories);
    } catch (error) {
        console.error('Error al obtener las categorias:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
})

router.get('/:id', async (req, res) => {
    try {

        const {id} = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID debe ser un número válido'
            });
        }

        const query = `SELECT * FROM categories WHERE id = ?`;

        const [recipes] = await promisePool.execute(query, [id])

        if (recipes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.status(200).json(recipes)

    } catch (error) {
        console.error('Error al obtener la categoria:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
})

module.exports = router;