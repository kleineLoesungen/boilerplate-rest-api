import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { LoginUser, User } from '../models/userModel';
import bcrypt from "bcrypt";
import { SessionService } from '../services/sessionService';

export class UserController {
    constructor(
        private userService: UserService,
        private sessionService: SessionService
    ) {}

    /**
     * create user. user id/name is unique
     */
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

    /**
     * list all users with role
     */
    async listUsers(req: Request, res: Response): Promise<void> {
        const users = await this.userService.getAllUsers()
        res.json(users)
    }

    /**
     * login user with credentials and update/set session informations
     */
    async loginUser(req: Request, res: Response): Promise<void> {
        const user: LoginUser = req.body
        const dbUser: void | User | null = await this.userService.getUserById(user.id)

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
            sessionUser.id = user.id
            sessionUser.is_admin = dbUser.is_admin
            const clientInfo = req.header('User-Agent')
            const deviceSession = await this.sessionService.registerClientSession(sessionUser, clientInfo)

            req.session!.sessionId = deviceSession.id
            res.json(`logged in as ${user.id}`)
        }   
    }

    /**
     * logout user and update/remove session informations
     */
    async logoutUser(req: Request, res: Response): Promise<void> {
        if(req.session!.sessionId !== undefined || req.session!.sessionId !== null) {
            await this.sessionService.revokeClientSessionById(req.session!.sessionId)
            delete req.session!.sessionId
        }
        res.json(`logged out`)
    }

    /**
     * update user name. user must be logged in.
     */
    async updateUserName(req: Request, res: Response): Promise<void> {
        if(req.user?.id === undefined || req.body.user === undefined) {
            res.sendStatus(400)
            return
        }

        const updatedUser = await this.userService.updateUserId(req.user.id, req.body.user)
        if(updatedUser === null) {
            res.status(404).json({ message: 'User update failed' })
            return
        }

        this.sessionService.updateUserId(req.user.id, req.body.user)
        res.json(true)
    }

    /**
     * update user password. user must be logged in.
     */
    async updateUserPassword(req: Request, res: Response): Promise<void> {
        if(req.user?.id === undefined || req.body.password === undefined) {
            res.sendStatus(400)
            return
        }

        const updatedUser = await this.userService.updateUserPassword(req.user.id, req.body.password)
        if(updatedUser === null) {
            res.status(404).json({ message: 'User update failed' })
            return
        }

        res.json(true)
    }

    /**
     * update user role.
     */
    async updateUserRole(req: Request, res: Response): Promise<void> {
        if(req.body.user === undefined || req.body.is_admin === undefined) {
            res.sendStatus(400)
            return
        }

        const updatedUser = this.userService.updateUserRole(req.body.user, req.body.is_admin)
        if(updatedUser === null) {
            res.status(404).json({ message: 'User update failed' })
            return
        }

        await this.sessionService.updateUserRole(req.body.user, req.body.is_admin)
        res.json(true)
    }

    /**
     * remove user and remove all sessions informations.
     */
    async removeUser(req: Request, res: Response): Promise<void> {
        if(req.params.id === undefined) {
            res.sendStatus(400)
            return
        }
        
        const deletedUser = await this.userService.deleteUserById(req.params.id)
        
        if(deletedUser === null) {
            res.status(404).json({ message: 'User not found' })
            return 
        }

        await this.sessionService.revokeAllUserSessions(req.params.id)
        res.json(true)
    }
}