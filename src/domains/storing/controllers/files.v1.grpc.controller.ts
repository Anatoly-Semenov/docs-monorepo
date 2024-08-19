import { AuthSystemGuardGrpc } from "@docs/common/auth/guards/system-auth.guard"
import { GoogleTimestampBuilder } from "@docs/shared/builders/google.timestamp.builder"
import { GrpcExceptionBuilder } from "@docs/shared/builders/grpc-exception.builder"
import { StringBuilder } from "@docs/shared/builders/string.builder"
import { kindFilesGrpcMapper } from "@docs/shared/mappers"

import { Controller, Inject, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"

import { FilesDownloadService } from "@docs/storing/services/files-service/files-download.service"
import { FilesService } from "@docs/storing/services/files-service/files.service"

import {
	IOC__SERVICE__FILES,
	IOC__SERVICE__FILES_DOWNLOAD
} from "@docs/shared/constants/ioc.constants"

import {
	GrpcData,
	GrpcSystemPayload
} from "@docs/shared/decorators/grpc.decorator"

import {
	CreateDownloadFileJobDto,
	CreateDownloadFileJobGrpcDto
} from "@docs/shared/dto/v1/create-download-file-job.dto"
import {
	FileDto,
	FileResponseDto
} from "@docs/shared/dto/v1/db-dto/file/files.dto"
import {
	GetFormsGrpcDto,
	GrpcResponseDto,
	UploadFileGrpcDto
} from "@docs/shared/dto/v1/grpc"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import { Grpc } from "@docs/shared/types/grpc.types"

@Controller()
@AuthSystemGuardGrpc()
export class FilesGrpcControllerV1 {
	private readonly logger = new Logger(FilesGrpcControllerV1.name)

	private readonly grpcExceptionBuilder = new GrpcExceptionBuilder(this.logger)
	private readonly googleTimestampBuilder = new GoogleTimestampBuilder()
	private readonly stringBuilder = new StringBuilder()

	private unavailableResponse = new GrpcResponseDto({
		message: "Данный функционал недоступен",
		code: Grpc.Status.UNAVAILABLE,
		signId: ""
	})

	constructor(
		@Inject(IOC__SERVICE__FILES)
		private readonly filesService: FilesService,

		@Inject(IOC__SERVICE__FILES_DOWNLOAD)
		private readonly filesDownloadService: FilesDownloadService
	) {}

	@GrpcMethod("SigningService", "CreatedDownloadJob")
	async CreatedDownloadJob(
		@GrpcData() data: CreateDownloadFileJobGrpcDto,
		@GrpcSystemPayload() system: IJwtPayloadSystem
	): Grpc.Response {
		try {
			const response: string =
				await this.filesDownloadService.createDownloadJob(
					new CreateDownloadFileJobDto({
						file_type: data.fileType,
						source_id: data.sourceId,
						doc_id: data.docId,
						action: "createDownoadlJob"
					}),
					system
				)

			return new GrpcResponseDto({
				code: Grpc.Status.OK,
				signId: data.docId,
				message: response
			})
		} catch (error) {
			this.grpcExceptionBuilder.build(
				`Ошибка создания задачи на скачивание документа из Диадок ${this.stringBuilder.stringify(data)}`,
				error
			)
		}
	}

	@GrpcMethod("SigningService", "UploadFile")
	async UploadFile(
		@GrpcData() data: UploadFileGrpcDto,
		@GrpcSystemPayload() system: IJwtPayloadSystem
	): Grpc.Response {
		this.logger.log(
			`[GRPC] Создание документа DTO: ${JSON.stringify(data)}\nID системы: ${system?.system_id}`
		)

		const mappedFileData = new FileDto({
			begin_date: this.googleTimestampBuilder.formatTimestampToISOString(
				data.begindate
			),
			end_date: this.googleTimestampBuilder.formatTimestampToISOString(
				data.enddate
			),

			need_recipient_signature: data.needRecipientSignature,
			kind_files: kindFilesGrpcMapper(data.kindFiles),
			type_files: data.typeFiles,
			name_files: data.nameFiles,
			file_id: data.fileId,
			// @ts-ignore
			file: data.file
		})

		try {
			const response: FileResponseDto = await this.filesService.upload(
				mappedFileData,
				data.docId,
				data.file,
				system
			)

			return new GrpcResponseDto({
				code: Grpc.Status.OK,
				signId: data.docId,
				message: `Файл успешно загружен id=${response.id}`
			})
		} catch (error) {
			this.grpcExceptionBuilder.build(
				`Ошибка загрузки файла docId=${data.docId}`,
				error
			)
		}
	}

	@GrpcMethod("SigningService", "GetForms")
	async GetForms(
		@GrpcData() data: GetFormsGrpcDto,
		@GrpcSystemPayload() system: IJwtPayloadSystem
	): Grpc.Response {
		return this.unavailableResponse

		// return await this.filesService.downloadFile(
		// 	data.sourceId,
		// 	data.fileType,
		// 	system
		// )
	}

	@GrpcMethod("SigningService", "UploadFilesStream")
	async UploadFilesStream(
		@GrpcData() data: UploadFileGrpcDto,
		@GrpcSystemPayload() system: IJwtPayloadSystem
	): Grpc.Response {
		this.logger.log(
			`[GRPC] Создание документа DTO: ${JSON.stringify(data)}\nID системы: ${system?.system_id}`
		)

		return this.unavailableResponse

		// return this.filesService.upload(data, data.doc_id, data.file, system)
	}
}
