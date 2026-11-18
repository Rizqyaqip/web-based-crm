const express = require('express');
const authController = require('./auth_controller');

const authRouter = express.Router();
const userRouter = express.Router();

authRouter.post('/login', (req, res) => authController.login(req, res));

authRouter.get('/users', (req, res) => authController.getUsers(req, res));
authRouter.get('/users/:id', (req, res) => authController.getUserById(req, res));
authRouter.post('/users', (req, res) => authController.createUser(req, res));
authRouter.put('/users/:id', (req, res) => authController.updateUser(req, res));
authRouter.delete('/users/:id', (req, res) => authController.deleteUser(req, res));

userRouter.get('/', (req, res) => authController.getUsers(req, res));
userRouter.get('/:id', (req, res) => authController.getUserById(req, res));
userRouter.post('/', (req, res) => authController.createUser(req, res));
userRouter.put('/:id', (req, res) => authController.updateUser(req, res));
userRouter.delete('/:id', (req, res) => authController.deleteUser(req, res));

module.exports = {
  authRouter,
  userRouter,
  auth_router: authRouter,
  user_router: userRouter
};
