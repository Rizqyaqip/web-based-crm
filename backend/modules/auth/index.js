const authRepository = require('./auth_repository');
const authService = require('./auth_service');
const authController = require('./auth_controller');
const { authRouter, userRouter } = require('./auth_routes');

module.exports = {
  authRepository,
  authService,
  authController,
  authRouter,
  userRouter
};

