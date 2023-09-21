import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { LoginUser, User } from '../models/userModel';
import bcrypt from "bcrypt";
import { redisRepository } from '../databases/redisDatabase';
import { SessionService } from '../services/sessionService';

export class UserController {
    constructor(
        private userService: UserService,
        private sessionService: SessionService
    ) {}

    async createUser(req: Request, res: Response): Promise<void> {
        const user: LoginUser = req.body
        if(user.is_admin === undefined) {
            user.is_admin = false
        }

        const createdUserName = await this.userService.createUser(user)
        if(createdUserName === null) {
            res.status(404).json({ message: 'User creation failed: user id already exists' })
            return
        }
        res.json(createdUserName)
    }

    async listUsers(req: Request, res: Response): Promise<void> {
        const users = await this.userService.getAllUsers()
        res.json(users)
    }

    async loginUser(req: Request, res: Response): Promise<void> {
        const user: LoginUser = req.body
        const dbUser: void | User | null = await this.userService.getUserById(user.user)

        // no user
        if(dbUser === null || dbUser === undefined)  {
            res.status(404).json({ message: 'Login failed: user/password unknown' })
            return
        }

        // user and check password
        const login = bcrypt.compareSync(user.password!, dbUser.passhash)
        if(!login)  {
            res.status(404).json({ message: 'Login failed: user/password unknown' })
            return
        } else {
            const sessionUser = new LoginUser()
            sessionUser.user = user.user
            sessionUser.is_admin = dbUser.is_admin
            const deviceInfo = req.header('User-Agent')
            const deviceSession = await this.sessionService.registerDeviceSession(sessionUser, deviceInfo)

            req.session!.sessionId = deviceSession.id
            res.json(`logged in as ${user.user}`)
        }   
    }

    async logoutUser(req: Request, res: Response): Promise<void> {
        if(req.session!.sessionId !== undefined || req.session!.sessionId !== null) {
            await this.sessionService.revokeDeviceSessionById(req.session!.sessionId)
            delete req.session!.sessionId
        }
        res.json(`logged out`)
    }

    async getUserSessions(req: Request, res: Response): Promise<void> {
        const user = await redisRepository.get(`sessions:${req.session!.sessionId}:user`)

        if(user === null) {
            res.sendStatus(401)
        } else {
            const sessions = await this.sessionService.getUserSessions(user)
            res.json(sessions)
        }
    }

    async updateUserName(req: Request, res: Response): Promise<void> {
        const change = req.body
        const user = await redisRepository.get(`sessions:${req.session!.sessionId}:user`)

        if(user !== null && typeof change.user === 'string') {
            const updatedUser = await this.userService.updateUserId(user, change.user)
            if(updatedUser === null) {
                res.status(404).json({ message: 'User update failed' })
                return
            }

            this.sessionService.updateUserId(user, change.user)
            res.json(true)
            return
        }
        res.sendStatus(400)
    }

    async updateUserPassword(req: Request, res: Response): Promise<void> {
        const change = req.body
        const user = await redisRepository.get(`sessions:${req.session!.sessionId}:user`)

        if(user !== null && typeof change.password === 'string') {
            const updatedUser = await this.userService.updateUserPassword(user, change.password)
            if(updatedUser === null) {
                res.status(404).json({ message: 'User update failed' })
                return
            }

            res.json(true)
            return
        }
        res.sendStatus(400)
    }

    async updateUserRole(req: Request, res: Response): Promise<void> {
        const isAdmin = req.body.is_admin
        const user = await redisRepository.get(`sessions:${req.session!.sessionId}:user`)

        if(user !== null && typeof isAdmin === 'boolean') {
            const updatedUser = this.userService.updateUserRole(user, isAdmin)
            if(updatedUser === null) {
                res.status(404).json({ message: 'User update failed' })
                return
            }

            await this.sessionService.updateUserRole(user, isAdmin)
            res.json(true)
            return
        }
        res.sendStatus(400)
    }

    async removeUser(req: Request, res: Response): Promise<void> {
        const userId = req.params.id
        const deletedUser = await this.userService.deleteUserById(userId)
        
        if(deletedUser === null) {
            res.status(404).json({ message: 'User not found' })
            return 
        }

        await this.sessionService.revokeAllUserSessions(userId)
        res.json(true)
    }

    async removeDeviceSession(req: Request, res: Response): Promise<void> {
        const deviceId = req.params.deviceId
        const user = await redisRepository.get(`sessions:${req.session!.sessionId}:user`)

        if(user !== null && typeof deviceId === 'string') {
            await this.sessionService.revokeDeviceSessionByDevice(user, deviceId)
            res.json(true)
            return
        }
        res.sendStatus(400)
    }
}