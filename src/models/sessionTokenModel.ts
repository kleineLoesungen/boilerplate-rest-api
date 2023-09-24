import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm"
import { User } from "./userModel"

/**
 * database and typescript definition of SessionToken. SessionToken is used in client authentication via bearer token.
 */
@Entity()
export class SessionToken {
    @PrimaryColumn("uuid")
    public id!: string

    @Column("text")
    public name!: string

    @ManyToOne(() => User, (user) => user.sessionTokens)
    public user!: User
}