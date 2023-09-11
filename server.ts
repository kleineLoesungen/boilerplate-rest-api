import express from 'express'

const app: express.Application = express();

const PORT = 3000

// http-server
app.listen(PORT, () => {
	console.log(`API Server started at port ${PORT}`);
});