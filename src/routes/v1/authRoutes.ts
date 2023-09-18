import express from 'express'
import container from '../../containers/container';
import { UserController } from '../../controllers/userController';
import { joiValidateIsAdmin, joiValidateParamsId, joiValidatePassword, joiValidateUser, joiValidateUserId } from '../../middlewares/joiValidateAuthMiddleware';
import { isAdmin, isLoggedIn } from '../../middlewares/authMiddleware';

const routesAuth = express.Router();
const userController = container.resolve<UserController>('userController');

routesAuth.post('/signup', joiValidateUser, userController.createUser.bind(userController));
routesAuth.get('/users', isLoggedIn, isAdmin, userController.listUsers.bind(userController));
routesAuth.post('/login', joiValidateUser, userController.loginUser.bind(userController));
routesAuth.post('/logout', userController.logoutUser.bind(userController));
routesAuth.post('/self/update/name', isLoggedIn, joiValidateUserId, userController.updateUserName.bind(userController));
routesAuth.post('/self/update/password', isLoggedIn, joiValidatePassword, userController.updateUserPassword.bind(userController));
routesAuth.post('/self/update/role', isLoggedIn, joiValidateIsAdmin, userController.updateUserRole.bind(userController));
routesAuth.post('/users/:id/remove', isLoggedIn, isAdmin, joiValidateParamsId, userController.removeUser.bind(userController));

export { routesAuth };