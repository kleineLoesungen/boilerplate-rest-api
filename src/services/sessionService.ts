import { redisRepository } from "../databases/redisDatabase";
import { ClientSession } from "../models/sessionModel";
import { LoginUser } from "../models/userModel";
import { v4 as uuidv4 } from 'uuid';

export interface SessionService {
    /**
     * register client session in cache
     */
    registerClientSession(user: LoginUser, clientInfo: string | undefined): Promise<ClientSession>;

    /**
     * revoke client session in cache (by session id)
     */
    revokeClientSessionById(sessionId: string): Promise<void>;

    /**
     * revoke client session in cache (by client id)
     */
    revokeClientSessionByDevice(userId: string, clientId: string): Promise<void>;

    /**
     * get user client sessions from cache
     */
    getUserSessions(userId: string): Promise<ClientSession[]>;

    /**
     * update user client sessions in cache (user id changed)
     */
    updateUserId(oldUserId: string, newUserId: string): Promise<void>;
    
    /**
     * update user client sessions in cache (user role changed)
     */
    updateUserRole(userId: string, isAdmin: boolean): Promise<void>;

    /**
     * revoke all user client session in cache
     */
    revokeAllUserSessions(userId: string): Promise<void>;
}

export class SessionServiceImplementation implements SessionService {
    async registerClientSession(user: LoginUser, clientInfo: string | undefined): Promise<ClientSession> {
        const newSession = new ClientSession()
        newSession.id = uuidv4()
        newSession.clientId = uuidv4()
        newSession.info = clientInfo || 'unknown'

        await redisRepository.mset(
            `sessions:${newSession.id}:user`, user.id,
            `sessions:${newSession.id}:isadmin`, `${user.is_admin}`,
            `sessions:${newSession.id}:clientInfo`, newSession.info,
            `sessions:${newSession.id}:clientId`, newSession.clientId
        )
        await redisRepository.sadd(`sessions:${user.id}`, newSession.id)

        return newSession
    }

    async revokeClientSessionById(sessionId: string): Promise<void> {
        const user = await redisRepository.get(`sessions:${sessionId}:user`)
        if (user !== null) {
            await redisRepository.srem(`sessions:${user}`, sessionId)
            const sessionKeys = await redisRepository.keys(`sessions:${sessionId}:*`)
            await redisRepository.del(sessionKeys)
        }
    }

    async revokeClientSessionByDevice(userId: string, clientId: string): Promise<void> {
        const deviceSessionIds = await redisRepository.smembers(`sessions:${userId}`)
        for(const id of deviceSessionIds) {
            const sessionDeviceId = await redisRepository.get(`sessions:${id}:clientId`)
            if(sessionDeviceId !== null && sessionDeviceId === clientId) {
                this.revokeClientSessionById(id)
            }
        }
    }

    async getUserSessions(userId: string): Promise<ClientSession[]> {
        const userSessions: ClientSession[] = []

        const deviceSessionIds = await redisRepository.smembers(`sessions:${userId}`)
        for(const id of deviceSessionIds) {
            const clientId = await redisRepository.get(`sessions:${id}:clientId`) // session tokens ignored (no clientId)
            if(clientId !== null) {
                const session = new ClientSession()
                session.clientId = clientId
                session.info = await redisRepository.get(`sessions:${id}:clientInfo`) || 'unknown'
                userSessions.push(session)
            }
        }

        return userSessions
    }

    async updateUserId(oldUserId: string, newUserId: string): Promise<void> {
        const deviceSessionIds = await redisRepository.smembers(`sessions:${oldUserId}`)
        for(const id of deviceSessionIds) {
            await redisRepository.set(`sessions:${id}:user`, newUserId)
        }
        redisRepository.rename(`sessions:${oldUserId}`, `sessions:${newUserId}`)
    }

    async updateUserRole(userId: string, isAdmin: boolean): Promise<void> {
        const deviceSessionIds = await redisRepository.smembers(`sessions:${userId}`)
        for(const id of deviceSessionIds) {
            await redisRepository.set(`sessions:${id}:isadmin`, `${isAdmin}`)
        }
    }

    async revokeAllUserSessions(userId: string): Promise<void> {
        const deviceSessionIds = await redisRepository.smembers(`sessions:${userId}`)
        for(const id of deviceSessionIds) {
            await this.revokeClientSessionById(id)
        }
    }
}