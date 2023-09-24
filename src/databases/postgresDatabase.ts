import { DataSource } from "typeorm";
import container from "../containers/container";
import { UserService } from "../services/userService";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: true,
    logging: true,
    entities: ["./src/models/*.js"]
})

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")

        setInitialDatabaseAdmin()
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

function setInitialDatabaseAdmin() {
    const userService = container.resolve<UserService>('userService')

    // is Admin set?
    userService.getAllUsers()
        .then((users) => {
            if(users.filter(u => u.is_admin).length === 0) {
                // create initial admin
                const admin = userService.createUser({
                    id: process.env.APP_ADMIN_USER!,
                    password: process.env.APP_ADMIN_PASSWORD!,
                    is_admin: true
                })
                if(admin === null) throw new Error('user id/name already exists')
            }
        })
        .catch((err) => {
            console.error("Error during Admin creation", err)
        })
}
