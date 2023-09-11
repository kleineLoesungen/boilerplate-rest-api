import express from 'express';
import bodyParser from 'body-parser';
import container from './src/containers/container';
import { NodeController } from './src/controllers/nodeController';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const nodeController = container.resolve<NodeController>('nodeController');

app.post('/api/v1/nodes/create', nodeController.createNode.bind(nodeController));
app.get('/api/v1/nodes', nodeController.getNodes.bind(nodeController));
app.get('/api/v1/nodes/:id', nodeController.getNode.bind(nodeController));
app.post('/api/v1/nodes/:id/update', nodeController.updateNode.bind(nodeController));
app.delete('/api/v1/nodes/:id/delete', nodeController.deleteNode.bind(nodeController));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});