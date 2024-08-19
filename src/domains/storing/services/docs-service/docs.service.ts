import { MetaDataBuilder } from "@docs/shared/builders/diadoc-metadata.builder"
import { StatusMapper } from "@docs/shared/mappers"

import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	HttpStatus,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { DiadocClientService } from "@docs/common/clients/providers/diadoc/diadoc-client.service"
import { S3ClientService } from "@docs/common/clients/providers/s3/s3-client.service"

import { DiadocService } from "../diadoc-service/diadoc.service"
import { ErrorLogsService } from "../error-logs-service/error-logs.service"
import { MdmService } from "../mdm-service/mdm.service"
import { DocsLinksServiceDb } from "@docs/common/db/services/docs-links-service/docs-links.service"
import { DocsRecipientServiceDb } from "@docs/common/db/services/docs-recipient-service/docs-recipient.service"
import { DocsServiceDb } from "@docs/common/db/services/docs-service/docs.service"
import { FilesServiceDb } from "@docs/common/db/services/files-service/files.service"
import { OrganizationServiceDb } from "@docs/common/db/services/organizations/organization.service"
import { PacketsServiceDb } from "@docs/common/db/services/packets-service/packets.service"
import { StatusServiceDb } from "@docs/common/db/services/status-service/status.service"
import { SystemsServiceDb } from "@docs/common/db/services/systems-service/systems.service"
import { CounterpartyServiceDb } from "@docs/common/db/services/сounterparty-service/counterparty.service"
import { KafkaService } from "@docs/common/kafka-service/kafka.service"
import {
	ICounterpartyData,
	IDiadocStatus,
	IDocsService,
	IDocumentAttachments,
	ILinkedDocsDataForUpload,
	IMetadata,
	IMetaDataKeys
} from "@docs/shared/interfaces/services/docs-service.interfaces"
import { IBoxIdResult } from "@docs/shared/interfaces/services/mdm-service.interfaces"

import { DIADOC_URL } from "@docs/shared/constants/config.constants"
import { CRUD__INITIATOR_SYSTEM } from "@docs/shared/constants/crud.constants"
import {
	IOC__KAFKA_SERVICE,
	IOC__SERVICE__CLIENT_PROVIDER_DIADOC,
	IOC__SERVICE__CLIENT_PROVIDER_S3,
	IOC__SERVICE__COUNTERPARTY_DB,
	IOC__SERVICE__DIADOC,
	IOC__SERVICE__DOCS_DB,
	IOC__SERVICE__DOCS_LINKS_DB,
	IOC__SERVICE__DOCS_RECIPIENT_DB,
	IOC__SERVICE__ERROR_LOGS,
	IOC__SERVICE__FILES_DB,
	IOC__SERVICE__MDM,
	IOC__SERVICE__ORGANIZATION_DB,
	IOC__SERVICE__PACKETS_DB,
	IOC__SERVICE__STATUS_DB,
	IOC__SERVICE__SYSTEMS_DB
} from "@docs/shared/constants/ioc.constants"

import { DocsValidator } from "../../validators/docs.validator"
import { ValidatorInstance } from "@docs/shared/types/validator.types"

import { Counterparty } from "@docs/common/db/entities/counterparty.entity"
import { DocsRecipient } from "@docs/common/db/entities/docs-recipient.entity"
import { Docs } from "@docs/common/db/entities/docs.entity"
import { DocsLinks } from "@docs/common/db/entities/docs_links.entity"
import { ErrorLogs } from "@docs/common/db/entities/error-logs.entity"
import { Files } from "@docs/common/db/entities/files.entity"
import { Organizations } from "@docs/common/db/entities/organizations.entity"
import { Packets } from "@docs/common/db/entities/packets.entity"
import { Status } from "@docs/common/db/entities/status.entity"

import {
	SendDocumentToDiadocDto,
	SendTemplateToDiadocDto
} from "@docs/shared/dto/v1"
import { CreateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/create-docs.dto"
import { UpdateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/update-docs.dto"
import {
	DocPublishResponseDto,
	DocResponseDto
} from "@docs/shared/dto/v1/doc.responses.dto"

import {
	IDiadocEntity,
	IDiadocSendResponse,
	IDiadocTemplateResponse
} from "@docs/shared/interfaces/client/diadoc.interfaces"
import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import {
	FileType,
	KindFiles,
	StatusName,
	StatusSeverity
} from "@docs/shared/enums/files.enum"
import { OrganizationFeature } from "@docs/shared/enums/organization.enum"
import { PacketLockmode } from "@docs/shared/enums/packet.enum"

type PreparedDiadocData = {
	packetLockMode: PacketLockmode
	orgInstance: Organizations
	fromBoxIdGuid: string
	proxyBoxId: string
	fromBoxId: string
	toBoxId: string
}

@Injectable()
export class DocsService implements IDocsService {
	constructor(
		@Inject(IOC__SERVICE__SYSTEMS_DB)
		private readonly systemsServiceDb: SystemsServiceDb,

		@Inject(IOC__SERVICE__ORGANIZATION_DB)
		private readonly organizationServiceDb: OrganizationServiceDb,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_S3)
		private readonly s3ClientService: S3ClientService,

		@Inject(IOC__SERVICE__MDM)
		private readonly mdmService: MdmService,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_DIADOC)
		private readonly diadocClientService: DiadocClientService,

		@Inject(IOC__SERVICE__PACKETS_DB)
		private readonly packetServiceDb: PacketsServiceDb,

		@Inject(IOC__SERVICE__FILES_DB)
		private readonly filesServiceDb: FilesServiceDb,

		@Inject(IOC__SERVICE__STATUS_DB)
		private readonly statusServiceDb: StatusServiceDb,

		@Inject(IOC__KAFKA_SERVICE)
		private readonly kafkaService: KafkaService,

		@Inject(IOC__SERVICE__COUNTERPARTY_DB)
		private readonly counterpartyServiceDb: CounterpartyServiceDb,

		@Inject(IOC__SERVICE__DOCS_RECIPIENT_DB)
		private readonly docsRecipientServiceDb: DocsRecipientServiceDb,

		@Inject(IOC__SERVICE__DOCS_DB)
		private readonly docsServiceDb: DocsServiceDb,

		@Inject(IOC__SERVICE__DOCS_LINKS_DB)
		private readonly docsLinksServiceDb: DocsLinksServiceDb,

		@Inject(IOC__SERVICE__ERROR_LOGS)
		private readonly errorLogService: ErrorLogsService,

		@Inject(IOC__SERVICE__DIADOC)
		private readonly diadocService: DiadocService,

		private readonly configService: ConfigService
	) {}

	private readonly diadocUrl = this.configService.getOrThrow(DIADOC_URL)
	private readonly logger = new Logger(DocsService.name)

	/**
	 * Функция для получения от смежных систем документа
	 * @param createDocsDto ДТО документа
	 * @param systemPayload Данные системы
	 * @returns Promise<DocResponseDto>
	 */
	async create(
		createDocsDto: CreateDocsDto,
		systemPayload: IJwtPayloadSystem
	): Promise<DocResponseDto> {
		const docId: string = createDocsDto.doc_id

		// Проверка на дублирование документа
		if (createDocsDto?.doc_id) {
			this.logger.log(`Проверяю документ на дублирование по doc_id: ${docId}`)

			if (await this.checkDuplicateDocument(docId)) {
				const errorMessage: string = `Документ с doc_id ${docId} уже создан и/или имеет действующий статус`
				this.logger.error(errorMessage)

				await this.errorLogService.addError({
					doc_id: docId,
					errors: errorMessage
				})

				throw new ConflictException(errorMessage)
			}

			this.logger.log(`Дубликаты по doc_id: ${docId} не найдены`)
		}

		const {
			org_id,
			kontragent,
			kontragent_id,
			counterparty_id,
			counterparties_id,
			is_roaming,
			lock_mode,
			boxes_id,
			system_id, // Удаляется из DTO
			...dtoWithoutUnused
		} = createDocsDto
		const orgInstance: Organizations =
			await this.organizationServiceDb.getById(org_id)

		/** Обратная совместимость нейминга полей */
		let counterpartyIds: string[]
		if (counterparties_id?.length) {
			counterpartyIds = counterparties_id
		} else if (counterparty_id?.length) {
			counterpartyIds = counterparty_id
		} else {
			counterpartyIds = kontragent_id
		}

		const counterpartyData: ICounterpartyData = {
			ids: counterpartyIds,
			inn: kontragent
		}

		this.logger.log(
			`Список контрагентов по документу doc_id=${docId}: ${JSON.stringify(kontragent_id ?? kontragent)}`
		)

		let counterpartyInstances: Counterparty[]
		let counterPartyInn: string[]

		if (!boxes_id?.length) {
			if (counterpartyData?.ids) {
				counterpartyInstances = await this.counterpartyServiceDb.getById(
					counterpartyData?.ids
				)
			} else if (counterpartyData?.inn) {
				counterpartyInstances = await this.counterpartyServiceDb.getByInn(
					counterpartyData.inn
				)
			} else {
				const errorMessage = `Не получены данные о контрагентах`
				this.logger.error(errorMessage)

				await this.errorLogService.addError({
					doc_id: docId,
					errors: errorMessage
				})

				throw new BadRequestException(errorMessage)
			}

			counterPartyInn = counterpartyInstances.map(
				(counterparty) => counterparty.inn
			)
		}

		// Валидация
		try {
			const docsValidator: ValidatorInstance<void> = new DocsValidator(
				createDocsDto,
				counterPartyInn,
				orgInstance,
				counterpartyData
			)

			docsValidator.validate()
		} catch (e) {
			const errMessage: string = `Ошибка валидации документа: ${e.message}`
			this.logger.error(errMessage)

			/** Если не указано doc_id то нет возможности аккумулировать по нему ошибки */
			if (!docId) {
				throw new BadRequestException(errMessage)
			}

			await this.errorLogService.addError({
				doc_id: docId,
				errors: errMessage
			})

			throw new BadRequestException(errMessage)
		}

		// Проверка учётной записи в Диадок
		try {
			await this.checkBoxIds(orgInstance, counterpartyData)
		} catch (e) {
			const errMessage = `Ошибка проверки учётной записи в Диадок: ${e.message}`

			if (e instanceof NotFoundException) {
				this.logger.error(errMessage)

				await this.errorLogService.addError({
					doc_id: docId,
					errors: errMessage
				})

				throw new NotFoundException(errMessage)
			}

			await this.errorLogService.addError({
				doc_id: docId,
				errors: errMessage
			})

			throw new InternalServerErrorException(errMessage)
		}

		const systemInstance = await this.systemsServiceDb.getById(
			systemPayload.system_id
		)

		if (!systemInstance) {
			const errorMessage: string = `Система ${systemPayload.system_id} не зарегистрирована`
			this.logger.error(errorMessage)

			await this.errorLogService.addError({
				doc_id: docId,
				errors: errorMessage
			})
			throw new BadRequestException("Данная система не зарегистрирована")
		}

		const newDoc: Docs = await this.docsServiceDb.create(
			new CreateDocsDto({
				link_contr_system: createDocsDto.link_contr_system,
				isRoaming: is_roaming ?? false,
				created_by: systemInstance.id,
				system_id: systemInstance.id,
				organization: orgInstance,
				lockMode: lock_mode,
				boxes_id,

				...dtoWithoutUnused
			})
		)

		if (counterpartyInstances?.length) {
			// Проверка на многостороннее подписание
			if (counterpartyInstances.length > 1 && !orgInstance.is_proxy_allowed) {
				const errorMessage: string = `У данной организации нет прав на отправку документа на многостороннее подписание (Отсутствует право ${OrganizationFeature.ALLOW_PROXIFIED_DOCUMENTS} в Диадок) org_id=${orgInstance.org_id}`

				this.logger.error(errorMessage)
				throw new ForbiddenException(errorMessage)
			}

			this.logger.log(
				`Создаю сущности DocsRecipient для doc_id=${newDoc.doc_id}`
			)

			await Promise.all(
				counterpartyInstances.map(async (counterparty) => {
					return await this.docsRecipientServiceDb.create({
						counterparties: counterparty,
						docs: newDoc,
						order: counterpartyData.ids?.length
							? counterpartyData.ids.indexOf(counterparty.id)
							: counterpartyData.inn.indexOf(counterparty.inn)
					})
				})
			)
		} else {
			this.logger.log(
				`Пропускаю создание сущностей DocsRecipient, т.к. используется прямая отправка по boxes_id для doc_id=${newDoc.doc_id}`
			)
		}

		// Обработка связанных документов
		await this.linkDocuments(newDoc, createDocsDto.docs_id)

		return new DocResponseDto(
			"Документ принят для передачи на подпись",
			newDoc.doc_id,
			HttpStatus.CREATED
		)
	}

	/**
	 * Проверка и сохранение boxId отправителя и получателя
	 * @param organizationInstance
	 * @param kontragent
	 */
	async checkBoxIds(
		organizationInstance: Organizations,
		counterpartyData: ICounterpartyData
	): Promise<void> {
		try {
			await this.mdmService.getBoxIdOrganization(organizationInstance.id)
		} catch (e) {
			this.logger.error(
				`Ошибка проверки boxId организации ${organizationInstance.id}, error: ${e.message}`
			)

			if (e instanceof NotFoundException) {
				throw new NotFoundException(
					"Организация не участвует в документообороте"
				)
			}

			throw new InternalServerErrorException(
				`Ошибка при проверке boxId организации ${organizationInstance.id}`
			)
		}

		/** Если выполняется прямая отправка по boxes_id, то контрагентов не проверяем */
		if (counterpartyData?.ids?.length || counterpartyData?.inn?.length) {
			this.logger.log("Выполняется проверка контрагентов")
			try {
				const updatedOrgInstance: Organizations =
					await this.organizationServiceDb.getById(organizationInstance.id)

				await this.mdmService.checkBoxesCounterparty(
					counterpartyData,
					updatedOrgInstance.org_id_diadoc
				)
			} catch (e) {
				this.logger.error(
					`Ошибка проверки массива контрагентов: ${e.message} для организации с ID = ${organizationInstance.id}`
				)
				throw new NotFoundException(e.message)
			}
		} else {
			this.logger.log(
				"Проверка контрагентов пропущена, т.к. используется прямая отправка по boxes_id"
			)
		}
	}

	async getById(id: string, relations: string[] = []): Promise<Docs> {
		return this.docsServiceDb.getById(id, relations)
	}

	async getByDocId(
		docId: string,
		systemPayload: IJwtPayloadSystem,
		relations: string[] = ["system", "DocsLinkAsParent"]
	): Promise<Docs> {
		return this.docsServiceDb.getByDocIdWithAuth(
			docId,
			systemPayload,
			relations
		)
	}

	async getExtendedDocInfoById(id: string): Promise<Docs> {
		return await this.docsServiceDb.getExtendedDocInfoById(id)
	}

	async getExtendedDocByMessageId(messageId: string): Promise<Docs> {
		return await this.docsServiceDb.getExtendedDocByMessageId(messageId)
	}

	async update(
		docId: string,
		updateDocsDto: Partial<UpdateDocsDto>,
		systemPayload: IJwtPayloadSystem
	): Promise<DocResponseDto> {
		const docInstance = await this.docsServiceDb.getByDocIdWithAuth(
			docId,
			systemPayload
		)
		const systemInstance = await this.systemsServiceDb.getById(
			docInstance.system_id
		)

		docInstance.updated_by = docInstance?.system_id || CRUD__INITIATOR_SYSTEM

		this.logger.log(`Обновляю запись о документе по doc_id: ${docId}`)
		// @ts-ignore
		await this.docsServiceDb.updateEntity({
			...docInstance,
			...updateDocsDto,
			system: systemInstance
		})

		return new DocResponseDto(
			"Документ обновлён",
			"3dda3f46-73a2-4978-b2c7-df59743ab8a7",
			HttpStatus.OK
		)
	}

	async deleteByDocId(
		docId: string,
		initiator?: string
	): Promise<DocResponseDto> {
		return await this.docsServiceDb.deleteByDocId(docId, initiator)
	}

	async removeDocumentWithFiles(id: string): Promise<boolean> {
		this.logger.log(`Запущено удаление файлов и документа с ID = ${id}`)
		const docInstance = await this.docsServiceDb.getExtendedDocInfoById(id)
		const systemId: string = docInstance.system.id
		const fileInstances = docInstance.files

		await this.filesServiceDb.bullSoftDeleteByInstances(fileInstances, systemId)

		this.logger.log(`Удалено ${fileInstances.length} файлов`)

		this.logger.log(`Удаляю документ ${id}`)
		await this.deleteByDocId(docInstance.doc_id, systemId)

		return true
	}

	/**
	 * Функция для публикации (отправки в Диадок) документа вместе с файлами
	 * @param docId значение doc_id
	 * @returns Promise<DocPublishResponseDto>
	 */
	async setPublish(
		docId: string,
		systemPayload: IJwtPayloadSystem
	): Promise<DocPublishResponseDto> {
		const docInstanceCheck = await this.docsServiceDb.getByDocId(docId, [
			"files",
			"files.status",
			"status"
		])

		/** Проверка наличия основного файла */
		if (!docInstanceCheck.files.find((file) => file.is_main)) {
			await this.errorLogService.addError({
				doc_id: docInstanceCheck.doc_id,
				errors: `Документ doc_id = ${docInstanceCheck.doc_id} не имеет основного файла`
			})
		}

		let errors: string[] = []
		const errorLog: ErrorLogs =
			await this.errorLogService.getErrorLogsByDocId(docId)

		if (errorLog && errorLog.errors) {
			errors = errorLog.errors.split(";")
		}

		if (errors.length) {
			const errorMessage: string = `Документ не опубликован, имеются следующие ошибки: ${errors.join(", ")}`

			this.logger.error(errorMessage)

			this.logger.log(`Удаляю логи по doc_id=${docId} (soft delete)`)
			await this.errorLogService.clearErrors(docId)

			try {
				const docInstance: Docs = await this.docsServiceDb.getByDocId(docId)

				await this.removeDocumentWithFiles(docInstance.id)
			} catch (e) {
				this.logger.log(
					`Документ по doc_id = ${docId} не сохранён в БД, пропускаю удаление`
				)
			}

			throw new BadRequestException(errorMessage)
		}

		const docInstance: Docs = await this.docsServiceDb.getByDocIdWithAuth(
			docId,
			systemPayload
		)

		try {
			await this.docsServiceDb.updateEntity(docInstance)
		} catch (error) {
			const message: string = `Ошибка сохранения документа doc_id=${docId} при публикации в диадок`

			await this.errorLogService.addError({
				doc_id: docId,
				errors: message
			})
			this.logger.error(message)
			throw new InternalServerErrorException(message)
		}

		return this.sendToDiadoc(docId)
	}

	/**
	 * Функция, осуществляющая отправку документа в Диадок
	 * @param docId значение doc_id
	 * @returns Promise<DocPublishResponseDto>
	 */
	async sendToDiadoc(docId: string): Promise<DocPublishResponseDto> {
		let docInstance: Docs

		try {
			docInstance = await this.docsServiceDb.getByDocId(docId, [
				"files",
				"files.status",
				"status",
				"docsRecipient",
				"docsRecipient.counterparties"
			])
		} catch (error) {
			throw new InternalServerErrorException(
				`Ошибка проверки документа при отправке в диадок, docId=${docId}`
			)
		}

		if (!docInstance) {
			this.logger.error(`Не найден полный документ для отправки в Диадок`)
			throw new InternalServerErrorException("Внутренняя ошибка")
		}

		/** Проверка публикации уже опубликованного документа */
		if (docInstance.isPublish) {
			const errorMessage: string = `Документ doc_id = ${docInstance.doc_id} уже опубликован`
			this.logger.error(errorMessage)
			throw new BadRequestException(errorMessage)
		}

		const countFiles: number = docInstance?.files?.length || 0

		if (countFiles < 1) {
			this.logger.error("Не прикреплены файлы к документу")
			throw new BadRequestException("Не прикреплены файлы к документу")
		}

		let toBoxId: PreparedDiadocData["toBoxId"],
			fromBoxId: PreparedDiadocData["fromBoxId"],
			orgInstance: PreparedDiadocData["orgInstance"],
			fromBoxIdGuid: PreparedDiadocData["fromBoxIdGuid"],
			packetLockMode: PreparedDiadocData["packetLockMode"],
			proxyBoxId: PreparedDiadocData["proxyBoxId"]

		// Prepare diadoc data
		try {
			const result: PreparedDiadocData =
				await this.prepareDiadocData(docInstance)

			toBoxId = result.toBoxId
			fromBoxId = result.fromBoxId
			proxyBoxId = result.proxyBoxId
			orgInstance = result.orgInstance
			fromBoxIdGuid = result.fromBoxIdGuid
			packetLockMode = result.packetLockMode
		} catch (error) {
			const message: string = "Ошибка генерации данных перед отправкой в диадок"
			this.logger.error(message)
			throw new InternalServerErrorException(message)
		}

		/** Проверка допустимого режима LockMode */
		const isLockModeChanged: boolean = await this.checkLockModeBeforePublish(
			docInstance,
			orgInstance,
			packetLockMode
		)

		const responseDiadoc: IDiadocSendResponse | IDiadocTemplateResponse =
			await this.postDocumentToDiadoc(
				docInstance,
				fromBoxId,
				toBoxId,
				proxyBoxId,
				packetLockMode
			)

		docInstance.isPublish = true

		try {
			await docInstance.save()
		} catch (error) {
			const message: string = `Ошибка сохранения документа, doc_id:${docInstance.doc_id}, isPublish=${docInstance.isPublish} error=${error}`

			this.logger.error(message)
			throw new InternalServerErrorException(message)
		}

		const diadocEntities: IDiadocEntity[] = responseDiadoc.Entities
		const messageId: string = responseDiadoc.MessageId

		docInstance = await this.docsServiceDb.setMessageId(
			docInstance.doc_id,
			messageId
		)
		this.logger.log("MessageId сохранен")

		//Обрабатываю packetId
		this.logger.log("Обрабатываю данные о PacketId")

		const lockmode: PacketLockmode = diadocEntities[0].DocumentInfo.LockMode
		this.logger.log(`Получен lockmode=${lockmode}`)

		if (diadocEntities[0].PacketId) {
			const packetId: string = diadocEntities[0].PacketId

			this.logger.log(`Сохраняю в БД данные о PacketId: ${packetId}`)
			const savedPacketId: Packets = await this.packetServiceDb.create({
				packetId,
				lockmode
			})
			this.logger.log(
				`Результат сохранения в БД: ${JSON.stringify(savedPacketId)}`
			)

			this.logger.log("Привязываю packet к документу")
			docInstance.packet = savedPacketId

			try {
				await docInstance.save()
			} catch (error) {
				const message: string = `Ошибка сохранения документа, doc_id:${docInstance.doc_id}, packet=${savedPacketId}`

				this.logger.error(message)
				throw new InternalServerErrorException(message)
			}
		} else {
			this.logger.log("Не получен PacketId от Диадок")
		}

		//Обрабатываю входящие метаданные
		this.logger.log(
			`Обрабатываю входящие метаданные (${diadocEntities.length} событий)`
		)
		for (const diadocEntity of diadocEntities) {
			this.logger.log(
				`Обрабатываю diadocEntity, EntityId=${diadocEntity.EntityId}`
			)

			try {
				const entityId: IDiadocEntity["EntityId"] = diadocEntity.EntityId
				const fileId: IDiadocEntity["DocumentInfo"]["CustomDocumentId"] =
					diadocEntity.DocumentInfo.CustomDocumentId

				const primaryStatusDiadoc: IDiadocStatus =
					diadocEntity.DocumentInfo.DocflowStatus.PrimaryStatus

				const fileInstance: Files = await this.filesServiceDb.getById(fileId)

				// Обработка нового статуса текущего файла
				await this.statusServiceDb.processNewStatus(
					primaryStatusDiadoc,
					fileInstance
				)

				// Обработка статуса для документа
				await this.updateDocStatusFromFiles(docInstance.id)

				// Проверяю и устанавливаю признак ведения документооборота
				if (!orgInstance.is_document_flow) {
					this.organizationServiceDb.setDocFlow(orgInstance.id)
				}

				await this.filesServiceDb.setDiadocIdAndLink(
					fileId,
					entityId,
					messageId,
					fromBoxIdGuid
				)

				this.logger.log(
					`Обработан diadocEntity, EntityId=${diadocEntity.EntityId}`
				)
			} catch (error) {
				const message: string = `Ошибка обработки diadocEntity, EntityId=${diadocEntity.EntityId}\nerror: ${error}`
				this.logger.error(message)

				throw new InternalServerErrorException(message)
			}
		}

		await this.docsServiceDb.setMainLink(docInstance.id)

		const updatedDocInstance: Docs =
			await this.docsServiceDb.getExtendedDocInfoById(docInstance.id)

		this.logger.log("Обработка входящих метаданных завершена")

		this.logger.log("Отправка первноначальных данных в kafka")
		await this.kafkaService.sendToKafkaByDoc(
			updatedDocInstance,
			FileType.DOCUMENT
		)

		const returnMessage: string =
			`Передача завершена, принято ${countFiles} файлов` +
			(isLockModeChanged ? ". Режим блокировки изменен на Send" : "")

		return new DocPublishResponseDto(returnMessage, HttpStatus.OK)
	}

	async checkLockModeBeforePublish(
		docInstance: Docs,
		orgInstance: Organizations,
		packetLockMode: PreparedDiadocData["packetLockMode"]
	): Promise<boolean> {
		let isLockModeChanged: boolean = false
		const processedLockMode = await this.lockModeProcessing(
			docInstance.lockMode,
			orgInstance
		)

		if (processedLockMode !== packetLockMode) {
			isLockModeChanged = true

			this.logger.log(
				`Понижаю LockMode в БД до Send для документа ${docInstance.id}`
			)
			docInstance.lockMode = PacketLockmode.Send
			await this.docsServiceDb.updateEntity(docInstance)
		}

		return isLockModeChanged
	}

	async prepareDiadocData(docInstance: Docs): Promise<PreparedDiadocData> {
		const orgInstance: Organizations =
			await this.organizationServiceDb.getByOrgId(docInstance.org_id)

		const boxIdResult: IBoxIdResult =
			await this.mdmService.getBoxIdOrganization(orgInstance.id)

		let toBoxId: string
		let proxyBoxId: string

		/** В приоритете прямой выбор из поля boxes_id от смежных систем */
		if (docInstance?.boxes_id) {
			this.logger.log(
				`Отправка выполняется через прямое указание boxes_id от смежных систем`
			)
			const [firstSideBoxId, secondSideBoxId] = docInstance.boxes_id.split(",")

			if (secondSideBoxId) {
				// Отправка документа в случае с многосторонними должна идти на второго контрагента
				proxyBoxId = firstSideBoxId
				toBoxId = secondSideBoxId
			} else {
				toBoxId = firstSideBoxId
			}

			this.logger.log(
				`Используются ящики: ${JSON.stringify(docInstance.boxes_id)}`
			)
		} else {
			this.logger.log(
				"Отправка выполняется без прямого указания boxes_id от смежных систем"
			)

			/** Обратная совместимость с логикой сохранения ИНН в документе */
			if (docInstance.inn) {
				toBoxId = await this.mdmService.getBoxIdOuterSystem(
					docInstance.inn,
					orgInstance.org_id_diadoc,
					docInstance.isRoaming ?? false
				)
			} else {
				const docRecipients: DocsRecipient[] =
					await this.docsRecipientServiceDb.getByDocumentId(docInstance.id)

				toBoxId = await this.mdmService.getBoxIdOuterSystem(
					docRecipients.find((docRecipient) => docRecipient.order === 0)
						.counterparties.inn,
					orgInstance.org_id_diadoc,
					docInstance.isRoaming ?? false
				)
			}
			this.logger.log(
				`Для документа ${docInstance.id} выбран аккаунт ${toBoxId}`
			)
		}

		const fromBoxId: string = boxIdResult.boxId
		const fromBoxIdGuid: string = boxIdResult.boxIdGuid

		this.logger.log(`Получен fromBoxId = ${fromBoxId}`)
		this.logger.log(`Получен fromBoxIdGuid = ${fromBoxIdGuid}`)

		const packetLockMode: PacketLockmode =
			docInstance.lockMode ?? PacketLockmode.None

		return {
			toBoxId,
			fromBoxId,
			proxyBoxId,
			orgInstance,
			fromBoxIdGuid,
			packetLockMode
		}
	}

	async postDocumentToDiadoc(
		docInstance: Docs,
		fromBoxId: PreparedDiadocData["fromBoxId"],
		toBoxId: PreparedDiadocData["toBoxId"],
		proxyBoxId: PreparedDiadocData["proxyBoxId"],
		packetLockMode: PreparedDiadocData["packetLockMode"]
	): Promise<IDiadocSendResponse | IDiadocTemplateResponse> {
		let responseDiadoc: IDiadocSendResponse | IDiadocTemplateResponse

		function setMultipleSign<T>(
			data: SendTemplateToDiadocDto | SendDocumentToDiadocDto
		): T {
			if (toBoxId && proxyBoxId) return data as T

			// Проверка и запись третей стороны подписания (ProxyBoxId)
			if (docInstance.docsRecipient.length > 1) {
				data.ProxyBoxId! =
					docInstance.docsRecipient[0]?.counterparties?.inn || ""

				// Отправка документа в случае с многосторонними должна идти на второго контрагента
				data.ToBoxId! = docInstance.docsRecipient[1]?.counterparties?.inn || ""
			}

			return data as T
		}

		if (docInstance.is_template) {
			let publishObj: SendTemplateToDiadocDto = {
				DocumentAttachments: await this.prepareDocumentAttachments(
					docInstance,
					docInstance.is_template
				),
				NeedRecipientSignature: true,
				MessageFromBoxId: toBoxId,
				MessageToBoxId: fromBoxId,
				Lockmode: packetLockMode,
				ProxyBoxId: proxyBoxId,
				FromBoxId: fromBoxId,
				ToDepartmentId: "",
				ToBoxId: toBoxId
			}

			publishObj = setMultipleSign<SendTemplateToDiadocDto>(publishObj)

			responseDiadoc = await this.diadocClientService.sendTemplateToDiadoc(
				new SendTemplateToDiadocDto(publishObj)
			)

			const mainFileId: string =
				docInstance.files.find((file) => {
					return file.is_main
				})?.id || ""

			for (const entity of responseDiadoc.Entities) {
				const link: string = `${this.diadocUrl}/${toBoxId}/templates/${responseDiadoc.MessageId}/documents/${entity.EntityId}`

				await this.filesServiceDb.setTemplateLink(
					entity.DocumentInfo.CustomDocumentId,
					link
				)

				// Set template link by main file to documents table
				if (mainFileId && entity.DocumentInfo.CustomDocumentId === mainFileId) {
					await this.docsServiceDb.setTemplateLink(docInstance.doc_id, link)
				}
			}
		} else {
			let publishObj: SendDocumentToDiadocDto = {
				DocumentAttachments: await this.prepareDocumentAttachments(docInstance),
				IsTest: docInstance.is_test,
				Lockmode: packetLockMode,
				ProxyBoxId: proxyBoxId,
				FromBoxId: fromBoxId,
				ToDepartmentId: "",
				ToBoxId: toBoxId
			}

			publishObj = setMultipleSign<SendDocumentToDiadocDto>(publishObj)

			responseDiadoc = await this.diadocClientService.sendDocumentToDiadoc(
				new SendDocumentToDiadocDto(publishObj)
			)
		}

		return responseDiadoc
	}

	/**
	 * Функция для обновления статуса документа исходя из статусов его файлов
	 * @param id внутренний ID документа
	 * @param primaryStatus объект IDiadocStatus (информация о статусе, категории с смэпленных значений)
	 */
	async updateDocStatusFromFiles(id: string): Promise<void> {
		let docInstance: Docs

		try {
			docInstance = await this.docsServiceDb.getById(id, [
				"files",
				"files.status",
				"status"
			])
		} catch (e) {
			const message: string = `Не удалось найти документ при обновлении статуса, doc_id=${id}`

			this.logger.error(message)
			throw new NotFoundException(message)
		}

		this.logger.log(`Обновление статуса докумпента ${docInstance.id}`)
		this.logger.log(
			`Получаю файлы документа (исключая пф и архивы) ${docInstance.id}`
		)
		const files: Files[] = docInstance.files.filter((file: Files) => {
			// отфильтровываю архивы и ПФ
			return !(file.is_archive || file.is_print_form)
		})
		this.logger.log(
			`Получено ${files.length} файлов от документа ${docInstance.id}`
		)

		if (files.length) {
			let mainFile: Files = files.find((file: Files) => file.is_main)

			if (!mainFile.need_recipient_signature) {
				this.logger.log(
					`Основной файл (${mainFile.id}) является не двусторонним`
				)
				this.logger.log(`Ищу первый двусторонний файл`)
				const bilateralFile: Files = files.find(
					(file: Files) => file.need_recipient_signature
				)

				if (bilateralFile) {
					this.logger.log(
						`В качестве основного файла для определения статуса документа ${id} будет использоваться ${bilateralFile.id}`
					)
					mainFile = bilateralFile
				} else {
					this.logger.log(
						`Нет ни одного файла с двусторонней подписью для документа ${id}`
					)
					this.logger.log(
						`В качестве осноного файла для определения статуса документа ${id} будет использоваться ${mainFile.id}`
					)
				}
			}

			if (mainFile) {
				this.logger.log(
					`Основной файл документа(${docInstance.id}): ${mainFile.id}`
				)

				if (mainFile.status.length) {
					const mainFileActiveStatus =
						mainFile.status.find((curr) => curr.is_active) ?? mainFile.status[0]
					this.logger.log(
						`Активный статус основного файла(${mainFile.id}) ${mainFileActiveStatus?.severity} ${mainFileActiveStatus?.name}`
					)

					const statusText: string = mainFileActiveStatus.name
					const stateDocDiadoc: string = StatusMapper(mainFileActiveStatus.name)
					const stateDocService: string = this.processServiceDocStatus(
						files,
						docInstance
					)

					this.logger
						.log(`Результат обработки статусов документа (${docInstance.id}):
							stateDoc = ${statusText}
							stateDocService = ${stateDocService}
							stateDocDiadoc = ${stateDocDiadoc}
						`)

					await this.statusServiceDb.processNewStatus(
						{
							Severity: mainFileActiveStatus.severity,
							StatusText: statusText,
							mapped_status: stateDocDiadoc,
							service_status: stateDocService
						},
						docInstance
					)
				}
			} else {
				this.logger.log(
					`Для документа ${docInstance.id} не удалось подобрать основной файл`
				)
			}
		} else {
			this.logger.warn(`У документа ${docInstance.id} нет файлов`)
		}
	}

	/**
	 * Функция для вычисления сервисного статуса документа
	 * исходя из статусов его документов
	 * @param fileInstances инстансы файлов
	 * @returns string - сервисный статус документа
	 */
	processServiceDocStatus(fileInstances: Files[], docInstance: Docs): string {
		// Проверяю есть хотя бы один с Error
		this.logger.log(
			`Проверяю есть ли хотя бы один статус Error: документ ${docInstance.id} (${fileInstances.length} файлов)`
		)
		const fileWithErrors = fileInstances.find((currFile) => {
			const activeStatus = currFile.status.find(
				(currStatus) => currStatus.is_active
			)

			return activeStatus?.severity === "Error"
		})

		if (fileWithErrors) {
			const activeStatus = fileWithErrors.status.find(
				(currStatus) => currStatus.is_active
			)

			return activeStatus.name
		}

		// Проверяю все ли статусы Success
		this.logger.log(
			`Проверяю все ли статусы Success: документ ${docInstance.id} (${fileInstances.length} файлов)`
		)
		const isAllStatusSuccess = fileInstances.every((currFile) => {
			const activeStatus = currFile.status.find(
				(currStatus) => currStatus.is_active
			)

			return (
				activeStatus.severity === StatusSeverity.SUCCESS ||
				(activeStatus.severity === StatusSeverity.INFO &&
					activeStatus.name === StatusName.DOCFLOW_COMPLETE)
			)
		})

		if (isAllStatusSuccess) {
			this.logger.log(
				`Все статусы Success, документ (${docInstance.id}) подписан`
			)
			return "Подписан"
		} else {
			this.logger.log(`Не все статусы Success, документ ${docInstance.id}`)
		}

		// Остальные условия - статус = Ожидает
		this.logger.log(
			`Часть файлов не подписана, документ (${docInstance.id}) в статусе Ожидает`
		)
		return "Ожидает"
	}

	// Если статус изменился - создать новый, предыдущий isActive=false
	updateDocStatus(docInstance: Docs, newStatus: IDiadocStatus) {
		return this.statusServiceDb.processNewStatus(newStatus, docInstance)
	}

	/**
	 * Функция для установки основной ссылки документа
	 * на основе его файлов
	 * @param id внутренний ID документа
	 * @returns Promise<Docs>
	 */
	async setMainLink(id: string): Promise<Docs> {
		return await this.docsServiceDb.setMainLink(id)
	}

	/**
	 * Функция отправки обновлений в Kafka на основе файла
	 * @param diadocId значение diadoc_id файла
	 * @returns Promise<boolean>
	 */
	async sendFileUpdateToKafka(
		diadocId: string,
		boxIdGuid: string
	): Promise<boolean> {
		this.logger.log(`Формирую данные для отправки в kafka`)

		const fileInstance: Files =
			await this.filesServiceDb.getByDiadocId(diadocId)
		const docInstance: Docs = fileInstance.docs
		const extendedDocInstance: Docs = await this.getExtendedDocInfoById(
			docInstance.id
		)

		return this.kafkaService.sendToKafkaByFile(
			extendedDocInstance,
			fileInstance,
			boxIdGuid
		)
	}

	/**
	 * Функция запроса подготовки печатных форм и архивов
	 * со стороны Диадок
	 * @param id внутренний ID документа
	 */
	async prepareFilesFromDiadoc(id: string): Promise<void> {
		this.logger.log(`Запрашиваю печатные формы для документа ${id}`)

		const docInstance = await this.docsServiceDb.getExtendedDocInfoById(id)
		const orgInstance = docInstance.organization
		const files = docInstance.files
		this.logger.log(`У документа ${files.length} файлов`)

		const boxId = (await this.mdmService.getBoxIdOrganization(orgInstance.id))
			.boxId
		this.logger.log(`Используется boxId=${boxId}`)

		this.logger.log("Выполняю запросы на подготовку файлов")
		files.forEach((currFile) => {
			this.diadocClientService.getPrintingForms(
				boxId,
				docInstance.messages_id,
				currFile.diadoc_id
			)

			this.diadocClientService.getArchiveLink(
				boxId,
				docInstance.messages_id,
				currFile.diadoc_id
			)
		})
	}

	/**
	 * Запрос в Диадок на подготовку печатной формы
	 * @param diadocId diadoc_id файла
	 */
	async prepareFileForDownloadingFromDiadocId(diadocId: string): Promise<void> {
		this.logger.log(`Запрашиваю печатную форму для файла diadocId=${diadocId}`)
		const fileInstance: Files =
			await this.filesServiceDb.getByDiadocId(diadocId)

		if (!fileInstance) {
			this.logger.warn(
				`Пропускаю обработку отсутствующего файла diadocId=${diadocId}`
			)
			throw new NotFoundException(
				`Файл по diadocId=${diadocId} не существует в этой системе`
			)
		}

		const docInstance: Docs = fileInstance.docs
		const orgInstance: Organizations = docInstance.organization

		const boxId: string = (
			await this.mdmService.getBoxIdOrganization(orgInstance.id)
		).boxId
		this.logger.log(`Используется boxId=${boxId}`)

		this.logger.log("Выполняю запрос на подготовку пф/архива")
		this.diadocClientService.getPrintingForms(
			boxId,
			docInstance.messages_id,
			fileInstance.diadoc_id
		)

		this.diadocClientService.getArchiveLink(
			boxId,
			docInstance.messages_id,
			fileInstance.diadoc_id
		)
	}

	async getByMessageId(messageId: string): Promise<Docs> {
		return this.docsServiceDb.getByMessageId(messageId)
	}

	/**
	 * Связывание документов при первоначальном запросе
	 * @param docInstance инстанс основного документа
	 * @param linkedDocsIds набор ID связанных документов
	 * @returns Имеются ли у документа связанные документы, не хранящиеся у нас
	 */
	async linkDocuments(
		docInstance: Docs,
		linkedDocsIds: string[]
	): Promise<void> {
		this.logger.log(
			`Выполняю обработку связанных с ${docInstance.id} документов (${linkedDocsIds.length} шт)`
		)

		for (const currLinkedDocId of linkedDocsIds) {
			this.logger.log(`Обрабатываю связанный id: ${currLinkedDocId}`)

			const docLinkEntity: DocsLinks =
				await this.docsLinksServiceDb.createEmpty()

			docLinkEntity.parentDoc = docInstance

			try {
				const currLinkedDocInstance =
					await this.docsServiceDb.getByDocIdWithoutAuth(currLinkedDocId)
				this.logger.log(
					`Связанный документ ${currLinkedDocId} найден, сохранение как ссылка на сущность`
				)

				docLinkEntity.linkedDoc = currLinkedDocInstance

				await this.docsLinksServiceDb.saveEntity(docLinkEntity)
			} catch (e) {
				if (e instanceof NotFoundException) {
					this.logger.log(
						`Связанный документ ${currLinkedDocId} не найден, сохранение как строка-id`
					)
					docLinkEntity.remote_linked_doc_id = currLinkedDocId
					await this.docsLinksServiceDb.saveEntity(docLinkEntity)
				} else {
					const errMessage = `Непредвиденная ошибка: ${e.message}`
					this.logger.log(errMessage)
					throw new InternalServerErrorException(errMessage)
				}
			}
		}
	}

	async prepareLinkedFiles(
		docInstance: Docs
	): Promise<ILinkedDocsDataForUpload> {
		this.logger.log(`Подготавливаю связанные документы для ${docInstance.id}`)

		const linkedDocs: ILinkedDocsDataForUpload = {
			remoteLinkedDocIds: [],
			storedLinkedDocIds: [],
			hasOnlyRemoteDocs: false
		}

		const linkEntities: DocsLinks[] =
			await this.docsLinksServiceDb.getListByParam({
				parentDocId: docInstance.id
			})

		this.logger.log(`Найдено ${linkEntities.length} связанных документов`)

		if (!linkEntities.length) {
			return linkedDocs
		}

		// Первичное значение, пока не найден документ в нашей БД
		linkedDocs.hasOnlyRemoteDocs = true

		for (const currLinkEntity of linkEntities) {
			this.logger.log(`Просматриваю link-сущность ${currLinkEntity.id}`)

			if (currLinkEntity.linked_doc_id) {
				this.logger.log(
					`Есть сохранённый связанный документ ${currLinkEntity.linked_doc_id}`
				)
				linkedDocs.storedLinkedDocIds.push(currLinkEntity.linked_doc_id)
				linkedDocs.hasOnlyRemoteDocs = false
			}

			if (currLinkEntity.remote_linked_doc_id) {
				this.logger.log(`Есть связанный документ, не сохранённый в БД`)
				linkedDocs.remoteLinkedDocIds.push(currLinkEntity.remote_linked_doc_id)
			}
		}

		return linkedDocs
	}

	/**
	 * Сбор documentAttachments по документу
	 * @param docInstance Docs
	 * @param isTemplate boolean
	 * @returns Promise<IDocumentAttachments[]>
	 */
	async prepareDocumentAttachments(
		docInstance: Docs,
		isTemplate: boolean = false
	): Promise<IDocumentAttachments[]> {
		const linkedDocs: ILinkedDocsDataForUpload =
			await this.prepareLinkedFiles(docInstance)

		let metadataForLinkedDoc: IMetaDataKeys = {}

		if (linkedDocs.storedLinkedDocIds.length) {
			const firstStoredLinkedDocInstance: Docs = await this.getById(
				linkedDocs.storedLinkedDocIds[0]
			)

			metadataForLinkedDoc = await this.buildMetaTagsForLinkedDocs(
				linkedDocs,
				firstStoredLinkedDocInstance
			)
		}

		return await Promise.all(
			docInstance.files.map(
				async (file: Files): Promise<IDocumentAttachments> => {
					try {
						const s3File: Buffer = await this.s3ClientService.readFile(file.id)

						let processedTypeNamedId = file.document_kind ?? "Nonformalized"

						// Проверка чтоб у доп соглашения были связанные документы
						if (file.document_kind === KindFiles.SupplementaryAgreement) {
							if (linkedDocs.hasOnlyRemoteDocs) {
								processedTypeNamedId = KindFiles.Contract
							}
						}

						const attachment: IDocumentAttachments = {
							TypeNamedId: processedTypeNamedId,
							CustomDocumentId: file.id,
							IsEncrypted: "false",
							Comment: "",

							[isTemplate ? "UnsignedContent" : "SignedContent"]: {
								Content: s3File.toString("base64")
							}
						}

						// Checks by xml
						if (file.file_type !== ".xml") {
							const metadataBuilder: MetaDataBuilder = new MetaDataBuilder(
								file,
								docInstance,
								metadataForLinkedDoc
							)

							attachment.NeedRecipientSignature = file.need_recipient_signature
							attachment.Metadata = metadataBuilder.generateMetaData()
						}

						this.logger.log(
							`Структура documentAttachments для отправки в Диадок:\n${JSON.stringify(attachment)}`
						)

						return attachment
					} catch (error) {
						const message = `Ошибка при подготовке файлов к отправке в Диадок, file_id=${file.id} error=${error}`
						this.logger.error(message)

						throw new NotFoundException(message)
					}
				}
			)
		)
	}

	/**
	 * Проверка дублирования документа по docId
	 * @param docId doc_id документа
	 * @returns Promise<boolean>
	 */
	private async checkDuplicateDocument(docId: string): Promise<boolean> {
		this.logger.log(`Запущена проверка дубликатов документа по doc_id=${docId}`)

		const existInstances: Docs[] = await this.docsServiceDb.getListByDocId(
			docId,
			["organization", "status", "files"]
		)

		if (existInstances?.length) {
			this.logger.log(
				`Обнаружено ${existInstances.length} записей в БД по doc_id=${docId}, выполняю проверку на дублирование`
			)

			// Массив документов с действующим статусом
			const activeDocuments: Docs[] = []

			await Promise.all(
				existInstances.map(async (document) => {
					const activeStatus: Status = document.status.find(
						(status) => status.is_active
					)

					if (
						!activeStatus ||
						activeStatus?.severity === StatusSeverity.ERROR
					) {
						this.logger.log(
							`Документ ${document.id} не имеет действующего статуса`
						)

						try {
							await this.removeDocumentWithFiles(document.id)
							await this.kafkaService.sendDeleteByFiles(
								document.files,
								document
							)
						} catch (error) {
							const errorMessage: string = `Ошибка при удалении документа с файлами document.id=${document.id}: ${error.message}`
							this.logger.error(errorMessage)
							throw new InternalServerErrorException(errorMessage)
						}
					} else {
						this.logger.log(`Документ ${document.id} имеет действующий статус`)
						activeDocuments.push(document)
					}
				})
			)

			this.logger.log(
				`Обнаружено ${activeDocuments.length} документов с действующим статусом`
			)
			return await this.checkDocumentIsDeleted(activeDocuments)
		} else {
			this.logger.log(
				`Записей в БД по doc_id=${docId} не обнаружено, дубликатов нет`
			)
			return false
		}
	}

	/**
	 * Проверка удаления документов в Диадок
	 * @param documents инстансы документов
	 * @returns Promise<boolean>
	 */
	private async checkDocumentIsDeleted(documents: Docs[]): Promise<boolean> {
		this.logger.log(
			`Выполняю проверку удаления документов в Диадок (${documents.length}шт.)`
		)

		let hasDuplicate: boolean = false

		/** Разделяем массив на подмассивы чтоб не превысить ограничения Диадок
		 * на параллельные запросы
		 */
		const size = 70 // органичение Диадок 100 запросов + 30 резерв для ретраев
		const documentsChunks: Docs[][] = []
		for (let i = 0; i < Math.ceil(documents.length / size); i++) {
			documentsChunks[i] = documents.slice(i * size, i * size + size)
		}

		for (const documents of documentsChunks) {
			await Promise.all(
				documents.map(async (document) => {
					const isDocumentDeleted: boolean =
						await this.diadocClientService.checkIsDeletedInDiadoc(
							document.organization.box_id,
							document.messages_id
						)

					if (!isDocumentDeleted) {
						hasDuplicate = true
					} else {
						/** Если документ удалён в Дидаок - удаляем его и его файлы */
						await this.removeDocumentWithFiles(document.id)
						await this.kafkaService.sendDeleteByFiles(document.files, document)
					}
				})
			)

			return hasDuplicate
		}
	}

	private async buildMetaTagsForLinkedDocs(
		linkedDocs: ILinkedDocsDataForUpload,
		firstStoredLinkedDocInstance: Docs
	): Promise<IMetaDataKeys> {
		const metadataForLinkedDoc: IMetaDataKeys = {}

		if (linkedDocs.storedLinkedDocIds.length) {
			if (firstStoredLinkedDocInstance) {
				metadataForLinkedDoc.ContractDocumentDate = {
					Key: "ContractDocumentDate",
					Value: firstStoredLinkedDocInstance.reg_date.toLocaleString("ru", {
						dateStyle: "short"
					})
				}

				metadataForLinkedDoc.ContractDocumentNumber = {
					Key: "ContractDocumentNumber",
					Value: firstStoredLinkedDocInstance.reg_number
				}

				metadataForLinkedDoc.Grounds = {
					Key: "Grounds",
					Value: firstStoredLinkedDocInstance.name
				}
			}
		}

		return metadataForLinkedDoc
	}

	private async lockModeProcessing(
		lockMode: PacketLockmode,
		organizationInstance: Organizations
	): Promise<PacketLockmode> {
		let processedLockMode: PacketLockmode = lockMode

		if (lockMode === PacketLockmode.Full) {
			let isFullModeAllowed: boolean = false

			if (typeof organizationInstance.is_lock_send_allowed === "boolean") {
				isFullModeAllowed = organizationInstance.is_lock_send_allowed
			} else {
				const features: OrganizationFeature[] =
					await this.diadocService.updateOrganizationFeatures(
						organizationInstance.id
					)

				isFullModeAllowed = features.includes(
					OrganizationFeature.ALLOW_SEND_LOCKED_PACKETS
				)
			}

			if (!isFullModeAllowed) {
				processedLockMode = PacketLockmode.Send
			}
		}

		return processedLockMode
	}
}
