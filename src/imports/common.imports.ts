import { WinstonOptions } from "@docs/shared/config/winston-options.config"
import { WinstonModule } from "nest-winston"
import { GrpcReflectionModule } from "nestjs-grpc-reflection"

import { BullModule } from "@nestjs/bull"
import { ConfigModule, ConfigService } from "@nestjs/config"

import { AdminModule } from "../domains/admin/admin.module"
import { HealthModule } from "../domains/health/health.module"
import { AuthModule } from "@docs/common/auth/auth.module"
import { DbModule } from "@docs/common/db/db.module"
import { ObservabilityModule } from "@docs/common/observability/observability.module"
import { BackstageModule } from "src/domains/backstage/backstage.module"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

import { BootstrapGrpcProduct } from "../bootstrap/bootstrap-grpc.product"

const runMode: T_RUN_MODE = process.env.RUN_MODE as T_RUN_MODE

export type Imports = any[]

let CommonImportsList: Imports = []
const CommonModeImports: Imports = [
	// Инфраструктурные и внешние модули
	DbModule,
	AuthModule,
	BackstageModule,
	ObservabilityModule,
	ConfigModule.forRoot(),
	WinstonModule.forRoot(new WinstonOptions().getConfig()),

	BullModule.forRootAsync({
		imports: [ConfigModule],
		useFactory: async (configService: ConfigService) => ({
			redis: {
				host: configService.getOrThrow("REDIS_HOST"),
				port: configService.getOrThrow("REDIS_PORT"),
				password: configService.getOrThrow("REDIS_PASSWORD"),
				keyPrefix: "bull",
				maxRetriesPerRequest: 1
			}
		}),
		inject: [ConfigService]
	})
]

switch (runMode) {
	case T_RUN_MODE.HTTP:
		CommonImportsList = [...CommonModeImports, AdminModule, HealthModule]
		break
	case T_RUN_MODE.WORKER:
		CommonImportsList = CommonModeImports
		break
	case T_RUN_MODE.KAFKA:
		CommonImportsList = CommonModeImports
		break
	case T_RUN_MODE.GRPC:
		CommonImportsList = [
			...CommonModeImports,
			GrpcReflectionModule.register(new BootstrapGrpcProduct().getGrpcOptions())
		]
		break
	/* Может быть undefined при запуске приложения без docker  */
	default:
		CommonImportsList = [...CommonModeImports, AdminModule]
}

export const CommonImports: Imports = CommonImportsList
