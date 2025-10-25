const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  }
}, {
  tableName: 'users',
});


// ---------- FUNCIONES DE USUARIO Y FOLLOW ----------
async function findUserByEmail(email) {
  return await User.findOne({ where: { email } });
}

async function createUser({ username, email, passwordHash, role, provider }) {
  const user = await User.create({
    username,
    email,
    password: passwordHash,
    role,
    provider,
    is_verified: false
  });
  return user.id;
}

// Seguir usuario
async function followUser(followerId, followedId) {
  await sequelize.query(
    `INSERT INTO follows (follower_id, followed_id)
     SELECT ?, ?
     WHERE NOT EXISTS (
       SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?
     )`,
    { replacements: [followerId, followedId, followerId, followedId] }
  );
}

// Dejar de seguir usuario
async function unfollowUser(followerId, followedId) {
  await sequelize.query(
    `DELETE FROM follows WHERE follower_id = ? AND followed_id = ?`,
    { replacements: [followerId, followedId] }
  );
}

// Obtener seguidores
async function getFollowers(userId) {
  const [rows] = await sequelize.query(
    `SELECT u.id, u.username
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.followed_id = ?`,
    { replacements: [userId] }
  );
  return rows;
}

// Obtener a quién sigue
async function getFollowing(userId) {
  const [rows] = await sequelize.query(
    `SELECT u.id, u.username
     FROM follows f
     JOIN users u ON f.followed_id = u.id
     WHERE f.follower_id = ?`,
    { replacements: [userId] }
  );
  return rows;
}


module.exports = {
  User,
  findUserByEmail,
  createUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};
