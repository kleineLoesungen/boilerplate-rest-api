import { Request, Response } from 'express';
import { SessionService } from '../services/sessionService';

export class SessionController {
    constructor(
        private sessionService: SessionService
    ) {}

    /**
     * get client sessions of user. user must be logged in.
     */
    async getUserSessions(req: Request, res: Response): Promise<void> {
        if(req.user?.id === undefined) { 
            res.sendStatus(400)
            return
        }

        const sessions = await this.sessionService.getUserSessions(req.user.id)
        res.json(sessions)
    }

    /**
     * remove user client session. user must be logged in.
     */
    async removeClientSession(req: Request, res: Response): Promise<void> {
        if(req.user?.id === undefined || req.params.id === undefined) {
            res.sendStatus(400)
            return
        }

        await this.sessionService.revokeClientSessionByDevice(req.user.id, req.params.id)
        res.json(true)
        return
    }
}