import { AppDataSource } from '../databases/postgresDatabase';
import { LoginUser, User, saltRounds } from '../models/userModel';
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User)

export interface UserService {
    /**
     * create user in db
     */
    createUser(user: LoginUser): Promise<string | null>;
    
    /**
     * get user informations from db
     */
    getUserById(id: string): Promise<User | null>;
    
    /**
     * get all users from db
     */
    getAllUsers(): Promise<{user: string, is_admin: boolean}[]>; 
    
    /**
     * update user id in db
     */
    updateUserId(oldUser: string, newUser: string): Promise<string | null>;
    
    /**
     * update user password in db
     */
    updateUserPassword(id: string, newPassword: string): Promise<string | null>;
    
    /**
     * update user role in db
     */
    updateUserRole(userId: string, isAdmin: boolean): Promise<boolean | null>
    
    /**
     * remove user in db
     */
    deleteUserById(id: string): Promise<boolean>;
}

export class UserServiceImplementation implements UserService {
    async createUser(user: LoginUser): Promise<string | null> {
        const existingUser = await userRepository.findOneBy({ id: user.id })
        if(existingUser !== null) return null

        const newUser = new User()

        const salt = bcrypt.genSaltSync(saltRounds)
        const passhash = bcrypt.hashSync(user.password!, salt)

        newUser.id = user.id
        newUser.is_admin = user.is_admin
        newUser.passhash = passhash
        await userRepository.save(newUser)
        return user.id;
    }

    async getUserById(userId: string): Promise<User | null> {
        return await userRepository.findOneBy({ id: userId });
    }

    async getAllUsers(): Promise<{user: string, is_admin: boolean}[]> {
        return (await userRepository.find()).map(u => ({ user: u.id, is_admin: u.is_admin }))
    }

    async updateUserId(oldUserId: string, newUserId: string): Promise<string | null> {
        const updateUser = await userRepository.findOneBy({ id: oldUserId })
        if(updateUser === null) return null

        const existsUser = await userRepository.findOneBy({ id: newUserId })
        if(existsUser !== null) return null
        
        const newUser = JSON.parse(JSON.stringify(updateUser))
        newUser.id = newUserId
        // add new primary key (entry)
        await userRepository.save(newUser)
        // delete old primary key (entry)
        await userRepository.remove(updateUser)

        return newUser
    }

    async updateUserRole(userId: string, isAdmin: boolean): Promise<boolean | null> {
        const updateUser = await userRepository.findOneBy({ id: userId })
        if(updateUser === null) return null
        
        // one admin must be left
        if(!isAdmin) {
            const countAdmins = await userRepository
                .createQueryBuilder('user')
                .where("user.is_admin = :isadmin", { admin: true })
                .getCount()
            if(countAdmins <= 1) return null
        }

        updateUser.is_admin = isAdmin
        await userRepository.save(updateUser)
        return updateUser.is_admin
    }

    async updateUserPassword(userId: string, newPassword: string): Promise<string | null> {
        const updateUser = await userRepository.findOneBy({ id: userId })
        if(updateUser === null) return null

        const salt = bcrypt.genSaltSync(saltRounds)
        const passhash = bcrypt.hashSync(newPassword, salt)

        updateUser.passhash = passhash
        await userRepository.save(updateUser)
        return updateUser.id;
    }

    async deleteUserById(userId: string): Promise<boolean> {
        const removeUser = await userRepository.findOneBy({ id: userId })
        if(removeUser === null) return false

        await userRepository.remove(removeUser)
        return true
    }
}