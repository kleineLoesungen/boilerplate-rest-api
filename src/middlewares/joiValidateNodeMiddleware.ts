import { NodeJoiSchema, NodeJoiSchemaCreate } from "../models/nodeModel"
import { Request, Response } from 'express';

/**
 * ensure req.body includes Node values 
 */
export function joiValidateNode(req: Request, res: Response, next: any) {
    const validateNode = NodeJoiSchema.validate(req.body)
    if(validateNode.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validateNode.error.message })
    }
}

/**
 * ensure req.body includes Node(Create) values 
 */
export function joiValidateNodeCreate(req: Request, res: Response, next: any) {
    const validateNode = NodeJoiSchemaCreate.validate(req.body)
    if(validateNode.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validateNode.error.message })
    }
}