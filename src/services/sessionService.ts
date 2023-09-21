import { redisRepository } from "../databases/redisDatabase";
import { DeviceSession } from "../models/sessionModel";
import { LoginUser } from "../models/userModel";
import { v4 as uuidv4 } from 'uuid';

export interface SessionService {
    registerDeviceSession(user: LoginUser, deviceInfo: string | undefined): Promise<DeviceSession>;
    revokeDeviceSessionById(sessionId: string): Promise<void>;
    revokeDeviceSessionByDevice(userId: string, deviceId: string): Promise<void>;
    getUserSessions(userId: string): Promise<DeviceSession[]>;
    updateUserId(oldUserId: string, newUserId: string): Promise<void>;
    updateUserRole(userId: string, isAdmin: boolean): Promise<void>;
    revokeAllUserSessions(userId: string): Promise<void>;
}

export class SessionServiceImplementation implements SessionService {
    async registerDeviceSession(user: LoginUser, deviceInfo: string | undefined): Promise<DeviceSession> {
        const newSession = new DeviceSession()
        newSession.id = uuidv4()
        newSession.deviceId = uuidv4()
        newSession.info = deviceInfo || 'unknown'

        await redisRepository.mset(
            `sessions:${newSession.id}:user`, user.user,
            `sessions:${newSession.id}:isadmin`, `${user.is_admin}`,
            `sessions:${newSession.id}:deviceInfo`, newSession.info,
            `sessions:${newSession.id}:deviceId`, newSession.deviceId
        )
        await redisRepository.sadd(`sessions:${user.user}`, newSession.id)

        return newSession
    }

    async revokeDeviceSessionById(sessionId: string): Promise<void> {
        const user = await redisRepository.get(`sessions:${sessionId}:user`)
        if (user !== null) {
            await redisRepository.srem(`sessions:${user}`, sessionId)
            await redisRepository.del(
                `sessions:${sessionId}:user`,
                `sessions:${sessionId}:isadmin`,
                `sessions:${sessionId}:deviceInfo`,
                `sessions:${sessionId}:deviceId`)
        }
    }

    async revokeDeviceSessionByDevice(userId: string, deviceId: string): Promise<void> {
        const deviceSessionIds = await redisRepository.smembers(`sessions:${userId}`)
        for(const id of deviceSessionIds) {
            const sessionDeviceId = await redisRepository.get(`sessions:${id}:deviceId`)
            if(sessionDeviceId !== null && sessionDeviceId === deviceId) {
                this.revokeDeviceSessionById(id)
            }
        }
    }

    async getUserSessions(userId: string): Promise<DeviceSession[]> {
        const userSessions: DeviceSession[] = []

        const deviceSessionIds = await redisRepository.smembers(`sessions:${userId}`)
        for(const id of deviceSessionIds) {
            const deviceId = await redisRepository.get(`sessions:${id}:deviceId`)
            if(deviceId !== null) {
                const session = new DeviceSession()
                session.deviceId = deviceId
                session.info = await redisRepository.get(`sessions:${id}:deviceInfo`) || 'unknown'
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
            await this.revokeDeviceSessionById(id)
        }
    }
}