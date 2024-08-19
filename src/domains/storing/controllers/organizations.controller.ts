import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Inject,
	Logger,
	Param,
	ParseUUIDPipe,
	Post
} from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"

import { DiadocService } from "../services/diadoc-service/diadoc.service"

import { IOC__SERVICE__DIADOC } from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_2 } from "@docs/shared/constants/router.constants"

import {
	OrganizationLoadDto,
	OrganizationUpdateDto
} from "@docs/shared/dto/v1/db-dto/organizations.dto"

import { Message } from "@docs/shared/enums/message.enum"
import { OrganizationFeature } from "@docs/shared/enums/organization.enum"

@Controller({
	path: "organizations",
	version: ROUTER__VERSION_2
})
@ApiTags("Organizations v2")
export class OrganizationControllerV2 {
	constructor(
		@Inject(IOC__SERVICE__DIADOC)
		private readonly diadocService: DiadocService
	) {}

	private readonly logger: Logger = new Logger(OrganizationControllerV2.name)

	@Get(":org_id/features")
	async getOrganizationFeatures(
		@Param("org_id", new ParseUUIDPipe()) organizationId: string
	) {
		this.logger.log(
			`Получен API запрос GET /organizations/${organizationId}/features`
		)
		return await this.diadocService.getOrganizationFeatures(organizationId)
	}

	@Post("features")
	async handlePostMethod(
		@Body() body: OrganizationLoadDto | OrganizationUpdateDto
	): Promise<string | OrganizationFeature[]> {
		switch (body?.action) {
			case "load":
				return await this.diadocService.loadOrganizationFeaturesPaginated(
					(body as OrganizationLoadDto).mode
				)
			case "updateOne":
				return await this.diadocService.updateOrganizationFeatures(
					(body as OrganizationUpdateDto).organizationId
				)
			default:
				this.logger.error(Message.Error.WRONG_ACTION)
				throw new BadRequestException(Message.Error.WRONG_ACTION)
		}
	}
}
