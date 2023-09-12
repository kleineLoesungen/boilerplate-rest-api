import express from 'express';
import bodyParser from 'body-parser';
import { routesNode } from './src/routes/v1/nodeRoutes'

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/v1/nodes', routesNode);

// Run
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});