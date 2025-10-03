// src/models/User.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

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
    allowNull: true, // Puede ser null para Google
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
  tableName: 'users'
});

// Buscar usuario por email
async function findUserByEmail(email) {
  return await User.findOne({ where: { email } });
}

// Crear usuario
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

module.exports = {
  User,
  findUserByEmail,
  createUser
};




