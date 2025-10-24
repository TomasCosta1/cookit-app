const express = require('express');
const { promisePool } = require('../config/database');
const router = express.Router();

router.get('/by-ingredients/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'El ID de usuario debe ser un número válido'
            });
        }

        const { userIngredients } = req.query;
        
        if (!userIngredients) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren los ingredientes del usuario'
            });
        }

        let ingredientIds;
        try {
            ingredientIds = JSON.parse(userIngredients);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Formato de ingredientes inválido'
            });
        }

        if (!Array.isArray(ingredientIds) || ingredientIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere al menos un ingrediente'
            });
        }

        const placeholders = ingredientIds.map(() => '?').join(',');
        
        const query = `
            SELECT 
                r.*,
                COUNT(ri.ingredient_id) as matching_ingredients,
                GROUP_CONCAT(ri.ingredient_id) as matched_ingredient_ids,
                GROUP_CONCAT(i.name) as matched_ingredient_names
            FROM recipes r
            INNER JOIN recipe_ingredients ri ON r.id = ri.recipe_id
            INNER JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.ingredient_id IN (${placeholders})
            GROUP BY r.id
            HAVING matching_ingredients > 0
            ORDER BY matching_ingredients DESC, r.created_at DESC
        `;
        
        const [recipes] = await promisePool.execute(query, ingredientIds);
        
        const enrichedRecipes = await Promise.all(
            recipes.map(async (recipe) => {
                const [allIngredients] = await promisePool.execute(
                    `SELECT i.id, i.name 
                     FROM recipe_ingredients ri 
                     INNER JOIN ingredients i ON ri.ingredient_id = i.id 
                     WHERE ri.recipe_id = ?`,
                    [recipe.id]
                );
                
                const matchedIds = recipe.matched_ingredient_ids.split(',').map(id => parseInt(id));
                const missingIngredients = allIngredients.filter(
                    ing => !matchedIds.includes(ing.id)
                );
                
                return {
                    ...recipe,
                    total_ingredients: allIngredients.length,
                    missing_ingredients: missingIngredients,
                    missing_count: missingIngredients.length,
                    match_percentage: Math.round((recipe.matching_ingredients / allIngredients.length) * 100)
                };
            })
        );
        
        res.status(200).json({
            success: true,
            recipes: enrichedRecipes,
            total: enrichedRecipes.length,
            user_ingredients_count: ingredientIds.length
        });
        
    } catch (error) {
        console.error('Error al filtrar recetas por ingredientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { userIngredients } = req.query;
        
        if (!userIngredients) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren los ingredientes del usuario'
            });
        }

        let ingredientIds;
        try {
            ingredientIds = JSON.parse(userIngredients);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Formato de ingredientes inválido'
            });
        }

        const placeholders = ingredientIds.map(() => '?').join(',');
        
        const query = `
            SELECT 
                COUNT(DISTINCT r.id) as total_recipes,
                COUNT(DISTINCT CASE WHEN ri.ingredient_id IS NOT NULL THEN r.id END) as recipes_with_matches,
                AVG(CASE WHEN ri.ingredient_id IS NOT NULL THEN 1 ELSE 0 END) as avg_matching_ingredients
            FROM recipes r
            LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id AND ri.ingredient_id IN (${placeholders})
        `;
        
        const [stats] = await promisePool.execute(query, ingredientIds);
        
        res.status(200).json({
            success: true,
            stats: stats[0] || {
                total_recipes: 0,
                recipes_with_matches: 0,
                avg_matching_ingredients: 0
            }
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

router.get('/debug-user-ingredients', async (req, res) => {
    try {
        const { userIngredients } = req.query;
        
        if (!userIngredients) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren los ingredientes del usuario'
            });
        }

        let ingredientIds;
        try {
            ingredientIds = JSON.parse(userIngredients);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Formato de ingredientes inválido'
            });
        }

        const placeholders = ingredientIds.map(() => '?').join(',');
        const query = `SELECT id, name FROM ingredients WHERE id IN (${placeholders})`;
        const [ingredients] = await promisePool.execute(query, ingredientIds);
        
        res.json({
            success: true,
            user_ingredient_ids: ingredientIds,
            found_ingredients: ingredients,
            total_found: ingredients.length
        });
        
    } catch (error) {
        console.error('Error en debug-user-ingredients:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});


module.exports = router;
