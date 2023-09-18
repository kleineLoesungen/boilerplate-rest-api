import { Request, Response } from 'express';

export function isLoggedIn(req: Request, res: Response, next: any) {
    if(req.session!.user === undefined) {
        res.sendStatus(401)
    } else {
        next()
    }
}

export function isAdmin(req: Request, res: Response, next: any) {
    if(req.session!.is_admin) {
        next()
    } else {
        res.sendStatus(401)
    }
}