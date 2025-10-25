const express = require("express");
const router = express.Router();
const { User, getFollowers, getFollowing } = require("../models/User");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../config/database");

// Buscar usuarios por username
router.get("/users/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.findAll({
      where: {
        username: {
          [Op.like]: `%${q}%`
        }
      },
      attributes: ["id", "username"],
      order: [
        [sequelize.literal("CASE WHEN username LIKE ? THEN 1 ELSE 2 END"), "ASC"],
        ["username", "ASC"]
      ],
      limit: 10,
      replacements: [`${q}%`]
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al buscar usuarios" });
  }
});


// Obtener perfil de usuario por ID, incluyendo seguidores y seguidos
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ["id", "username", "email", "role", "provider", "is_verified"]
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const followers = await getFollowers(id);
    const following = await getFollowing(id);

    res.json({ user, followers, following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});


module.exports = router;
