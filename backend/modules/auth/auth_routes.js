const express = require('express');
const authController = require('./auth_controller');

const authRouter = express.Router();
const userRouter = express.Router();

// 1. Auth Router (/api/auth/...)
authRouter.post('/login', (req, res) => authController.login(req, res));

// Endpoint sub-rute /api/auth/users untuk kompatibilitas frontend api_config
authRouter.get('/users', (req, res) => authController.getUsers(req, res));
authRouter.get('/users/:id', (req, res) => authController.getUserById(req, res));
authRouter.post('/users', (req, res) => authController.createUser(req, res));
authRouter.put('/users/:id', (req, res) => authController.updateUser(req, res));
authRouter.delete('/users/:id', (req, res) => authController.deleteUser(req, res));

// 2. Direct User Router (/api/users/...)
userRouter.get('/', (req, res) => authController.getUsers(req, res));
userRouter.get('/:id', (req, res) => authController.getUserById(req, res));
userRouter.post('/', (req, res) => authController.createUser(req, res));
userRouter.put('/:id', (req, res) => authController.updateUser(req, res));
userRouter.delete('/:id', (req, res) => authController.deleteUser(req, res));

module.exports = {
  authRouter,
  userRouter,
  // Aliases for compatibility
  auth_router: authRouter,
  user_router: userRouter
};
