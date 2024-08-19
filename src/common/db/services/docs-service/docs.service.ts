import {
	BadRequestException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { IsNull, Repository } from "typeorm"

import { checkAccessToDoc } from "@docs/shared/helpers/auth.helper"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"

import { CreateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/create-docs.dto"
import { UpdateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/update-docs.dto"
import { DocResponseDto } from "@docs/shared/dto/v1/doc.responses.dto"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

@Injectable()
export class DocsServiceDb {
	private readonly logger = new Logger(DocsServiceDb.name)

	constructor(
		@InjectRepository(Docs)
		private readonly docsRepository: Repository<Docs>
	) {}

	private setError(message: string, error: any): void {
		this.logger.error(message)
		throw new InternalServerErrorException(
			`${message} | ${JSON.stringify(error)}`
		)
	}

	public async create(createDocsDto: CreateDocsDto): Promise<Docs> {
		try {
			this.logger.log(`Создаю новую запись о документе`)

			const { boxes_id, ...document } = createDocsDto

			// Массив храним как строки через ","
			let boxesIdString: string
			if (Array.isArray(boxes_id) && boxes_id?.length) {
				boxesIdString = boxes_id.join(",")
			} else {
				boxesIdString = null
			}

			const newDocument: Docs = await this.docsRepository.save(
				this.docsRepository.create({
					...document,
					boxes_id: boxesIdString
				})
			)

			this.logger.log(
				`Документ успешно создан, id=${newDocument.id}, doc_id=${newDocument.doc_id}`
			)

			return newDocument
		} catch (error) {
			const message: string = `Не получилось создать документ с doc_id=${createDocsDto.doc_id}: ${error.message}`

			this.logger.error(message)
			throw new BadRequestException(message)
		}
	}

	public async setMessageId(docId: string, messageId: string): Promise<Docs> {
		this.logger.log(
			`Присваиваю message_id=${messageId} для документа с doc_id=${docId}`
		)

		const docInstance: Docs = await this.getByDocId(docId)

		docInstance.messages_id = messageId

		try {
			const result: Docs = await this.updateEntity(docInstance)

			this.logger.log(
				`Успешно присвоен message_id=${messageId} для документа с doc_id=${docId}`
			)

			return result
		} catch (error) {
			this.setError(
				`Не получилось присвоить message_id=${messageId} для документа с doc_id=${docId}`,
				error
			)
		}
	}

	public async updateEntity(document: Docs): Promise<Docs> {
		try {
			this.logger.log(
				`Обновляю запись о документе, id=${document.id}, doc_id=${document.doc_id}`
			)

			const newDocument: Docs = await this.docsRepository.save(document)

			this.logger.log(
				`Документ успешно обновлен, id=${newDocument.id}, doc_id=${newDocument.doc_id}`
			)

			return newDocument
		} catch (error) {
			const message: string = `Не получилось обновить документ с doc_id=${document.doc_id}`

			this.logger.error(message)
			throw new BadRequestException(message)
		}
	}

	public async deleteByDocId(
		docId: string,
		initiator?: string
	): Promise<DocResponseDto> {
		const docInstance = await this.getByDocIdWithoutAuth(docId)

		if (!docInstance) {
			this.logger.log(`Не найден документ по doc_id: ${docId}`)
			throw new NotFoundException("Документ не найден")
		}

		this.logger.log(`Удаляю запись о документе с doc_id: ${docId}`)

		if (initiator) {
			docInstance.deleted_by = initiator
		} else {
			docInstance.deleted_by = docInstance.system_id
		}

		await this.docsRepository.manager.transaction(async (entityManager) => {
			await entityManager.save(docInstance)
			return entityManager.softRemove(docInstance)
		})

		return new DocResponseDto("Документ удалён", docInstance.id, HttpStatus.OK)
	}

	public async getById(id: string, relations: string[] = []): Promise<Docs> {
		this.logger.log(`Ищу запись о документе с ID: ${id}`)
		const docInstance: Docs = await this.docsRepository.findOne({
			relations,
			where: {
				id,
				deleted_at: IsNull()
			}
		})

		if (!docInstance) {
			this.logger.log(`Не найден документ по ID: ${id}`)
			throw new NotFoundException("Документ не найден")
		}

		return docInstance
	}

	public async getByDocId(
		docId: string,
		relations: string[] = ["system", "DocsLinkAsParent"]
	): Promise<Docs> {
		this.logger.log(`Ищу запись о документе с doc_id: ${docId}`)
		const docInstance: Docs = await this.docsRepository.findOne({
			where: {
				doc_id: docId,
				deleted_at: IsNull()
			},
			relations
		})

		if (!docInstance) {
			this.logger.error(`Не найден документ по doc_id: ${docId}`)
			throw new NotFoundException("Документ не найден")
		}

		return docInstance
	}

	public async getListByDocId(
		docId: string,
		relations: string[] = []
	): Promise<Docs[]> {
		this.logger.log(`Ищу записи о документах с doc_id: ${docId}`)
		const docsList: Docs[] = await this.docsRepository.find({
			where: {
				doc_id: docId,
				deleted_at: IsNull()
			},
			relations
		})

		if (!docsList) {
			this.logger.error(`Не найдены документы по doc_id: ${docId}`)
			throw new NotFoundException("Документы не найдены")
		}

		return docsList
	}

	public async getByDocIdWithAuth(
		docId: string,
		systemPayload: IJwtPayloadSystem,
		relations: string[] = ["system", "DocsLinkAsParent"]
	): Promise<Docs> {
		const docInstance: Docs = await this.getByDocId(docId, relations)

		this.logger.log(`Проверка доступа системы к документу ${docInstance.id}`)
		checkAccessToDoc(docInstance, systemPayload.system_id)

		return docInstance
	}

	public async getByDocIdWithoutAuth(docId: string): Promise<Docs> {
		this.logger.log(`Ищу запись о документе с doc_id: ${docId}`)
		const docInstance = await this.docsRepository.findOne({
			where: {
				doc_id: docId,
				deleted_at: IsNull()
			},
			relations: ["system"]
		})

		if (!docInstance) {
			this.logger.log(`Не найден документ по doc_id: ${docId}`)
			throw new NotFoundException("Документ не найден")
		}

		return docInstance
	}

	public async getExtendedDocInfoById(id: string): Promise<Docs> {
		this.logger.log(`Ищу запись о документе с ID: ${id}`)
		const docInstance = await this.docsRepository.findOne({
			where: {
				id,
				deleted_at: IsNull()
			},
			relations: [
				"files",
				"files.status",
				"status",
				"system",
				"organization",
				"docsRecipient",
				"docsRecipient.counterparties"
			]
		})

		if (!docInstance) {
			this.logger.log(`Не найден документ по ID: ${id}`)
			throw new NotFoundException("Документ не найден")
		}

		return docInstance
	}

	public async getExtendedDocByMessageId(messageId: string): Promise<Docs> {
		this.logger.log(`Ищу запись о документе с message_id: ${messageId}`)
		const docInstance = await this.docsRepository.findOne({
			where: {
				messages_id: messageId,
				deleted_at: IsNull()
			},
			relations: ["files", "files.status", "status"]
		})

		if (!docInstance) {
			//** Пропуск обработки файлов, которых нет в этом инстансе сервиса */
			this.logger.log(`Не найден документ по message_id: ${messageId}`)
			return undefined
		}

		return docInstance
	}

	/**
	 * Функция для установки основной ссылки документа
	 * на основе его файлов
	 * @param id внутренний ID документа
	 * @returns Promise<Docs>
	 */
	public async setMainLink(id: string): Promise<Docs> {
		this.logger.log(`Устанавливаю основную ссылку для документа с ID: ${id}`)
		const docInstance: Docs = await this.docsRepository.findOne({
			where: {
				id
			},
			relations: ["files"]
		})

		const mainLink: string =
			(
				docInstance.files.filter((file: Files) => file.is_main)[0] ??
				docInstance.files[0]
			)?.link_diadoc || ""

		this.logger.log(
			`Устанавливаю mainLink=${mainLink} для документа id=${docInstance.id}`
		)
		docInstance.link_diadoc = mainLink

		try {
			return await this.docsRepository.save(docInstance)
		} catch (e) {
			const message: string = `Не получилось установить mainLink=${mainLink} для документа id=${docInstance.id}`

			this.logger.error(message)

			throw new InternalServerErrorException(message)
		}
	}

	public async getByMessageId(
		messageId: string,
		relations: string[] = []
	): Promise<Docs> {
		this.logger.log(`Ищу документ по entityId ${messageId}`)
		const docInstance: Docs = await this.docsRepository.findOne({
			where: {
				messages_id: messageId
			}
		})

		if (!docInstance) {
			this.logger.error(`Документ с messageId ${messageId} не найден`)
			throw new NotFoundException("Не удалось подобрать документ")
		}

		return docInstance
	}

	public async checkAccessToDoc(
		payload: { doc_id?: string; id?: string },
		systemId: string
	): Promise<void> {
		let document: Docs

		if (payload.id) {
			document = await this.getById(payload.id, ["system"])
		} else if (payload.doc_id) {
			document = await this.getByDocId(payload.doc_id)
		} else {
			throw new BadRequestException(
				`Указан не корректный payload при проверки доступности документа для systemId=${systemId}`
			)
		}

		checkAccessToDoc(document, systemId)
	}

	async getFilesIdsByDocId(
		docId: string,
		isNotAdditionalDiadocFiles = false
	): Promise<string[]> {
		this.logger.log(`Поиск списка file.id по docId=${docId}`)

		let docInstance: Docs

		try {
			docInstance = (
				await this.docsRepository.find({
					relations: ["files"],
					where: { doc_id: docId }
				})
			)[0]
		} catch (error) {
			this.setError(`Ошибка поиска списка file.id по docId=${docId}`, error)
		}

		if (!docInstance) {
			throw new NotFoundException(`Не найден документ с doc_id=${docId}`)
		}

		if (isNotAdditionalDiadocFiles) {
			docInstance.files = docInstance.files.filter(
				(file: Files) => !file.is_print_form && !file.is_archive
			)
		}

		const filesIds: string[] = docInstance?.files?.map((file: Files) => file.id)

		if (!filesIds.length) {
			const message: string = `Нет ни одного файла по docId=${JSON.stringify(docId)}`

			this.logger.log(message)
			throw new NotFoundException(message)
		}

		return filesIds
	}

	async setTemplateLink(
		docId: string,
		link_diadoc_template: string
	): Promise<void> {
		try {
			this.logger.log(
				`Добавляю ссылку на шаблон документа doc_id=${docId} link_diadoc_template=${link_diadoc_template}`
			)

			await this.docsRepository.update(
				{
					doc_id: docId
				},
				{
					link_diadoc_template
				}
			)

			this.logger.log(
				`Ссылка на шаблон документа успешно добавлена doc_id=${docId} link_diadoc_template=${link_diadoc_template}`
			)
		} catch (error) {
			this.setError(
				`Ошибка добавления ссылки на шаблон документа doc_id=${docId} link_diadoc_template=${link_diadoc_template}`,
				error
			)
		}
	}
}
