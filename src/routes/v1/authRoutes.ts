import express from 'express'
import container from '../../containers/container';
import { UserController } from '../../controllers/userController';
import { joiValidateBodyName, joiValidateBodyIsAdmin, joiValidateBodyPassword, joiValidateBodyUser, joiValidateBodyLoginUser } from '../../middlewares/joiValidateAuthMiddleware';
import { isAdmin, isLoggedIn } from '../../middlewares/authMiddleware';
import { SessionTokenController } from '../../controllers/sessionTokenController';
import { SessionController } from '../../controllers/sessionController';
import { joiValidateParamsId } from '../../middlewares/joiValidateGeneralMiddleware';

const routesAuth = express.Router();
const userController = container.resolve<UserController>('userController');
const sessionController = container.resolve<SessionController>('sessionController');
const sessionTokenController = container.resolve<SessionTokenController>('sessionTokenController');

// general
routesAuth.post('/signup', joiValidateBodyLoginUser, userController.createUser.bind(userController));
routesAuth.get('/users', isLoggedIn, isAdmin, userController.listUsers.bind(userController));
routesAuth.post('/login', joiValidateBodyLoginUser, userController.loginUser.bind(userController));
routesAuth.post('/logout', userController.logoutUser.bind(userController));

// user actions
routesAuth.post('/self/update/name', isLoggedIn, joiValidateBodyUser, userController.updateUserName.bind(userController));
routesAuth.post('/self/update/password', isLoggedIn, joiValidateBodyPassword, userController.updateUserPassword.bind(userController));

// user admin actions
routesAuth.delete('/users/:id/remove', isLoggedIn, isAdmin, joiValidateParamsId, userController.removeUser.bind(userController));
routesAuth.post('/users/:id/update/role', isLoggedIn, isAdmin, joiValidateParamsId, joiValidateBodyIsAdmin, userController.updateUserRole.bind(userController));

// user sessions
routesAuth.get('/self/sessions', isLoggedIn, sessionController.getUserSessions.bind(sessionController));
routesAuth.delete('/self/sessions/:id/remove', isLoggedIn, joiValidateParamsId, sessionController.removeClientSession.bind(sessionController));

// user api tokens
routesAuth.post('/self/tokens/create', isLoggedIn, joiValidateBodyName, sessionTokenController.createSessionToken.bind(sessionTokenController));
routesAuth.get('/self/tokens', isLoggedIn, sessionTokenController.getSessionTokens.bind(sessionTokenController));
routesAuth.post('/self/tokens/:id/update/name', isLoggedIn, joiValidateParamsId, joiValidateBodyName, sessionTokenController.updateSessionToken.bind(sessionTokenController));
routesAuth.delete('/self/tokens/:id/remove', isLoggedIn, joiValidateParamsId, sessionTokenController.removeSessionToken.bind(sessionTokenController));

export { routesAuth };