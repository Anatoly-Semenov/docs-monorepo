import { Job } from "bull"

import { Process, Processor } from "@nestjs/bull"
import { Inject, Logger } from "@nestjs/common"

import { WorkerService } from "../services/worker-service/worker.service"

import {
	BULL_DOWNLOAD_ARCHIVE_HANDLER_EVENT,
	BULL_DOWNLOAD_PRINT_FORM_HANDLER_EVENT,
	BULL_DOWNLOADER_QUEUE
} from "@docs/shared/constants/config.constants"
import { IOC__WORKER_SERVICE } from "@docs/shared/constants/ioc.constants"

import { IWorkerJobFileDiadocId } from "@docs/shared/interfaces/processor/worker-processor.interfaces"

@Processor(BULL_DOWNLOADER_QUEUE)
export class DownloaderProcessor {
	constructor(
		@Inject(IOC__WORKER_SERVICE)
		private readonly workerService: WorkerService
	) {}

	private readonly logger = new Logger(DownloaderProcessor.name)

	@Process(BULL_DOWNLOAD_PRINT_FORM_HANDLER_EVENT)
	async downloadPrintFormProcess(dataRaw: Job<IWorkerJobFileDiadocId>) {
		const { diadocId } = dataRaw.data

		this.logger.log(
			`Получено redis-bull событие для загрузки ПФ diadocId=${diadocId}`
		)

		this.workerService.downloadHandlerPrintingForms(diadocId)
	}

	@Process(BULL_DOWNLOAD_ARCHIVE_HANDLER_EVENT)
	async downloadArchiveProcess(dataRaw: Job<IWorkerJobFileDiadocId>) {
		const { diadocId } = dataRaw.data

		this.logger.log(
			`Получено redis-bull событие для загрузки архива diadocId=${diadocId}`
		)

		this.workerService.downloadHandlerArchives(diadocId)
	}
}
