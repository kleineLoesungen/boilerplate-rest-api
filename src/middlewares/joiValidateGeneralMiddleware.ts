import { Request, Response } from 'express'

/**
 * ensure req.params.id as string 
 */
export function joiValidateParamsId(req: Request | Request, res: Response, next: any) {
    if(typeof req.params.id === 'string') {
        next()
    } else {
        res.sendStatus(400)
    }
}