import { HttpModule } from "@nestjs/axios"
import { CacheModule } from "@nestjs/cache-manager"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"

import { ClientsModule } from "@docs/common/clients/clients.module"
import { DbModule } from "@docs/common/db/db.module"

import { KafkaClientWrapper } from "@docs/common/kafka-client/kafka-client.wrapper"

import { KafkaClientProvider } from "@docs/common/kafka-client/kafka-client.provider"

import { SigningControllersExport } from "./controllers/controllers.export"

import { SigningServicesExport } from "./services/services.export"

import { CONFIG__CACHE_BASE_TTL } from "@docs/shared/constants/config.constants"

@Module({
	imports: [
		DbModule,
		HttpModule,
		ConfigModule,
		ClientsModule,
		KafkaClientProvider,

		CacheModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				ttl: parseInt(configService.get(CONFIG__CACHE_BASE_TTL), 10)
			}),
			inject: [ConfigService]
		})
	],
	controllers: [...SigningControllersExport],
	providers: [KafkaClientWrapper, ...SigningServicesExport]
})
export class SigningModule {}
