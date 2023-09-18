import "reflect-metadata"
import express from 'express'
import bodyParser from 'body-parser'
import { routesNode } from './src/routes/v1/nodeRoutes'
import { routesAuth } from './src/routes/v1/authRoutes'
import cookieSession from 'cookie-session'

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieSession({
    name: 'auth-session',
    secret: process.env.SESSION_SECRET,
    secure: false, // in production must be true = https-requests only
    httpOnly: true, // not accessable by client javascript (default)
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  }))

// Routes
app.use('/api/v1/nodes', routesNode);
app.use('/api/v1/auth', routesAuth);

/**
 * NEXT
 * 5. JWT
 * 8. Caching with Redis 
 * 5.5. Database Relations: User <> Nodes
 * 5.7 SSL/TLS on docker compose
 * 6. Run on k3s
 * 7. SSL/TLS on k3s
 * Optional: Support SSO?
 */

// Run
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});