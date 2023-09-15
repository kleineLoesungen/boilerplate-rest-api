import express from 'express'
import container from '../../containers/container';
import { NodeController } from '../../controllers/nodeController';
import { joiValidateNode, joiValidateNodeCreate, joiValidateUuid } from '../../middleware/joiValidateMiddleware';

const routesNode = express.Router();
const nodeController = container.resolve<NodeController>('nodeController');

routesNode.post('/create', joiValidateNodeCreate, nodeController.createNode.bind(nodeController));
routesNode.get('/', nodeController.getNodes.bind(nodeController));
routesNode.get('/:id', joiValidateUuid, nodeController.getNode.bind(nodeController));
routesNode.post('/:id/update', joiValidateNode, nodeController.updateNode.bind(nodeController));
routesNode.delete('/:id/delete', joiValidateUuid, nodeController.deleteNode.bind(nodeController));

export { routesNode };