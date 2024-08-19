import { Controller, Inject, Logger } from "@nestjs/common"
import { Ctx, EventPattern, KafkaContext, Payload } from "@nestjs/microservices"

import { MdmService } from "../services/mdm-service/mdm.service"

import { IOC__SERVICE__MDM } from "@docs/shared/constants/ioc.constants"
import {
	KAFKA__TOPIC_MDM_ORGANIZATIONS,
	KAFKA__TOPIC_MDM_PARTNERS
} from "@docs/shared/constants/kafka.constants"

import { Counterparty } from "@docs/common/db/entities/counterparty.entity"
import { Organizations } from "@docs/common/db/entities/organizations.entity"

import { IMdmOrganization } from "@docs/shared/interfaces/mdm/organizations.interfaces"
import { IMdmPartner } from "@docs/shared/interfaces/mdm/partners.interfaces"

@Controller()
export class MdmKafkaController {
	private readonly logger = new Logger(MdmKafkaController.name)

	constructor(
		@Inject(IOC__SERVICE__MDM)
		private readonly mdmService: MdmService
	) {}

	@EventPattern(KAFKA__TOPIC_MDM_ORGANIZATIONS)
	async organizationUpdate(
		@Payload() message: IMdmOrganization[],
		@Ctx() context: KafkaContext
	): Promise<Organizations[]> {
		this.logger.log(`Получено обновление организаций через Kafka`)

		return this.mdmService.updateOrganization(message)
	}

	@EventPattern(KAFKA__TOPIC_MDM_PARTNERS)
	async counterpartiesUpdate(
		@Payload() message: IMdmPartner[],
		@Ctx() context: KafkaContext
	): Promise<Counterparty[]> {
		this.logger.log(`Получено обновление контрагентов через Kafka`)

		return this.mdmService.updateCounterparties(message)
	}
}
