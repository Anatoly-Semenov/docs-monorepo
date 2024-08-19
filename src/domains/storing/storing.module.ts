import { HttpModule } from "@nestjs/axios"
import { CacheModule } from "@nestjs/cache-manager"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { ScheduleModule, SchedulerRegistry } from "@nestjs/schedule"

import { ClientsModule } from "@docs/common/clients/clients.module"
import { DbModule } from "@docs/common/db/db.module"
import { ObservabilityModule } from "@docs/common/observability/observability.module"

import { KafkaClientWrapper } from "@docs/common/kafka-client/kafka-client.wrapper"

import { KafkaClientProvider } from "@docs/common/kafka-client/kafka-client.provider"

import { StoringControllersExport } from "./controllers/controllers.export"

import { StoringServicesProviders } from "./services/services.export"

import { CONFIG__CACHE_BASE_TTL } from "@docs/shared/constants/config.constants"

@Module({
	imports: [
		JwtModule,
		DbModule,
		HttpModule,
		ConfigModule,
		ClientsModule,
		KafkaClientProvider,
		ObservabilityModule,
		ScheduleModule.forRoot(),

		CacheModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				ttl: parseInt(configService.get(CONFIG__CACHE_BASE_TTL), 10)
			}),
			inject: [ConfigService]
		})
	],
	controllers: [...StoringControllersExport],
	providers: [
		KafkaClientWrapper,
		SchedulerRegistry,
		...StoringServicesProviders
	]
})
export class StoringModule {}
