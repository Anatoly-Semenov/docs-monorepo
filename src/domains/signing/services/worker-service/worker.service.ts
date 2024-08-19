import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException
} from "@nestjs/common"

import { DiadocClientService } from "@docs/common/clients/providers/diadoc/diadoc-client.service"
import { RedisBullClientService } from "@docs/common/clients/providers/redis-bull/redis-bull-client.service"

import { FilesProcessingService } from "../files-processing-service/files-processing.service"
import { FilesServiceDb } from "@docs/common/db/services/files-service/files.service"
import { KafkaService } from "@docs/common/kafka-service/kafka.service"
import { DocsService } from "@docs/storing/services/docs-service/docs.service"
import { MdmService } from "@docs/storing/services/mdm-service/mdm.service"

import {
	IOC__FILES_PROCESSING_SERVICE,
	IOC__KAFKA_SERVICE,
	IOC__SERVICE__CLIENT_PROVIDER_DIADOC,
	IOC__SERVICE__CLIENT_PROVIDER_REDIS_BULL,
	IOC__SERVICE__DOCS,
	IOC__SERVICE__FILES_DB,
	IOC__SERVICE__MDM
} from "@docs/shared/constants/ioc.constants"

import { GetDiadocFileDataByHeaders } from "@docs/shared/helpers/files.helper"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"
import { Organizations } from "@docs/common/db/entities/organizations.entity"

import { IDiadocDataBuffer } from "@docs/shared/interfaces/client/diadoc.interfaces"

@Injectable()
export class WorkerService {
	constructor(
		@Inject(IOC__SERVICE__DOCS)
		private readonly docsService: DocsService,

		@Inject(IOC__SERVICE__FILES_DB)
		private readonly filesService: FilesServiceDb,

		@Inject(IOC__FILES_PROCESSING_SERVICE)
		private readonly filesProcessingService: FilesProcessingService,

		@Inject(IOC__SERVICE__MDM)
		private readonly mdmService: MdmService,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_DIADOC)
		private readonly diadocService: DiadocClientService,

		@Inject(IOC__KAFKA_SERVICE)
		private readonly kafkaService: KafkaService,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_REDIS_BULL)
		private redisBullClientService: RedisBullClientService
	) {}

	private readonly logger = new Logger(WorkerService.name)

	/**
	 * Обработчик загрузки печатных форм
	 * @param diadocId diadoc_id файла
	 * @returns Promise<boolean>
	 */
	async downloadHandlerPrintingForms(diadocId: string): Promise<boolean> {
		let fileInstance: Files

		try {
			fileInstance = await this.filesService.getByDiadocId(diadocId)
		} catch (e) {
			if (e instanceof NotFoundException) {
				this.logger.warn(
					`Файл diadocId=${diadocId} не найден, возможно он был удалён, пропускаю загрузку`
				)
				return false
			} else {
				throw new InternalServerErrorException(
					`Ошибка при получении файла для загрузки печатных форм, diadocId=${diadocId}`
				)
			}
		}

		const diadocResponseFiles = await this.checkPrintingForms(diadocId)

		this.logger.log(`Обрабатываю результат`)

		if (diadocResponseFiles === true) {
			this.logger.log(
				`Печатная форма для файла diadocId=${diadocId} ещё не готова`
			)
			this.logger.log(`Устанавливаю повторное событие на проверку ПФ`)
			await this.redisBullClientService.addDownloadPrintFormJob({ diadocId })

			return false
		}

		const docInstance: Docs = fileInstance.docs

		await this.savingHandlerPrintingForms(diadocResponseFiles, docInstance)
	}

	/**
	 * Обработчик загрузки архивов
	 * @param diadocId diadoc_id файла
	 * @returns
	 */
	async downloadHandlerArchives(diadocId: string) {
		let fileInstance: Files

		try {
			fileInstance = await this.filesService.getByDiadocId(diadocId)
		} catch (e) {
			if (e instanceof NotFoundException) {
				this.logger.warn(
					`Файл diadocId=${diadocId} не найден, возможно он был удалён, пропускаю загрузку`
				)
				return false
			} else {
				throw new InternalServerErrorException(
					`Ошибка при получении файла для загрузки архивов, diadocId=${diadocId}`
				)
			}
		}

		const diadocResponseFiles = await this.checkArchives(diadocId)

		if (!diadocResponseFiles.length) {
			this.logger.log("Архив ещё не подготовлен на стороне Диадок")
			this.logger.log("Инициирую новое событие на загрузку архива")

			await this.redisBullClientService.addDownloadArchiveJob({ diadocId })

			return false
		}

		this.logger.log(`Обрабатываю результат`)

		const docInstance: Docs = fileInstance.docs

		await this.savingHandlerArchive(diadocResponseFiles, docInstance)
	}

	/**
	 * Обработчик сохранения печатных форм
	 * @param diadocResponseFiles данные от Диадок
	 * @param docInstance инстанс документа
	 */
	async savingHandlerPrintingForms(
		diadocResponseFiles,
		docInstance: Docs
	): Promise<void> {
		await this.filesProcessingService.downloadPrintingForms(
			diadocResponseFiles,
			docInstance
		)

		this.logger.log("Выполняю формирование и отправку в кафка")

		const updatedDocInstance = await this.docsService.getExtendedDocInfoById(
			docInstance.id
		)

		const { diadocId } = GetDiadocFileDataByHeaders(diadocResponseFiles.headers)
		const printFormFileInstance: Files =
			await this.filesService.getPrintFormByDiadocId(diadocId)

		await this.kafkaService.sendNewDiadocFileToKafka(
			updatedDocInstance,
			printFormFileInstance
		)
	}

	/**
	 * Обработчик сохранения архивов
	 * @param diadocResponseFiles данные от Диадок
	 * @param docInstance инстанс документа
	 */
	async savingHandlerArchive(
		diadocResponseFiles,
		docInstance: Docs
	): Promise<void> {
		this.logger.log("Выполняю сохранение архива")
		await this.filesProcessingService.downloadArchives(
			diadocResponseFiles,
			docInstance
		)

		this.logger.log("Выполняю формирование и отправку в кафка")

		const updatedDocInstance = await this.docsService.getExtendedDocInfoById(
			docInstance.id
		)

		const diadocId: string = diadocResponseFiles.split(".")[4]
		const archiveFileInstance: Files =
			await this.filesService.getArchiveByDiadocId(diadocId)

		await this.kafkaService.sendNewDiadocFileToKafka(
			updatedDocInstance,
			archiveFileInstance
		)
	}

	/**
	 * Запрос проверки готовности печатных форм на стороне Диадок
	 * @param diadocId diadoc_id файла
	 * @returns данные от Диадок (diadocResponseFiles)
	 */
	async checkPrintingForms(
		diadocId: string
	): Promise<boolean | IDiadocDataBuffer> {
		this.logger.log(
			`Выполняю запрос печатных форм (diadocId файла ${diadocId})`
		)

		const fileInstance: Files = await this.filesService.getByDiadocId(diadocId)
		const docInstance: Docs = fileInstance.docs
		const orgInstance: Organizations = docInstance.organization
		const boxId: string = (
			await this.mdmService.getBoxIdOrganization(orgInstance.id)
		).boxId
		this.logger.log(`Используется boxId=${boxId}`)

		this.logger.log("Выполняю запрос на загрузку")

		try {
			const response: IDiadocDataBuffer | boolean =
				await this.diadocService.getPrintingForms(
					boxId,
					docInstance.messages_id,
					fileInstance.diadoc_id
				)

			return response
		} catch (e) {
			const errorMessage: string = `Ошибка при загрузку печатной формы:
			boxId: ${boxId}
			messageId: ${docInstance.messages_id}
			diadocId: ${fileInstance.diadoc_id}
			error: ${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	/**
	 * Запрос в Диадок для подготовки/получения ссылки на архив
	 * @param diadocId diadocId файла
	 * @returns массив архивов и/или ссылок на неподготовленные архивы
	 */
	async checkArchives(diadocId: string) {
		this.logger.log(`Выполняю запрос архива (diadocId файла ${diadocId})`)

		const fileInstance: Files = await this.filesService.getByDiadocId(diadocId)
		const docInstance: Docs = fileInstance.docs
		const orgInstance: Organizations = docInstance.organization
		const boxId: string = (
			await this.mdmService.getBoxIdOrganization(orgInstance.id)
		).boxId
		this.logger.log(`Используется boxId=${boxId}`)

		this.logger.log(
			`Выполняю запрос на загрузку архива (diadocId файла ${diadocId})`
		)

		try {
			return this.diadocService.getArchiveLink(
				boxId,
				docInstance.messages_id,
				fileInstance.diadoc_id
			)
		} catch (e) {
			const errorMessage: string = `Ошибка загрузки архива:
			boxId: ${boxId}
			messageId: ${docInstance.messages_id}
			diadocId: ${fileInstance.diadoc_id}
			error: ${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}
}
