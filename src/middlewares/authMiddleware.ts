import { Request, Response } from 'express';
import { redisRepository } from '../databases/redisDatabase';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../databases/postgresDatabase';
import { SessionToken } from '../models/sessionTokenModel';

const sessionTokenRepository = AppDataSource.getRepository(SessionToken)

/**
 * route only for authorized user (with session token or cookie)
 */
export async function isLoggedIn(req: Request, res: Response, next: any) {
    let sessionId = ''
    let authed = false

    if(req.header('Authorization')) {
        await handleSessionToken()
    } else {
        await handleSessionCookie()
    }

    if(authed) {
        const timestamp = new Date().getTime()
        await redisRepository.set(`sessions:${sessionId}:lastrequest`, `${timestamp}`)
        next()
    } else {
        res.sendStatus(401)
        return
    }

    async function handleSessionToken(): Promise<void> {
        sessionId = req.header('Authorization')!
        const jwtPayload: any = jwt.verify(sessionId, process.env.JWT_SECRET!);
        const user = await getCachedUser()
        if(user === null) { // check database
            const tokenDb = await getDatabaseUser(jwtPayload.id)
            if(tokenDb === null) return

            await cacheUserSessionToken(tokenDb)
            addRequestUser({ id: tokenDb.user.id, is_admin: tokenDb.user.is_admin })
            
        } else {
            const is_admin = await getCachedAdminRole()
            addRequestUser({ id: user, is_admin: is_admin === 'true' })
        }

        authed = true
    }

    async function handleSessionCookie(): Promise<void> {
        const user = await getCachedUser()
        if(user === null) return

        const role = await getCachedAdminRole()
        addRequestUser({ id: user, is_admin: role === 'true' })

        sessionId = req.session!.sessionId
        authed = true
    }

    async function getCachedUser(): Promise<string | null> {
        return await redisRepository.get(`sessions:${req.session!.sessionId}:user`)
    }

    async function getCachedAdminRole(): Promise<string | null> {
        return await redisRepository.get(`sessions:${req.session!.sessionId}:isadmin`)
    }

    async function getDatabaseUser(userId: string): Promise<SessionToken | null> {
        return await sessionTokenRepository.findOne({ 
            where: { id: userId },
            relations: [ 'user' ]
        })
    }

    async function cacheUserSessionToken(token: SessionToken): Promise<void> {
        await redisRepository.mset(
            `sessions:${token.id}:user`, token.user.id,
            `sessions:${token.id}:isadmin`, `${token.user.is_admin}`,
            `sessions:${token.id}:tokenauth`, `true`
        )
        await redisRepository.sadd(`sessions:${token.user.id}`, token.id)
    }

    function addRequestUser(user: { id: string, is_admin: boolean }): void {
        req.user = {
            id: user.id,
            is_admin: user.is_admin
        }
    }
}

/**
 * route only for admins
 */
export async function isAdmin(req: Request, res: Response, next: any) {
    if(req.user?.is_admin) {
        next()
    } else {
        res.sendStatus(401)
    }
}