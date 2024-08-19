import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"

import { DBProvidersExport } from "@docs/common/db/services/providers.export"

import { exportEntities } from "./entities/export.entities"

@Module({
	imports: [
		ConfigModule,

		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: "postgres" as const,
				host: configService.getOrThrow("POSTGRES_HOST"),
				port: +configService.getOrThrow("POSTGRES_PORT"),
				username: configService.getOrThrow("POSTGRES_USER"),
				password: configService.getOrThrow("POSTGRES_PASSWORD"),
				database: configService.getOrThrow("POSTGRES_DB") as string,
				entities: exportEntities,
				migrations: ["./migrations/*.{js,ts}"]
			})
		}),

		TypeOrmModule.forFeature([...exportEntities])
	],
	providers: [...DBProvidersExport],
	exports: [...DBProvidersExport]
})
export class DbModule {}
