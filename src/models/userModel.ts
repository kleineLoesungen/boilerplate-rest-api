import { Entity, PrimaryColumn, Column } from "typeorm"
import { JoiSchema, getClassSchema } from 'joi-class-decorators';
import * as Joi from 'joi';

@Entity()
export class User {
    @PrimaryColumn("text")
    public user!: string

    @Column("text")
    public passhash!: string

    @Column("boolean")
    public is_admin!: boolean

}

export class LoginUser {
    @JoiSchema(Joi.string().required())
    public user!: string

    @JoiSchema(Joi.string().required())
    public password: string | undefined

    @JoiSchema(Joi.boolean().optional())
    public is_admin!: boolean
}

export const saltRounds = 10

export const UserJoiSchema = getClassSchema(LoginUser);