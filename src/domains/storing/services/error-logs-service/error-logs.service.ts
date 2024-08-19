import { Inject, Injectable, Logger } from "@nestjs/common"

import { ErrorLogsServiceDb } from "@docs/common/db/services/error-logs-service/error-logs-db.service"

import { IOC__SERVICE__ERROR_LOGS_DB } from "@docs/shared/constants/ioc.constants"

import { ErrorLogs } from "@docs/common/db/entities/error-logs.entity"

import { CreateErrorLogDto } from "@docs/shared/dto/v1/db-dto/error/create-error.dto"

@Injectable()
export class ErrorLogsService {
	constructor(
		@Inject(IOC__SERVICE__ERROR_LOGS_DB)
		private readonly errorLogsServiceDb: ErrorLogsServiceDb
	) {}

	private logger: Logger = new Logger(ErrorLogsService.name)

	public async addError(createErrorDto: CreateErrorLogDto): Promise<ErrorLogs> {
		const { doc_id, errors } = createErrorDto
		this.logger.log(`Добавляю для doc_id=${doc_id} ошибку ${errors}`)

		let existErrorLog: ErrorLogs =
			await this.errorLogsServiceDb.getByDocId(doc_id)

		if (!existErrorLog) {
			return this.errorLogsServiceDb.create(createErrorDto)
		}

		const newErrors: string[] = existErrorLog.errors?.split(";") ?? []
		newErrors.push(createErrorDto.errors)

		return this.errorLogsServiceDb.updateByDocId({
			doc_id,
			errors: newErrors.join(";")
		})
	}

	public async clearErrors(docId: string): Promise<string> {
		this.logger.log(`Очистка лога ошибок для doc_id=${docId}`)
		return this.errorLogsServiceDb.softRemoveByDocId(docId)
	}

	public async getErrorLogsByDocId(docId: string): Promise<ErrorLogs> {
		return this.errorLogsServiceDb.getByDocId(docId)
	}
}
