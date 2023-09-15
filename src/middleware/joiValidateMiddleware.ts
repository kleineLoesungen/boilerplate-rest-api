import { NodeJoiSchema, NodeJoiSchemaCreate } from "../models/nodeModel"
import { Request, Response } from 'express';
import * as Joi from 'joi';

export function joiValidateNode(req: Request, res: Response, next: any) {
    const validateNode = NodeJoiSchema.validate(req.body)
    if(validateNode.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validateNode.error.message })
    }
}

export function joiValidateNodeCreate(req: Request, res: Response, next: any) {
    const validateNode = NodeJoiSchemaCreate.validate(req.body)
    if(validateNode.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validateNode.error.message })
    }
}

export function joiValidateUuid(req: Request, res: Response, next: any) {
    const validateUuid = Joi.string().uuid().required().validate(req.params.id)
    if(validateUuid.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validateUuid.error.message })
    }
}