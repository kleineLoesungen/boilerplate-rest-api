import { LoginUser, User } from "./userModel"

export class DeviceSession {
    public id: string | undefined

    public deviceId!: string

    public info!: string
}