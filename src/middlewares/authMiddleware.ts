import { Request, Response } from 'express';
import { redisRepository } from '../databases/redisDatabase';

export async function isLoggedIn(req: Request, res: Response, next: any) {
    const user = await redisRepository.get(`sessions:${req.session!.sessionId}:user`)
    if(user === null) {
        res.sendStatus(401)
    } else {
        next()
    }
}

export async function isAdmin(req: Request, res: Response, next: any) {
    const value = await redisRepository.get(`sessions:${req.session!.sessionId}:isadmin`)
    if(value === null || value === 'false') {
        res.sendStatus(401)
    } else {
        next()
    }
}