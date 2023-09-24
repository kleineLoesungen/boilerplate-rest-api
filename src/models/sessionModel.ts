
/**
 * typescript definition of ClientSession. ClientSession is used for authentication with client cookie.
 */
export class ClientSession {
    public id: string | undefined

    public clientId!: string

    public info!: string
}