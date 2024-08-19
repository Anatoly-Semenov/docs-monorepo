import {
	HttpException,
	HttpStatus,
	Injectable,
	Logger,
	NotFoundException
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { Repository } from "typeorm"

import { IDocsRecipientServiceDb } from "@docs/shared/interfaces/services/db/docs-recipient-service.interfaces"

import { DocsRecipient } from "@docs/common/db/entities/docs-recipient.entity"

import { CreateDocsRecipientDto } from "@docs/shared/dto/v1/db-dto/create-docs-recipient.dto"

@Injectable()
export class DocsRecipientServiceDb implements IDocsRecipientServiceDb {
	constructor(
		@InjectRepository(DocsRecipient)
		private readonly docsRecipientRepository: Repository<DocsRecipient>
	) {}

	private readonly logger = new Logger(DocsRecipientServiceDb.name)

	setError(
		error: string,
		errorStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
	): void {
		this.logger.error(error)

		throw new HttpException(error, errorStatus)
	}

	async create(dto: CreateDocsRecipientDto): Promise<DocsRecipient> {
		this.logger.log(`Создаю новую запись контрагента для подписания`)
		try {
			return await this.docsRecipientRepository.save(dto)
		} catch (e) {
			this.setError(
				`Ошибка создания записи контрагента. DocumentId=${dto.docs.id}, CounterpartyId=${dto.counterparties.id}, error=${e.message}`
			)
		}
	}

	async getByRecipientId(id: string): Promise<DocsRecipient> {
		this.logger.log(`Ищу контрагента для подписания по ID: ${id}`)
		try {
			const DocsRecipientInstance: DocsRecipient =
				await this.docsRecipientRepository.findOneBy({
					docsId: id
				})

			if (!DocsRecipientInstance) {
				this.setError(
					`Не найдена информация о контрагенте для подписания по ID: ${id}`,
					HttpStatus.NOT_FOUND
				)
			}

			return DocsRecipientInstance
		} catch (e) {
			if (e instanceof NotFoundException) {
				throw e
			}

			this.setError(
				`Возникла ошибка при поиске контрагента подписания по ID=${id}`
			)
		}
	}

	async getByDocumentId(documentId: string): Promise<DocsRecipient[]> {
		this.logger.log(`Ищу записи DocsRecipient в БД по documentId=${documentId}`)
		try {
			const docsRecipientInstanse = await this.docsRecipientRepository.find({
				where: { docsId: documentId },
				relations: ["counterparties"]
			})

			if (!docsRecipientInstanse) {
				this.setError(
					`Не удалось найти контрагента подписания по documentId=${documentId}`,
					HttpStatus.NOT_FOUND
				)
			}

			return docsRecipientInstanse
		} catch (e) {
			this.setError(
				`Ошибка поиска контрагента подписания по documentId=${documentId}`
			)
		}
	}

	async update(docsId: string, dto: any): Promise<DocsRecipient> {
		this.logger.log(
			`Обновляю запись о контрагенте для подписания по docs_id: ${docsId}`
		)

		try {
			const docsRecipientInstance: DocsRecipient =
				await this.getByRecipientId(docsId)

			return this.docsRecipientRepository.save({
				...docsRecipientInstance,
				...dto
			})
		} catch (e) {
			this.setError(
				`Ошибка обновления контрагента подписания по ${docsId}, error = ${e.message}`
			)
		}
	}

	async delete(docsId: string): Promise<DocsRecipient> {
		try {
			const docsRecipientInstance: DocsRecipient =
				await this.getByRecipientId(docsId)

			this.logger.log(
				`Удаляю запись о контрагенте для подписания по docsId: ${docsId}`
			)
			return this.docsRecipientRepository.softRemove(docsRecipientInstance)
		} catch (e) {
			this.setError(
				`Ошибка удаления контрагента подписания по docsId: ${docsId}`
			)
		}
	}
}
