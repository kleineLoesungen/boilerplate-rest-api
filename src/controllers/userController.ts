import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { LoginUser, User } from '../models/userModel';
import bcrypt from "bcrypt";

export class UserController {
    constructor(
        private userService: UserService
    ) {}

    createUser(req: Request, res: Response): void {
        const user: LoginUser = req.body
        
        this.userService.createUser(user)
            .then((createdUserName) => {
                if(createdUserName === null)  {
                    res.status(404).json({ message: 'User creation failed: user id already exists' })
                    return
                }
                res.json(createdUserName)
            })
            .catch((err) => {
                res.status(404).json({ message: `Error during User creation: ${err}`})
            });
    }

    listUsers(req: Request, res: Response): void {
        this.userService.getAllUsers()
            .then((users) => {
                res.json(users)
            })
            .catch((err) => {
                res.status(404).json({ message: `Error: ${err}`})
            });
    }

    loginUser(req: Request, res: Response): void {
        const user: LoginUser = req.body

        this.userService.getUserById(user.user)
            .then((dbUser: User | null) => {
                if(dbUser === null)  {
                    delete req.session!.user
                    delete req.session!.is_admin
                    res.status(404).json({ message: 'Login failed: user/password unknown' })
                    return
                }

                const login = bcrypt.compareSync(user.password, dbUser.passhash)
                if(!login)  {
                    delete req.session!.user
                    delete req.session!.is_admin
                    res.status(404).json({ message: 'Login failed: user/password unknown' })
                    return
                } else {
                    // only client-side cookie
                    req.session!.user = user.user
                    req.session!.is_admin = dbUser.is_admin
                    res.json(`logged in as ${user.user}`)
                }
            })
            .catch((err) => {
                res.status(404).json({ message: `Error during Login process: ${err}`})
            });
    }

    logoutUser(req: Request, res: Response): void {
        const username = req.session!.user
        delete req.session!.user
        delete req.session!.is_admin
        res.json(`${username} logged out`)
    }

    updateUserName(req: Request, res: Response): void {
        const change = req.body
        if(typeof change.user === 'string') {
            this.userService.updateUserId(req.session!.user, change.user)
                .then((updatedUser) => {
                    if(updatedUser === null) res.status(404).json({ message: 'User update failed' })
                    req.session!.user = change.user
                    res.json(true)
                })
                .catch((err) => {
                    res.status(404).json({ message: `Error during User updating: ${err}`})
                });
            return
        }
        res.sendStatus(400)
    }

    updateUserPassword(req: Request, res: Response): void {
        const change = req.body
        if(typeof change.password === 'string') {
            this.userService.updateUserPassword(req.session!.user, change.password)
                .then((updatedUser) => {
                    if(updatedUser === null) res.status(404).json({ message: 'User update failed' })
                    res.json(true)
                })
                .catch((err) => {
                    res.status(404).json({ message: `Error during User updating: ${err}`})
                });
            return
        }
        res.sendStatus(400)
    }

    updateUserRole(req: Request, res: Response): void {
        const isAdmin = req.body.is_admin
        if(typeof isAdmin === 'boolean') {
            this.userService.updateUserRole(req.session!.user, isAdmin)
            .then((updatedUser) => {
                if(updatedUser === null) res.status(404).json({ message: 'User update failed' })
                res.json(true)
            })
            .catch((err) => {
                res.status(404).json({ message: `Error during User updating: ${err}`})
            });
        }
        res.sendStatus(400)
    }

    removeUser(req: Request, res: Response): void {
        const userId = req.params.id
        this.userService.deleteUserById(userId)
            .then((deletedUser) => {
                if(deletedUser === null) res.status(404).json({ message: 'User not found' })
                res.json(true)
            })
            .catch((err) => {
                res.status(404).json({ message: `Error during User deletion: ${err}`})
            });
    }
}