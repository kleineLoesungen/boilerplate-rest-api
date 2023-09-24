import { AppDataSource } from '../databases/postgresDatabase';
import { SessionToken } from '../models/sessionTokenModel';
import { User } from '../models/userModel';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const sessionTokenRepository = AppDataSource.getRepository(SessionToken)

export interface SessionTokenService {
    /**
     * create user API token in db
     */
    createToken(user: User, tokenName: string): Promise<{ name: string, token: string} | null>;

    /**
     * get all user API tokens from db
     */
    getUserTokens(userId: string): Promise<{ id: string, name: string }[]>;

    /**
     * update user API token (name) in db
     */
    updateToken(userId: string, tokenId: string, newName: string): Promise<boolean>;

    /**
     * delete user API token from db and cache
     */
    deleteToken(userId: string, tokenId: string): Promise<boolean>;
}

export class SessionTokenServiceImplementation implements SessionTokenService {
    async createToken(user: User, tokenName: string): Promise<{ name: string, token: string} | null> {
        const newToken = new SessionToken()
        newToken.id = uuidv4()
        newToken.name = tokenName
        newToken.user = user

        const sessionToken = jwt.sign({ id: newToken.id }, process.env.JWT_SECRET!)

        await sessionTokenRepository.save(newToken).catch((err) => {
            console.error('Error during user creation', err)
            return null
        })
        return { name: tokenName, token: sessionToken };
    }

    async getUserTokens(userId: string): Promise<{ id: string, name: string }[]> {
        const userKeys = await sessionTokenRepository.find({
            select: [ 'id', 'name' ],
            where: {
                user: { id: userId }
            },
            relations: [ 'user' ],
        })
        return userKeys.map(k => ({ id: k.id, name: k.name }))
    }

    async updateToken(userId: string, tokenId: string, newName: string): Promise<boolean> {
        const sessionToken = await sessionTokenRepository.findOne({ 
            where: { 
                id: tokenId, 
                user: { id: userId } 
            }, 
            relations: [ 'user' ]
        })
        if(sessionToken === null) return false

        sessionToken.name = newName
        await sessionTokenRepository.save(sessionToken).catch((err) => { return false })
        return true
    }

    async deleteToken(userId: string, tokenId: string): Promise<boolean> {
        const sessionToken = await sessionTokenRepository.findOne({ 
            where: { 
                id: tokenId, 
                user: { id: userId } 
            }, 
            relations: [ 'user' ]
        })
        if(sessionToken === null) return false
        
        await sessionTokenRepository.remove(sessionToken)
        return true
    }
}