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

module.exports = router