import * as process from "process"
import { config } from "dotenv"

import { DataSource, DataSourceOptions } from "typeorm"
import { SeederOptions } from "typeorm-extension"

import { exportEntities } from "../../common/db/entities/export.entities"

// Нужен для создания миграций локально (без docker)
config()

const options: DataSourceOptions & SeederOptions = {
	migrations: ["./dist/common/db/migrations/*.{js,ts}"],
	seeds: ["./dist/common/db/seeds/*.{js,ts}"],
	type: "postgres" as const,

	port: +process.env.POSTGRES_PORT,
	host: process.env.POSTGRES_HOST,
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
	entities: exportEntities
}

export default new DataSource(options)
