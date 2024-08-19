import {
	AuthSystemGuard,
	SystemPayload
} from "@docs/common/auth/guards/system-auth.guard"
import { HttpStatusCode } from "axios"

import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Inject,
	Logger,
	Param,
	ParseUUIDPipe,
	Post,
	Put
} from "@nestjs/common"
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger"

import { DeleteDocsService } from "@docs/storing/services/delete-docs-service/delete-docs.service"
import { DocsService } from "@docs/storing/services/docs-service/docs.service"

import {
	IOC__SERVICE__DELETE_DOCS,
	IOC__SERVICE__DOCS
} from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_2 } from "@docs/shared/constants/router.constants"

import { ActionDto } from "@docs/shared/dto/common/action.dto"
import { CreateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/create-docs.dto"
import {
	DocPublishResponseDto,
	DocResponseDto
} from "@docs/shared/dto/v1/doc.responses.dto"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import { Message } from "@docs/shared/enums/message.enum"

@Controller({
	path: "docs",
	version: ROUTER__VERSION_2
})
@AuthSystemGuard()
@ApiBearerAuth()
@ApiTags("Docs v2")
export class DocsControllerV2 {
	private readonly logger = new Logger(DocsControllerV2.name)

	constructor(
		@Inject(IOC__SERVICE__DOCS)
		private readonly docsService: DocsService,

		@Inject(IOC__SERVICE__DELETE_DOCS)
		private readonly deleteDocsService: DeleteDocsService
	) {}

	@Post()
	async handlePostMethod(
		@Body() body: ActionDto<CreateDocsDto>,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	): Promise<DocResponseDto> {
		switch (body.action) {
			case "create":
				// @ts-ignore
				const data = new CreateDocsDto(body.data)

				this.logger.log(
					`Создание документа DTO: ${JSON.stringify(data)}\nID системы: ${systemPayload?.system_id}`
				)
				return await this.docsService.create(data, systemPayload)
			default:
				throw new BadRequestException(Message.Error.WRONG_ACTION)
		}
	}

	@Put(":id")
	async handlePutMethod(
		@Param("id", new ParseUUIDPipe()) id: string,
		@Body() body: ActionDto<any>,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	): Promise<string | DocPublishResponseDto> {
		switch (body.action) {
			case "replace":
				return "Данный функционал недоступен"
			case "publish":
				this.logger.log(
					`Публикация документа: ${id}\nID системы: ${systemPayload?.system_id}`
				)
				return await this.docsService.setPublish(id, systemPayload)
			default:
				throw new BadRequestException(Message.Error.WRONG_ACTION)
		}
	}

	@Delete(":id")
	@ApiResponse({
		status: HttpStatusCode.Ok,
		description: "Удаление выполнено успешно"
	})
	@ApiResponse({
		status: HttpStatusCode.InternalServerError,
		description: "Ошибка удаления документа"
	})
	delete(
		@Param("id", new ParseUUIDPipe()) id: string,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	): Promise<string> {
		this.logger.log(
			`Получен запрос на удаление документа docId=${id} от системы ${systemPayload.system_id}`
		)
		return this.deleteDocsService.deleteFromSystem(id, systemPayload)
	}
}
