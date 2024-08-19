import { HttpStatusCode } from "axios"

import {
	BadRequestException,
	Body,
	Controller,
	Inject,
	Post
} from "@nestjs/common"
import { ApiResponse, ApiTags } from "@nestjs/swagger"

import { MdmService } from "../services/mdm-service/mdm.service"

import { IOC__SERVICE__MDM } from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_1 } from "@docs/shared/constants/router.constants"

import { LoadListDto } from "@docs/shared/dto/v1/db-dto/load-list.dto"

import { Message } from "@docs/shared/enums/message.enum"

@Controller({
	path: "mdm",
	version: ROUTER__VERSION_1
})
@ApiTags("Mdm v1")
export class MdmController {
	constructor(
		@Inject(IOC__SERVICE__MDM)
		private readonly mdmService: MdmService
	) {}

	@Post("organizations")
	@ApiResponse({
		status: HttpStatusCode.Ok,
		description: "Организации успешно подтянуты из МДМ",
		type: String
	})
	async loadOrganizations(@Body() body: LoadListDto): Promise<string> {
		if (body.action === "load") {
			return await this.mdmService.loadOrganizations(body?.page)
		}

		throw new BadRequestException(Message.Error.WRONG_ACTION)
	}

	@Post("counterparties")
	@ApiResponse({
		status: HttpStatusCode.Ok,
		description: "Справочник контрагентов из МДМ успешно подгружен",
		type: String
	})
	async loadCounterparties(@Body() body: LoadListDto): Promise<string> {
		if (body.action === "load") {
			return await this.mdmService.loadCounterparties(body?.page)
		}

		throw new BadRequestException(Message.Error.WRONG_ACTION)
	}
}
