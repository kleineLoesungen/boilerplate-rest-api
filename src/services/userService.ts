import { AppDataSource } from '../database/data-source';
import { LoginUser, User, saltRounds } from '../models/userModel';
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User)

export interface UserService {
    createUser(user: LoginUser): Promise<string>;
    getUserById(id: string): Promise<User | null>;
    getAllUsers(): Promise<{user: string, is_admin: boolean}[]>; 
    updateUserId(oldUser: string, newUser: string): Promise<string | null>;
    updateUserPassword(id: string, newPassword: string): Promise<string | null>;
    updateUserRole(userId: string, isAdmin: boolean): Promise<boolean | null>
    deleteUserById(id: string): Promise<boolean>;
}

export class UserServiceImplementation implements UserService {
    async createUser(user: LoginUser): Promise<string> {
        const newUser = new User()

        const salt = bcrypt.genSaltSync(saltRounds)
        const passhash = bcrypt.hashSync(user.password, salt)

        newUser.user = user.user
        if(user.is_admin !== undefined) newUser.is_admin = user.is_admin
        newUser.salt = salt
        newUser.passhash = passhash
        await userRepository.save(newUser)
        return user.user;
    }

    async getUserById(userId: string): Promise<User | null> {
        return await userRepository.findOneBy({ user: userId });
    }

    async getAllUsers(): Promise<{user: string, is_admin: boolean}[]> {
        return (await userRepository.find()).map(u => ({ user: u.user, is_admin: u.is_admin }))
    }

    //TODO: Prüfe, ob new vorhanden
    async updateUserId(oldUserId: string, newUserId: string): Promise<string | null> {
        const updateUser = await userRepository.findOneBy({ user: oldUserId })
        if(updateUser === null) return null
        
        const newUser = JSON.parse(JSON.stringify(updateUser))
        newUser.user = newUserId
        // add new primary key (entry)
        await userRepository.save(newUser)
        // delete old primary key (entry)
        await userRepository.remove(updateUser)

        return newUser
    }

    //TODO: Letzter Admin darf nicht geändert werden
    async updateUserRole(userId: string, isAdmin: boolean): Promise<boolean | null> {
        const updateUser = await userRepository.findOneBy({ user: userId })
        if(updateUser === null) return null
        
        updateUser.is_admin = isAdmin
        await userRepository.save(updateUser)
        return updateUser.is_admin
    }

    async updateUserPassword(userId: string, newPassword: string): Promise<string | null> {
        const updateUser = await userRepository.findOneBy({ user: userId })
        if(updateUser === null) return null

        const salt = bcrypt.genSaltSync(saltRounds)
        const passhash = bcrypt.hashSync(newPassword, salt)

        updateUser.salt = salt
        updateUser.passhash = passhash
        await userRepository.save(updateUser)
        return updateUser.user;
    }

    async deleteUserById(userId: string): Promise<boolean> {
        const removeUser = await userRepository.findOneBy({ user: userId })
        if(removeUser === null) return false

        await userRepository.remove(removeUser)
        return true
    }
}