import express from 'express'
import container from '../../containers/container';
import { NodeController } from '../../controllers/nodeController';

const routesNode = express.Router();
const nodeController = container.resolve<NodeController>('nodeController');

routesNode.post('/create', nodeController.createNode.bind(nodeController));
routesNode.get('/', nodeController.getNodes.bind(nodeController));
routesNode.get('/:id', nodeController.getNode.bind(nodeController));
routesNode.post('/:id/update', nodeController.updateNode.bind(nodeController));
routesNode.delete('/:id/delete', nodeController.deleteNode.bind(nodeController));

export { routesNode };