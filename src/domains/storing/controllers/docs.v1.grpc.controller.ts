import { AuthSystemGuardGrpc } from "@docs/common/auth/guards/system-auth.guard"
import { GoogleTimestampBuilder } from "@docs/shared/builders/google.timestamp.builder"
import { GrpcExceptionBuilder } from "@docs/shared/builders/grpc-exception.builder"
import { StringBuilder } from "@docs/shared/builders/string.builder"
import { grpcPacketLockModeMapper, grpcVgoMapper } from "@docs/shared/mappers"
import { docResponseGrpcMapper } from "@docs/shared/mappers/doc-response-grpc.mapper"

import { Controller, HttpException, Inject, Logger } from "@nestjs/common"
import { GrpcMethod, RpcException } from "@nestjs/microservices"

import { DeleteDocsService } from "@docs/storing/services/delete-docs-service/delete-docs.service"
import { DocsService } from "@docs/storing/services/docs-service/docs.service"

import {
	IOC__SERVICE__DELETE_DOCS,
	IOC__SERVICE__DOCS
} from "@docs/shared/constants/ioc.constants"

import {
	GrpcData,
	GrpcSystemPayload
} from "@docs/shared/decorators/grpc.decorator"

import { CreateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/create-docs.dto"
import {
	DocPublishResponseDto,
	DocResponseDto
} from "@docs/shared/dto/v1/doc.responses.dto"
import {
	GrpcResponseDto,
	SendDocGrpcDto,
	UpdateDocGrpcDto
} from "@docs/shared/dto/v1/grpc"

import { IHttpError } from "@docs/shared/interfaces/error/error.interfaces"
import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import { Grpc } from "@docs/shared/types/grpc.types"

@Controller()
@AuthSystemGuardGrpc()
export class DocsGrpcControllerV1 {
	private readonly logger = new Logger(DocsGrpcControllerV1.name)

	private readonly grpcExceptionBuilder = new GrpcExceptionBuilder(this.logger)
	private readonly stringBuilder = new StringBuilder()

	private unavailableResponse = new GrpcResponseDto({
		message: "Данный функционал недоступен",
		code: Grpc.Status.UNAVAILABLE,
		signId: ""
	})

	constructor(
		@Inject(IOC__SERVICE__DOCS)
		private readonly docsService: DocsService,

		@Inject(IOC__SERVICE__DELETE_DOCS)
		private readonly deleteDocsService: DeleteDocsService
	) {}

	@GrpcMethod("SigningService", "SendDocument")
	async SendDocument(
		@GrpcData() data: SendDocGrpcDto,
		@GrpcSystemPayload() system: IJwtPayloadSystem
	): Grpc.Response {
		this.logger.log(
			`[GRPC] Создание документа DTO: ${JSON.stringify(data)}\nID системы: ${system?.system_id}`
		)

		const regDate: string =
			new GoogleTimestampBuilder().formatTimestampToISOString(data.regDate)

		let result: DocResponseDto

		try {
			result = await this.docsService.create(
				new CreateDocsDto({
					need_recipient_signature: data?.need_recipient_signature || false,
					lockMode: grpcPacketLockModeMapper(data.lockMode),
					link_contr_system: data.linkContrSystem,
					counterparty_id: data.counterpartyId,
					currency_code: data.currencycode,
					document_kind: data.documentKind,
					is_cancelled: data.isCancelled,
					is_internal: data.isInternal,
					is_template: data.isTemplate,
					vgo: grpcVgoMapper(data.vgo),
					docs_id: data?.docsId || [],
					reg_number: data.regNumber,
					is_roaming: data.isRoaming,
					isRoaming: data.isRoaming,
					total_vat: data.totalvat,
					boxes_id: data.boxesId,
					comment: data.comment,
					doc_id: data.docId,
					org_id: data.orgId,
					reg_date: regDate,
					name: data.name,
					sum: data.sum
				}),
				system
			)
		} catch (error) {
			if (error instanceof HttpException) {
				const errorResponse: IHttpError = error.getResponse() as IHttpError

				throw new RpcException({
					code: Grpc.Status.INTERNAL,
					details: this.stringBuilder.stringify(errorResponse)
				})
			}
		}

		if (!result) {
			const message: string = "Неизвестная ошибка при создании документа"

			this.logger.error(message)

			throw new RpcException({
				code: Grpc.Status.UNKNOWN,
				details: message
			})
		}

		return docResponseGrpcMapper(result)
	}

	@GrpcMethod("SigningService", "PublishDocument")
	async PublishDocument(
		@GrpcData() data: UpdateDocGrpcDto,
		@GrpcSystemPayload() system: IJwtPayloadSystem
	): Grpc.Response {
		try {
			const response: DocPublishResponseDto = await this.docsService.setPublish(
				data.docId,
				system
			)

			return new GrpcResponseDto({
				message: response.message,
				code: response.code,
				signId: data.docId
			})
		} catch (error) {
			this.grpcExceptionBuilder.build(
				`Ошибка публикации документа docId=${data.docId}`,
				error
			)
		}
	}

	@GrpcMethod("SigningService", "ReplaceDocument")
	async ReplaceDocument(
		@GrpcData() data: UpdateDocGrpcDto,
		@GrpcSystemPayload() system: IJwtPayloadSystem
	): Grpc.Response {
		return this.unavailableResponse
	}

	@GrpcMethod("SigningService", "DeleteDocument")
	async DeleteDocument(
		@GrpcData() data: UpdateDocGrpcDto,
		@GrpcSystemPayload() system: IJwtPayloadSystem
	): Grpc.Response {
		this.logger.log(
			`[GRPC] Получен запрос на удаление документа docId=${data.docId} от системы ${system.system_id}`
		)

		try {
			const message: string = await this.deleteDocsService.deleteFromSystem(
				data.docId,
				system
			)

			return new GrpcResponseDto({
				code: Grpc.Status.OK,
				signId: data.docId,
				message: message
			})
		} catch (error) {
			this.grpcExceptionBuilder.build(
				`Ошибка удаления документа docId=${data.docId}`,
				error
			)
		}
	}
}
