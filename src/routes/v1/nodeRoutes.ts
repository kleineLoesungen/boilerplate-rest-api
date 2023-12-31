import express from 'express'
import container from '../../containers/container';
import { NodeController } from '../../controllers/nodeController';
import { joiValidateNode, joiValidateNodeCreate } from '../../middlewares/joiValidateNodeMiddleware';
import { isLoggedIn } from '../../middlewares/authMiddleware';
import { joiValidateParamsId } from '../../middlewares/joiValidateGeneralMiddleware';

const routesNode = express.Router();
const nodeController = container.resolve<NodeController>('nodeController');

routesNode.post('/create', isLoggedIn, joiValidateNodeCreate, nodeController.createNode.bind(nodeController));
routesNode.get('/', nodeController.getNodes.bind(nodeController));
routesNode.get('/:id', joiValidateParamsId, nodeController.getNode.bind(nodeController));
routesNode.post('/:id/update', isLoggedIn, joiValidateNode, nodeController.updateNode.bind(nodeController));
routesNode.delete('/:id/delete', isLoggedIn, joiValidateParamsId, nodeController.deleteNode.bind(nodeController));

export { routesNode };