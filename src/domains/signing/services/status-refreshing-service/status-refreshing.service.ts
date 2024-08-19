import { DiadocGuidBuilder } from "@docs/shared/builders/diadoc-guid.builder"

import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	OnModuleInit
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { DiadocClientService } from "@docs/common/clients/providers/diadoc/diadoc-client.service"
import { RedisBullClientService } from "@docs/common/clients/providers/redis-bull/redis-bull-client.service"
import { RedisClientService } from "@docs/common/clients/providers/redis/redis-client.service"

import { FilesServiceDb } from "@docs/common/db/services/files-service/files.service"
import { OrganizationServiceDb } from "@docs/common/db/services/organizations/organization.service"
import { StatusServiceDb } from "@docs/common/db/services/status-service/status.service"
import { KafkaService } from "@docs/common/kafka-service/kafka.service"
import {
	IDiadocStatus,
	IDiadocStatusExtended
} from "@docs/shared/interfaces/services/docs-service.interfaces"
import {
	IFetchPaginationEventParams,
	IStatusRefreshingService
} from "@docs/shared/interfaces/services/status-refreshing-service.interfaces"
import { DocsService } from "@docs/storing/services/docs-service/docs.service"

import { BULL_ONE_FILE_DOWNLOADER } from "@docs/shared/constants/config.constants"
import {
	IOC__KAFKA_SERVICE,
	IOC__SERVICE__CLIENT_PROVIDER_DIADOC,
	IOC__SERVICE__CLIENT_PROVIDER_REDIS,
	IOC__SERVICE__CLIENT_PROVIDER_REDIS_BULL,
	IOC__SERVICE__DOCS,
	IOC__SERVICE__FILES_DB,
	IOC__SERVICE__ORGANIZATION_DB,
	IOC__SERVICE__STATUS_DB
} from "@docs/shared/constants/ioc.constants"

import { Sentry } from "@docs/shared/decorators/sentry.decorator"

import { dateToEpochFormat } from "@docs/shared/helpers/diadoc-client.helper"
import { removeDiadocEventsDuplicates } from "@docs/shared/helpers/status-refreshing.helper"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"
import { Organizations } from "@docs/common/db/entities/organizations.entity"
import { Status } from "@docs/common/db/entities/status.entity"

import {
	IDiadocDocument,
	IDiadocEvent,
	IDiadocEventData,
	IDiadocEventResponse,
	IDiadocStatusUpdateRequestBody,
	IDiadocTemplateTransformationInfo
} from "@docs/shared/interfaces/client/diadoc.interfaces"

import { FileType } from "@docs/shared/enums/files.enum"
import { RedisFlag, RedisVariables } from "@docs/shared/enums/redis.enum"

import { Time } from "@docs/shared/types/time.types"

@Injectable()
@Sentry
export class StatusRefreshingService
	implements IStatusRefreshingService, OnModuleInit
{
	constructor(
		@Inject(IOC__SERVICE__ORGANIZATION_DB)
		private readonly organizationServiceDb: OrganizationServiceDb,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_DIADOC)
		private readonly diadocClientService: DiadocClientService,

		@Inject(IOC__SERVICE__STATUS_DB)
		private readonly statusServiceDb: StatusServiceDb,

		@Inject(IOC__SERVICE__FILES_DB)
		private readonly filesService: FilesServiceDb,

		@Inject(IOC__SERVICE__DOCS)
		private readonly docsService: DocsService,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_REDIS)
		private readonly redisClientService: RedisClientService,

		@Inject(IOC__KAFKA_SERVICE)
		private readonly kafkaService: KafkaService,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_REDIS_BULL)
		private redisBullClientService: RedisBullClientService,

		private readonly configService: ConfigService
	) {}

	private readonly logger = new Logger(StatusRefreshingService.name)

	async onModuleInit(): Promise<void> {
		this.logger.log(`"On module init" событие`)

		this.logger.log("Проверяю текущее значение startTicks")
		const currentStartTicks = await this.redisClientService.get(
			RedisVariables.DIADOC_UPDATE_FROM_TICKS
		)

		this.logger.log(`Текущее значение startTicks=${currentStartTicks}`)

		if (!currentStartTicks || !currentStartTicks?.length) {
			await this.initFromTicksTime()
		}

		await this.setWorkingFlag(false, true)
	}

	private setError(message: string, error: any): void {
		this.logger.error(message)
		throw new Error(`${message} | ${JSON.stringify(error)}`)
	}

	private async getWorkingFlag(): Promise<RedisFlag> {
		return (await this.redisClientService.get(
			RedisVariables.IS_WORKING_FLAG_EVENTS_PROCESSING
		)) as RedisFlag
	}

	private async setWorkingFlag(
		isWorking: boolean,
		isOnModuleInit: boolean = false
	): Promise<void> {
		const croneWorkingTtl: number = +this.configService.getOrThrow<number>(
			"CRON_STATUS_WORKING_TTL"
		)

		await this.redisClientService.setWithCustomTtl(
			RedisVariables.IS_WORKING_FLAG_EVENTS_PROCESSING,
			isWorking ? RedisFlag.TRUE : RedisFlag.FALSE,
			croneWorkingTtl
		)

		this.logger.log(
			`${isOnModuleInit ? "Инициализация модуля | Сбросил" : "Установил "} флаг запущенной обработки статусов в ${isWorking}`
		)
	}

	/**
	 * Сброс значения ddUpdateStatusFromTicks в редис на текущее время
	 * при первоначальной инициализации
	 * @returns
	 */
	initFromTicksTime(): Promise<void> {
		const startTicks = (
			dateToEpochFormat(new Date()) -
			0.5 * Time.Tick.MINUTE
		).toString()
		this.logger.log(`Сбрасываю время в редис: ${startTicks}`)

		return this.redisClientService.setSimple(
			RedisVariables.DIADOC_UPDATE_FROM_TICKS,
			startTicks
		)
	}

	/**
	 * Обновление статусов
	 * получить тики, выполнить запрос к Диадок
	 * и передать результат в функцию обработки processUpdatedStatusData
	 */
	async refreshStatuses(): Promise<void> {
		try {
			this.logger.log(`Проверяю флаг запущенной обработки статусов`)
			const isWorkingRefreshStatuses: RedisFlag = await this.getWorkingFlag()

			this.logger.log(
				`Текущее значения флага запущенной обработки статусов = ${isWorkingRefreshStatuses}`
			)
			if (isWorkingRefreshStatuses === RedisFlag.TRUE) {
				this.logger.warn(
					"Пропускаю обработку статусов, т.к. обработчик уже запущен"
				)
				return
			}

			this.logger.log("Начинаю обновление статусов документов")

			this.setWorkingFlag(true)

			const organizationsForUpdate: Organizations[] =
				await this.organizationServiceDb.getDocFlowOrganizations()

			const fromTicksRaw: string =
				(await this.redisClientService.get(
					RedisVariables.DIADOC_UPDATE_FROM_TICKS
				)) ??
				(dateToEpochFormat(new Date()) - 0.5 * Time.Tick.MINUTE).toString()

			const fromTicks: string = (+fromTicksRaw).toString()
			const toTicks: string = (
				dateToEpochFormat(new Date()) -
				10 * Time.Tick.SECOND
			).toString()

			await Promise.all(
				organizationsForUpdate.map(async (currOrganization) => {
					this.logger.log(
						`Запрос событий: временной промежуток: ${fromTicks} - ${toTicks}, организация: ${currOrganization.id}`
					)
					const boxId: string = currOrganization.box_id
					const updateStatusData: false | IDiadocEventData =
						await this.diadocClientService.getLastUpdatedStatus(
							boxId,
							fromTicks,
							toTicks,
							currOrganization.id
						)

					if (!updateStatusData || !updateStatusData.Events.length) {
						this.logger.log(
							`Нет произошедших событий в данный промежуток времени (boxId:${boxId}, fromTicks:${fromTicks}, toTicks:${toTicks})`
						)
						return false
					} else {
						this.logger.warn(
							`Есть произошедшие события: ${updateStatusData.Events.length} событий, boxId:${boxId}, fromTicks:${fromTicks}, toTicks:${toTicks}`
						)
					}

					await this.processUpdatedStatusData(
						this.eventMapper(updateStatusData.Events)
					)

					await this.fetchPaginationEvents({
						totalCount: updateStatusData.TotalCount,
						fromTicks,
						toTicks,
						boxId,
						data: updateStatusData
					})
				})
			)

			this.redisClientService.setSimple(
				RedisVariables.DIADOC_UPDATE_FROM_TICKS,
				toTicks
			)
			this.logger.log(
				`Обработка статусов завершена, устаналиваю флаг запущенной обработки в false`
			)

			this.setWorkingFlag(false)
		} catch (error) {
			await this.setWorkingFlag(false)

			this.setError(`Ошибка обновления статуса: ${error.message}`, error)
		}
	}

	/**
	 * Маппер объекта IDiadocEvent[] в IDiadocStatusExtended[]
	 * @param events IDiadocEvent[]
	 * @returns IDiadocStatusExtended[]
	 */
	eventMapper(events: IDiadocEvent[]): IDiadocStatusExtended[] {
		return events.map((event: IDiadocEvent) => {
			const documentField: IDiadocDocument = event.Document

			let messageId: string = documentField.DocumentId.MessageId
			let entityId: string = documentField.DocumentId.EntityId

			const templateInfo: IDiadocTemplateTransformationInfo | null =
				documentField?.DocumentInfo?.TemplateInfo
					?.TemplateTransformationInfos?.[0] || null

			// Перезаписываем entity и message id для документов созданных из шаблона
			if (templateInfo) {
				const data: IDiadocTemplateTransformationInfo["TransformedToLetterId"] =
					templateInfo?.TransformedToLetterId

				if (data?.MessageId) messageId = data.MessageId
				if (data?.EntityId) entityId = data.EntityId
			}

			return {
				primaryStatus: documentField.Docflow.DocflowStatus.PrimaryStatus,
				counteragentBoxId: documentField.DocumentInfo.CounteragentBoxId,
				isDeleted: documentField.Docflow.DocumentIsDeleted,
				messageId,
				entityId
			}
		})
	}

	/**
	 * Обработка обновлений статусов от Диадок
	 * @param updateStatusDataRaw объект IDiadocStatusExtended
	 * @returns
	 */
	async processUpdatedStatusData(
		updateStatusDataRaw: IDiadocStatusExtended[]
	): Promise<void> {
		const updateStatusData: IDiadocStatusExtended[] =
			removeDiadocEventsDuplicates(updateStatusDataRaw)
		const deletedFilesDiadocIds: string[] = []
		const diadocIdsForDownloadFiles: string[] = []

		for (const currUpdateStatusDoc of updateStatusData) {
			/** Проверка флага удаления от Диадок */
			if (currUpdateStatusDoc.isDeleted) {
				deletedFilesDiadocIds.push(currUpdateStatusDoc.entityId)
			}

			try {
				await this.saveStatus(currUpdateStatusDoc)
			} catch (e) {
				const errorMessage: string = `Ошибка при обработке нового статуса
				messageId=${currUpdateStatusDoc.messageId}
				entityId=${currUpdateStatusDoc.entityId}
				statusText=${currUpdateStatusDoc.primaryStatus.StatusText}
				severity=${currUpdateStatusDoc.primaryStatus.Severity}
				error=${e.message}`
				this.logger.error(errorMessage)
				throw new InternalServerErrorException(errorMessage)
			}

			/** Проверка завершающего документооборот статуса */
			if (
				this.checkDocFlowCompleteFileStatus(currUpdateStatusDoc.primaryStatus)
			) {
				this.logger.log(
					`Получен завершающий статус по файлу diadocId=${currUpdateStatusDoc.entityId} messageId=${currUpdateStatusDoc.messageId}`
				)
				this.logger.log(
					`Статус: ${currUpdateStatusDoc.primaryStatus.Severity} ${currUpdateStatusDoc.primaryStatus.StatusText}`
				)
				diadocIdsForDownloadFiles.push(currUpdateStatusDoc.entityId)
			}
		}

		// обработка накопленных изменений удаления файлов
		if (deletedFilesDiadocIds.length) {
			try {
				await this.processDeleteFiles(deletedFilesDiadocIds)
			} catch (e) {
				this.logger.error(
					`Ошибка при удалении файла: ${e.message}. Пропускаю обработку события удаления`
				)
			}
		}

		// обработка накопленных изменений загрузки файлов
		if (diadocIdsForDownloadFiles.length) {
			for (const currDiadocId of diadocIdsForDownloadFiles) {
				if (!currDiadocId) {
					continue
				}

				await this.redisBullClientService.addFinalDocumentFlowDownloadJob(
					currDiadocId,
					BULL_ONE_FILE_DOWNLOADER
				)
			}
		}
	}

	/**
	 * Дозагрузка событий, используя пагинацию Диадок
	 * @param объект IFetchPaginationEventParams
	 */
	async fetchPaginationEvents({
		totalCount,
		fromTicks,
		toTicks,
		boxId,
		data
	}: IFetchPaginationEventParams): Promise<void> {
		const pageSize: number = 100

		const iterations: number = Math.ceil(
			(data.TotalCount - pageSize) / pageSize
		)

		const currentIndexKey: IDiadocStatusUpdateRequestBody["AfterIndexKey"] =
			data.Events[data.Events.length - 1].IndexKey || null

		// Collect not fetched events
		for (let i = 0; i < iterations; i++) {
			totalCount -= pageSize

			this.logger.log(
				`Запрашиваю события из diadok fromTicks=${fromTicks}, toTicks=${toTicks}, page=${i + 2}, total=${totalCount}`
			)

			const iterationResponse: IDiadocEventResponse =
				await this.diadocClientService.generateGetEventRequest(
					boxId,
					fromTicks,
					toTicks,
					currentIndexKey
				)

			this.diadocClientService.checkByResponse(iterationResponse, {
				fromTicks: fromTicks,
				toTicks: toTicks,
				boxId: boxId
			})

			const iterationEvents: IDiadocEvent[] = iterationResponse?.data?.Events

			if (iterationEvents?.length) {
				await this.processUpdatedStatusData(this.eventMapper(iterationEvents))
			} else {
				break
			}
		}
	}

	async processDeleteFiles(fileDiadocIds: string[]): Promise<void> {
		this.logger.log(`Обработка накопленных событий удаления файла от Диадок`)
		const fileInstancesForDelete: Files[] = []

		for (const currFileDiadocId of fileDiadocIds) {
			this.logger.log(
				`Обработка события удаления для entityId(diadocId)=${currFileDiadocId}`
			)

			let fileInstance: Files
			try {
				fileInstance = await this.filesService.getByDiadocId(currFileDiadocId)
			} catch (e) {
				const errorMessage: string = `Ошибка считывания файла по diadocId=${currFileDiadocId}`
				this.logger.error(errorMessage)
				throw new InternalServerErrorException(errorMessage)
			}

			if (!fileInstance) {
				const errorMessage = `Не найден файл (diadocId=${currFileDiadocId}) для удаления`
				this.logger.error(errorMessage)
				throw new InternalServerErrorException(errorMessage)
			}

			try {
				await this.filesService.delete(fileInstance.id, "diadoc")
			} catch (error) {
				this.setError(
					`Возникла ошибка при удалении файла ${fileInstance.id}: ${error.message}`,
					error
				)
			}

			const docInstance: Docs = fileInstance.docs
			this.logger.log(
				`Проверяю, остались ли ещё неудалённые файлы (document: ${docInstance.id})`
			)
			const extendedDocInstance: Docs =
				await this.docsService.getExtendedDocInfoById(docInstance.id)

			const docFiles: Files[] = extendedDocInstance.files.filter(
				(curr: Files) => !curr.is_archive && !curr.is_print_form
			)
			const undeletedFilesCount: number = docFiles.length
			this.logger.log(
				`Кол-во неудалённых файлов документа ${extendedDocInstance.id}: ${undeletedFilesCount}`
			)

			if (!undeletedFilesCount) {
				this.logger.log(
					`У документа (${extendedDocInstance.id}) не осталось файлов`
				)
				try {
					this.logger.log(`Удаляю документ ${extendedDocInstance.id}`)
					await this.docsService.deleteByDocId(
						extendedDocInstance.doc_id,
						"diadoc"
					)
				} catch (error) {
					this.setError(
						`Возникла ошибка при удалении документа ${extendedDocInstance.id}: ${error.message}`,
						error
					)
				}
				this.logger.log("Удаление завершено")
			}

			fileInstancesForDelete.push(fileInstance)
		}

		// Сбор событий для кафки
		this.logger.log(`Обработка данных об удалении для кафки`)
		try {
			await this.kafkaService.sendDeleteByFiles(
				fileInstancesForDelete,
				fileInstancesForDelete[0].docs
			)
		} catch (e) {
			const errorMessage: string = `Ошибка отправки данных в kafka: ${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	/**
	 * Сохранение статуса
	 * @param updateStatusData объект IDiadocStatusExtended
	 * @returns
	 */
	async saveStatus(updateStatusData: IDiadocStatusExtended): Promise<void> {
		this.logger.log(`Выполняется функция saveStatus с объектом
		updateStatusData: ${JSON.stringify(updateStatusData)}`)

		const fileInstance = await this.filesService.getByDiadocId(
			updateStatusData.entityId
		)

		this.logger.log(`

		Получены следующие данные о файле:
		id: ${fileInstance?.id}
		docs: ${fileInstance?.docs?.id}
		status length: ${fileInstance?.status?.length}

		`)

		/** Пропускаем обработку файлов, если они не были найдены в БД
		 *    это необходимо, чтобы исключить ошибки обработки "чужих" обновлений,
		 *    которые могут возникать при одновременной работе нескольких инстансов сервиса
		 *    с одними и теми же организациями
		 */
		if (!fileInstance) {
			return
		}

		const activeStatus: Status = fileInstance.status.find(
			(curr) => curr.is_active
		)

		if (
			activeStatus &&
			activeStatus?.severity === updateStatusData?.primaryStatus?.Severity &&
			activeStatus?.name === updateStatusData?.primaryStatus?.StatusText
		) {
			this.logger.log(
				`Нет изменения статуса для файла diadoc_id(entityId): ${updateStatusData.entityId}`
			)
		} else {
			this.logger.log(
				`Есть изменение статуса для файла diadoc_id(entityId): ${updateStatusData.entityId}`
			)

			await this.statusServiceDb.processNewStatus(
				updateStatusData.primaryStatus,
				fileInstance
			)

			const docInstance = await this.docsService.getByMessageId(
				updateStatusData.messageId
			)

			await this.docsService.updateDocStatusFromFiles(docInstance.id)

			const diadocGuidBuilder = new DiadocGuidBuilder()

			// Отправка изменений в kafka
			await this.docsService.sendFileUpdateToKafka(
				updateStatusData.entityId,
				diadocGuidBuilder.convertBoxIdToUuid(updateStatusData.counteragentBoxId)
			)
		}
	}

	/**
	 * Отправка обновлений в Kafka
	 * @param updateStatusData объект IDiadocStatusExtended
	 */
	async sendLastUpdateToKafka(
		updateStatusData: IDiadocStatusExtended
	): Promise<void> {
		const docInstance: Docs = await this.docsService.getExtendedDocByMessageId(
			updateStatusData.messageId
		)

		this.kafkaService.sendToKafkaByDoc(docInstance, FileType.DOCUMENT)
	}

	/**
	 * Проверка завершения документооборота по файлу
	 * @param primaryStatus объект IDiadocStatus
	 * @returns boolean
	 */
	checkDocFlowCompleteFileStatus(primaryStatus: IDiadocStatus): boolean {
		return (
			primaryStatus.StatusText === "Документооборот завершен" ||
			primaryStatus.Severity === "Success"
		)
	}
}
