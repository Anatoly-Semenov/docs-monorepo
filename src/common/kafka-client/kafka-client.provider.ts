import { createKafkaClient } from "@docs/shared/config/kafka-client"

import { ClassProvider } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ClientsModule } from "@nestjs/microservices"

import { KafkaClientWrapper } from "./kafka-client.wrapper"

import {
	IOC__CLIENT_PROVIDER__KAFKA,
	IOC__CLIENT_PROVIDER__KAFKA_WRAPPER
} from "@docs/shared/constants/ioc.constants"

export const KafkaClientProvider = ClientsModule.registerAsync({
	clients: [
		{
			name: IOC__CLIENT_PROVIDER__KAFKA,
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => {
				return createKafkaClient(
					configService.get<string>("KAFKA__BROKERS_URL"),
					configService.get<string>("KAFKA__CLIENT_ID") + "producer",
					configService.get<string>("KAFKA__GROUP_ID"),
					4,
					configService.get<string>("KAFKA__CA_CERT"),
					configService.get<string>("KAFKA__LOGIN"),
					configService.get<string>("KAFKA__PASSWORD")
				)
			},
			inject: [ConfigService]
		}
	]
})

export const KafkaWrapperClientProvider: ClassProvider = {
	provide: IOC__CLIENT_PROVIDER__KAFKA_WRAPPER,
	useClass: KafkaClientWrapper
}
