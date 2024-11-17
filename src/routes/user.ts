import { Hono } from 'hono';
import { UserController } from '../controllers/userController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const userController = new UserController();
const authMiddleware = new AuthMiddleware();

export const userRoutes = new Hono();


userRoutes.post('/signup', userController.signUp.bind(userController));
userRoutes.get('/verify-email', userController.verifyEmail.bind(userController));
userRoutes.post('/signin', userController.signIn.bind(userController));