import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Inject,
	Param,
	Post,
	Query
} from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"

import { OperatorService } from "../services/operator-service/operator.service"
import { IOperatorForConnectWrapper } from "@docs/shared/interfaces/services/operator-service.interfaces"

import { IOC__SERVICE__OPERATORS } from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_1 } from "@docs/shared/constants/router.constants"

import { LoadListDto } from "@docs/shared/dto/v1/db-dto/load-list.dto"
import { OperatorsQueryDto } from "@docs/shared/dto/v1/operators.dto"

import { Message } from "@docs/shared/enums/message.enum"

@Controller({
	path: "operators",
	version: ROUTER__VERSION_1
})
@ApiTags("Operators v1")
export class OperatorsControllerV1 {
	constructor(
		@Inject(IOC__SERVICE__OPERATORS)
		private readonly operatorService: OperatorService
	) {}

	@Post()
	async handlePostMethod(@Body() body: LoadListDto): Promise<string> {
		if (body.action === "load") {
			return await this.operatorService.loadRoamingOperators()
		}

		throw new BadRequestException(Message.Error.WRONG_ACTION)
	}

	@Get(":id")
	async getActiveOperators(
		@Param("id") organizationId: string,
		@Query() operatorsDto: OperatorsQueryDto
	): Promise<IOperatorForConnectWrapper> {
		return await this.operatorService.getActiveOperators(
			organizationId,
			operatorsDto.counterpartyIds
		)
	}
}
