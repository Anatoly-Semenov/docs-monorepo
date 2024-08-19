import {
	AuthSystemGuard,
	SystemPayload
} from "@docs/common/auth/guards/system-auth.guard"
import { HttpStatusCode } from "axios"

import {
	BadRequestException,
	Body,
	Controller,
	Inject,
	Post
} from "@nestjs/common"
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger"

import { FilesDownloadService } from "../services/files-service/files-download.service"

import { IOC__SERVICE__FILES_DOWNLOAD } from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_1 } from "@docs/shared/constants/router.constants"

import { CreateDownloadFileJobDto } from "@docs/shared/dto/v1/create-download-file-job.dto"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import { Message } from "@docs/shared/enums/message.enum"

@Controller({
	path: "files",
	version: ROUTER__VERSION_1
})
@AuthSystemGuard()
@ApiBearerAuth()
@ApiTags("Files v1")
export class FilesControllerV1 {
	constructor(
		@Inject(IOC__SERVICE__FILES_DOWNLOAD)
		private readonly filesDownloadService: FilesDownloadService
	) {}

	@Post()
	@ApiResponse({
		status: HttpStatusCode.Ok,
		description: "Задача успешно создана"
	})
	async createDownloadJob(
		@Body() body: CreateDownloadFileJobDto,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	): Promise<string> {
		switch (body.action) {
			case "createDownloadJob":
				return await this.filesDownloadService.createDownloadJob(
					body,
					systemPayload
				)
			default:
				throw new BadRequestException(Message.Error.WRONG_ACTION)
		}
	}
}
