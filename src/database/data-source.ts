import { DataSource } from "typeorm";
import { Node } from "../models/nodeModel"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOSTNAME,
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: true,
    logging: true,
    entities: [Node]
})