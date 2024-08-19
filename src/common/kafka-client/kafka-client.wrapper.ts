import { lastValueFrom } from "rxjs"

import { Inject, Injectable } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"

import { IOC__CLIENT_PROVIDER__KAFKA } from "@docs/shared/constants/ioc.constants"

import { IKafkaWrapper } from "@docs/shared/interfaces/client/kafka.interfaces"

@Injectable()
export class KafkaClientWrapper implements IKafkaWrapper {
	constructor(
		@Inject(IOC__CLIENT_PROVIDER__KAFKA)
		private readonly kafkaClient: ClientKafka
	) {}
	async emit(
		topicName: string,
		data: { key: string; value: unknown }
	): Promise<unknown | void> {
		return lastValueFrom(this.kafkaClient.emit(topicName, data))
	}
}
