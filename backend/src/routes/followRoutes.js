const express = require("express");
const router = express.Router();
const { executeQuery } = require("../config/database");

// Seguir a un usuario
router.post("/follow", async (req, res) => {
  const { followerId, followedId } = req.body;

  if (!followerId || !followedId) {
    return res.status(400).json({ message: "Debe enviar followerId y followedId" });
  }

  if (followerId === parseInt(followedId)) {
    return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
  }

  try {
    await executeQuery(
      "INSERT INTO follows (follower_id, followed_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=id",
      [followerId, followedId]
    );

    res.json({ message: "Usuario seguido correctamente" });
  } catch (err) {
    console.error("Error al seguir usuario:", err);
    res.status(500).json({ message: "Error al seguir usuario" });
  }
});

// Dejar de seguir a un usuario
router.post("/unfollow", async (req, res) => {
  const { followerId, followedId } = req.body;

  if (!followerId || !followedId) {
    return res.status(400).json({ message: "Debe enviar followerId y followedId" });
  }

  try {
    await executeQuery(
      "DELETE FROM follows WHERE follower_id = ? AND followed_id = ?",
      [followerId, followedId]
    );

    res.json({ message: "Usuario dejado de seguir correctamente" });
  } catch (err) {
    console.error("Error al dejar de seguir usuario:", err);
    res.status(500).json({ message: "Error al dejar de seguir usuario" });
  }
});

// Obtener seguidores de un usuario
router.get("/users/:id/followers", async (req, res) => {
  const { id } = req.params;
  try {
    const followers = await executeQuery(
      `SELECT u.id, u.username 
       FROM follows f 
       JOIN users u ON f.follower_id = u.id 
       WHERE f.followed_id = ?`,
      [id]
    );
    res.json({ followers });
  } catch (err) {
    console.error("Error al obtener followers:", err);
    res.status(500).json({ followers: [] });
  }
});

// Obtener usuarios a los que sigue un usuario
router.get("/users/:id/following", async (req, res) => {
  const { id } = req.params;
  try {
    const following = await executeQuery(
      `SELECT u.id, u.username 
       FROM follows f 
       JOIN users u ON f.followed_id = u.id 
       WHERE f.follower_id = ?`,
      [id]
    );
    res.json({ following });
  } catch (err) {
    console.error("Error al obtener following:", err);
    res.status(500).json({ following: [] });
  }
});

module.exports = router;
