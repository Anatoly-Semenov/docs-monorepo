import { ClassProvider } from "@nestjs/common"

import { KafkaService } from "./kafka.service"

import { IOC__KAFKA_SERVICE } from "@docs/shared/constants/ioc.constants"

export const KafkaProvider: ClassProvider = {
	useClass: KafkaService,
	provide: IOC__KAFKA_SERVICE
}
