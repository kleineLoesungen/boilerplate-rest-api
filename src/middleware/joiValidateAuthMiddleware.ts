import { Request, Response } from 'express';
import { UserJoiSchema } from "../models/userModel";

export function joiValidateUser(req: Request, res: Response, next: any) {
    const validateUser = UserJoiSchema.validate(req.body)
    if(validateUser.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validateUser.error.message })
    }
}

export function joiValidateParamsId(req: Request, res: Response, next: any) {
    if(typeof req.params.id === 'string') {
        next()
    } else {
        res.sendStatus(400)
    }
}

export function joiValidatePassword(req: Request, res: Response, next: any) {
    if(typeof req.body.password === 'string') {
        next()
    } else {
        res.sendStatus(400)
    }
}

export function joiValidateUserId(req: Request, res: Response, next: any) {
    if(typeof req.body.user === 'string') {
        next()
    } else {
        res.sendStatus(400)
    }
}

export function joiValidateIsAdmin(req: Request, res: Response, next: any) {
    if(typeof req.body.is_admin === 'boolean') {
        next()
    } else {
        res.sendStatus(400)
    }
}