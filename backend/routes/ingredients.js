const express = require('express');
const { promisePool } = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
    const { q } = req.query;
    const limitParam = parseInt(req.query.limit, 10);
    const pageParam = parseInt(req.query.page, 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;
    const requestedPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

    let where = '';
    const whereParams = [];
    if (q && String(q).trim() !== '') {
        where = ' WHERE name LIKE ?';
        const like = `%${q}%`;
        whereParams.push(like);
    }

    try {
        const [countRows] = await promisePool.execute(
            `SELECT COUNT(*) AS total FROM ingredients${where}`,
            whereParams
        );
        const total = countRows[0]?.total ?? 0;
        const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
        const page = Math.min(requestedPage, totalPages);
        const offset = (page - 1) * limit;

        const params = [...whereParams, limit, offset];
        const [rows] = await promisePool.execute(
            `SELECT * FROM ingredients${where} ORDER BY name ASC LIMIT ? OFFSET ?`,
            params
        );

        return res.json({ page, limit, total, totalPages, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;