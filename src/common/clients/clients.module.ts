import { HttpModule } from "@nestjs/axios"
import { BullModule } from "@nestjs/bull"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"

import { GrpcClientsModule } from "@docs/common/clients/modules/grpc-clients.module"
import { RedisModule } from "@nestjs-modules/ioredis"

import { KafkaClientProvider } from "../kafka-client/kafka-client.provider"
import { clientProviders } from "./providers/providers.export"

import {
	BULL_DOWNLOADER_QUEUE,
	BULL_PROCESSOR_QUEUE
} from "@docs/shared/constants/config.constants"

@Module({
	imports: [
		HttpModule,
		ConfigModule,
		GrpcClientsModule,
		KafkaClientProvider,

		RedisModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: "single",
				options: {
					password: configService.getOrThrow("REDIS_PASSWORD")
				},
				url: `redis://${configService.getOrThrow("REDIS_HOST")}:${configService.getOrThrow("REDIS_PORT")}`
			})
		}),

		BullModule.registerQueue(
			{
				name: BULL_PROCESSOR_QUEUE,
				limiter: {
					max: 3,
					duration: 5_000
				}
			},
			{
				name: BULL_DOWNLOADER_QUEUE,
				limiter: {
					max: 5,
					duration: 10_000
				}
			}
		)
	],
	controllers: [],
	providers: clientProviders,
	exports: [...clientProviders, GrpcClientsModule]
})
export class ClientsModule {}
