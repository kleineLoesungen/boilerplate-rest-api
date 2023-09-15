import "reflect-metadata"
import express from 'express'
import bodyParser from 'body-parser'
import { routesNode } from './src/routes/v1/nodeRoutes'
import { AppDataSource } from './src/database/data-source';

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

// Routes
app.use('/api/v1/nodes', routesNode);

/**
 * NEXT
 * 4. User/Password + Cookies
 * 5. JWT
 * 5.5. Database Relations: User <> Nodes
 * 6. Run on k3s
 * 7. SSL/TLS on k3s
 * 8. Caching with Redis
 * Optional: Support SSO?
 */

// Run
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});