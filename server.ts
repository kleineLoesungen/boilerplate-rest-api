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

// Run
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});