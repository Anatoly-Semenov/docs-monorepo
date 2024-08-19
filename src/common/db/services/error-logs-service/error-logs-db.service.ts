import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { Repository } from "typeorm"

import { ErrorLogs } from "../../entities/error-logs.entity"

import { CreateErrorLogDto } from "@docs/shared/dto/v1/db-dto/error/create-error.dto"

@Injectable()
export class ErrorLogsServiceDb {
	constructor(
		@InjectRepository(ErrorLogs)
		private readonly errorLogsRepository: Repository<ErrorLogs>
	) {}
	private logger: Logger = new Logger(ErrorLogsServiceDb.name)

	public async create(createErrorDto: CreateErrorLogDto): Promise<ErrorLogs> {
		try {
			this.logger.log(
				`Создаю запись об ошибках для doc_id=${createErrorDto.doc_id}`
			)
			return this.errorLogsRepository.save(
				this.errorLogsRepository.create(createErrorDto)
			)
		} catch (e) {
			this.setError(
				`Ошибка создания записи лога doc_id=${createErrorDto.doc_id}`
			)
		}
	}

	public async getByDocId(docId: string): Promise<ErrorLogs> {
		try {
			return this.errorLogsRepository.findOneBy({
				doc_id: docId
			})
		} catch (e) {
			this.setError(`Ошибка получения лога по doc_id ${docId}`)
		}
	}

	public async updateByDocId(
		createErrorDto: CreateErrorLogDto
	): Promise<ErrorLogs> {
		const { doc_id } = createErrorDto
		this.logger.log(`Обновляю лог ошибки по doc_id=${doc_id}`)

		try {
			const errorLog: ErrorLogs = await this.getByDocId(doc_id)

			if (!errorLog) {
				this.setError(
					`Не найден лог ошибки по doc_id=${doc_id}`,
					HttpStatus.NOT_FOUND
				)
			}

			return this.errorLogsRepository.save({
				id: errorLog.id,
				...createErrorDto
			})
		} catch (e) {
			this.setError(`Ошибка обновления лога ошибок по doc_id=${doc_id}`)
		}
	}

	public async softRemoveByDocId(docId: string) {
		this.logger.log(`Запускаю soft-удаление лога ошибок для doc_id=${docId}`)

		const errorLogInstance: ErrorLogs = await this.getByDocId(docId)

		if (!errorLogInstance) {
			this.setError(
				`Не найден лог ошибки по doc_id=${docId}`,
				HttpStatus.NOT_FOUND
			)
		}

		try {
			await this.errorLogsRepository.softRemove(errorLogInstance)
			return `Лог ошибок для doc_id ${docId} успешно удалён`
		} catch (e) {
			this.setError(`ошибка очистки лога ошибок по doc_id ${docId}`)
		}
	}

	private setError(
		errorMessage: string,
		httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
	): void {
		this.logger.error(errorMessage)
		throw new HttpException(errorMessage, httpStatus)
	}
}
