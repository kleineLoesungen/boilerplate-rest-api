import { Request, Response } from 'express';
import { redisRepository } from '../databases/redisDatabase';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../databases/postgresDatabase';
import { SessionToken } from '../models/sessionTokenModel';

const sessionTokenRepository = AppDataSource.getRepository(SessionToken)

export async function isLoggedIn(req: Request, res: Response, next: any) {
    try {
        if(req.header('Authorization') !== undefined) { // auth by session token
            let session: any = {}
            await handleSessionToken(req, session)
            const timestamp = new Date().getTime()
            await redisRepository.set(`sessions:${session.id}:lastrequest`, `${timestamp}`)
            next()

        } else if(req.session!.sessionId !== undefined) { // auth by session cookie
            await handleSessionCookie(req)
            const timestamp = new Date().getTime()
            await redisRepository.set(`sessions:${req.session!.sessionId}:lastrequest`, `${timestamp}`)
            next()
            
        } else {
            res.sendStatus(401)
            return
        }
    } catch (err) {
        res.sendStatus(401)
        return
    }
}

async function handleSessionToken(req: Request, session: any): Promise<boolean> {
    try {
        const sessionToken = req.header('Authorization')
        const jwtPayload: any = jwt.verify(sessionToken!, process.env.JWT_SECRET!);
        const user = await redisRepository.get(`sessions:${jwtPayload.id}:user`)
        if(user === null) { // check database
            const tokenDb = await sessionTokenRepository.findOne({ 
                where: { id: jwtPayload.id },
                relations: [ 'user' ]
            })
            if(tokenDb === null) {
                throw new Error
            }

            await redisRepository.mset(
                `sessions:${jwtPayload.id}:user`, tokenDb.user.id,
                `sessions:${jwtPayload.id}:isadmin`, `${tokenDb.user.is_admin}`,
                `sessions:${jwtPayload.id}:tokenauth`, `true`
            )
            await redisRepository.sadd(`sessions:${tokenDb.user.id}`, jwtPayload.id)
            
            req.user = {
                id: tokenDb.user.id,
                is_admin: tokenDb.user.is_admin
            }
        } else {
            const is_admin = await redisRepository.get(`sessions:${jwtPayload.id}:isadmin`)
            req.user = {
                id: user,
                is_admin: is_admin === 'true'
            }
        }

        session.id = jwtPayload.id
        return true
    } catch(err) {
        throw new Error
    }
}

async function handleSessionCookie(req: Request): Promise<void> {
    const user = await redisRepository.get(`sessions:${req.session!.sessionId}:user`)
    if(user === null) {
        throw new Error
    }

    const role = await redisRepository.get(`sessions:${req.session!.sessionId}:isadmin`)
    req.user = {
        id: user,
        is_admin: role === 'true'
    }
}

export async function isAdmin(req: Request, res: Response, next: any) {
    if(req.user?.is_admin) {
        next()
    } else {
        res.sendStatus(401)
    }
}