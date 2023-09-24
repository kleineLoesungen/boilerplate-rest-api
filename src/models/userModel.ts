import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm"
import { JoiSchema, getClassSchema } from 'joi-class-decorators';
import * as Joi from 'joi';
import { SessionToken } from "./sessionTokenModel";

/**
 * database and typescript definition of User. User is used for API authentication.
 */
@Entity()
export class User {
    @PrimaryColumn("text")
    public id!: string

    @Column("text")
    public passhash!: string

    @Column("boolean")
    public is_admin!: boolean

    @OneToMany(() => SessionToken, (sessionToken) => sessionToken.user)
    public sessionTokens!: SessionToken[]
}

/**
 * type check definition of LoginUser. LoginUser is used for client requests.
 */
export class LoginUser {
    @JoiSchema(Joi.string().required())
    public id!: string

    @JoiSchema(Joi.string().required())
    public password: string | undefined

    @JoiSchema(Joi.boolean().optional())
    public is_admin!: boolean
}

export const saltRounds = 10

export const UserJoiSchema = getClassSchema(LoginUser);