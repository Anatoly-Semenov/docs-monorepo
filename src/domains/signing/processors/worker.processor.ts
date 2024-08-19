import { Job } from "bull"

import { Process, Processor } from "@nestjs/bull"
import {
	Inject,
	InternalServerErrorException,
	Logger,
	NotFoundException
} from "@nestjs/common"

import { RedisBullClientService } from "@docs/common/clients/providers/redis-bull/redis-bull-client.service"

import { DocsService } from "@docs/storing/services/docs-service/docs.service"

import {
	BULL_ONE_FILE_DOWNLOADER,
	BULL_PRINTING_FORMS_EVENT,
	BULL_PROCESSOR_QUEUE
} from "@docs/shared/constants/config.constants"
import {
	IOC__SERVICE__CLIENT_PROVIDER_REDIS_BULL,
	IOC__SERVICE__DOCS
} from "@docs/shared/constants/ioc.constants"

import {
	IWorkerJobDocId,
	IWorkerJobFileDiadocId
} from "@docs/shared/interfaces/processor/worker-processor.interfaces"

@Processor(BULL_PROCESSOR_QUEUE)
export class WorkerProcessor {
	constructor(
		@Inject(IOC__SERVICE__DOCS)
		private readonly docsService: DocsService,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_REDIS_BULL)
		private redisBullClientService: RedisBullClientService
	) {}

	private readonly logger = new Logger(WorkerProcessor.name)

	@Process(BULL_PRINTING_FORMS_EVENT)
	async statusProcessing(dataRaw: Job<IWorkerJobDocId>) {
		const { data } = dataRaw
		const { docId } = data

		this.logger.log(
			`Получено redis-bull событие для обработки файлов из Диадок docId=${docId}`
		)

		await this.docsService.prepareFilesFromDiadoc(docId)

		this.logger.log(`Устанавливаю таймауты на загрузку файлов (docId:${docId})`)

		await Promise.all([
			this.redisBullClientService.addDownloadPrintFormJob({ docId }),
			this.redisBullClientService.addDownloadArchiveJob({ docId })
		])

		this.logger.log("Таймауты загрузки установлены")
	}

	@Process(BULL_ONE_FILE_DOWNLOADER)
	async downloaderInit(dataRaw: Job<IWorkerJobFileDiadocId>) {
		const { diadocId } = dataRaw.data

		this.logger.log(
			`Получено событие для загрузки пф/архива для файла diadocId=${diadocId}`
		)
		this.logger.log(
			`Выполняю запрос на подготовку пф/архива для файла diadocId=${diadocId}`
		)

		try {
			await this.docsService.prepareFileForDownloadingFromDiadocId(diadocId)
		} catch (e) {
			if (e instanceof NotFoundException) {
				this.logger.log(
					`Пропускаю загрузку печатных форм и архивов, т.к. данный файл не существует в этой системе`
				)
				return
			}
			const errorMessage: string = `Возникла ошибка при подготовке печатной формы (diadocId=${diadocId}): ${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}

		await Promise.all([
			this.redisBullClientService.addDownloadPrintFormJob({ diadocId }),
			this.redisBullClientService.addDownloadArchiveJob({ diadocId })
		])
	}
}
