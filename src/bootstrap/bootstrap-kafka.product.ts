import { createKafkaClient } from "@docs/shared/config/kafka-client"

import { NestFactory } from "@nestjs/core"

export class BootstrapKafkaProduct {
	async bootstrap(appModule: any): Promise<void> {
		const app = await NestFactory.createMicroservice(
			appModule,
			createKafkaClient(
				process.env.KAFKA__BROKERS_URL,
				process.env.KAFKA__CLIENT_ID + "-consumer",
				process.env.KAFKA__GROUP_ID,
				4,
				process.env.KAFKA__CA_CERT,
				process.env.KAFKA__LOGIN,
				process.env.KAFKA__PASSWORD
			)
		)

		await app.listen()
	}
}
