import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { SessionTokenService } from '../services/sessionTokenService';
import { SessionService } from '../services/sessionService';

export class SessionTokenController {
    constructor(
        private sessionTokenService: SessionTokenService,
        private userService: UserService,
        private sessionService: SessionService
    ) {}

    /**
     * create user API token
     */
    async createSessionToken(req: Request, res: Response): Promise<void> {
        if(req.user === undefined || req.body.name === undefined) {
            res.sendStatus(400)
            return
        }

        const user = await this.userService.getUserById(req.user.id)
        if(user === null) {
            res.status(404).json({ message: 'API token creation failed: user not found' })
            return
        }
        const createdSessionToken = await this.sessionTokenService.createToken(user, req.body.name)
        if(createdSessionToken === null) {
            res.status(404).json({ message: 'API token creation failed: token could not created' })
            return
        }
        res.json(createdSessionToken)
    }

    /**
     * get all user API tokens
     */
    async getSessionTokens(req: Request, res: Response): Promise<void> {
        if(req.user === undefined) {
            res.sendStatus(400)
            return
        }

        const userKeys = await this.sessionTokenService.getUserTokens(req.user.id)
        res.json(userKeys)
    }

    /**
     * update user API token name
     */
    async updateSessionToken(req: Request, res: Response): Promise<void> {
        if(req.user === undefined || req.params.id === undefined || req.body.name === undefined) {
            res.sendStatus(400)
            return
        }

        const updatedKey = await this.sessionTokenService.updateToken(req.user.id, req.params.id, req.body.name)
        if(!updatedKey) {
            res.status(400).json({ message: 'API token updating failed: token not found or error at database' })
            return
        }
        res.json(true)
    }

    /**
     * remove user API token
     */
    async removeSessionToken(req: Request, res: Response): Promise<void> {
        if(req.user === undefined || req.params.id === undefined) {
            res.sendStatus(400)
            return
        }

        const deletedKey = await this.sessionTokenService.deleteToken(req.user.id, req.params.id)
        if(!deletedKey) {
            res.status(400).json({ message: 'API token deleting failed: token not found or user not authorized' })
            return
        }

        await this.sessionService.revokeClientSessionById(req.params.id)
        res.json(true)
    }
}