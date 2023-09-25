import express from "express";
import { Request, Response } from "express";

const routesError = express.Router();

routesError.get('/', function (req: Request, res: Response) {
    const err = new Error();
    err.statusCode = typeof req.query.code === 'string' && Number.parseInt(req.query.code) || undefined;
    err.timestamp = typeof req.query.time === 'string' && Number.parseInt(req.query.time) || undefined;
    err.traceCode = typeof req.query.trace === 'string' && req.query.trace || undefined;
    err.message = `Error on ${req.protocol + '://' + req.get('host') + req.originalUrl}`
    throw err
});

export { routesError }