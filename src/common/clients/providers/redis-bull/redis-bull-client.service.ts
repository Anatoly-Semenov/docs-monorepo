import { Job, JobOptions, Queue } from "bull"

import { InjectQueue } from "@nestjs/bull"
import {
	Injectable,
	InternalServerErrorException,
	Logger
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import {
	BULL_DOWNLOAD_ARCHIVE_HANDLER_EVENT,
	BULL_DOWNLOAD_PRINT_FORM_HANDLER_EVENT,
	BULL_DOWNLOADER_QUEUE,
	BULL_ONE_FILE_DOWNLOADER,
	BULL_PROCESSOR_QUEUE
} from "@docs/shared/constants/config.constants"

import {
	DownloadJobData,
	IJobBuilderParams
} from "@docs/shared/interfaces/client/redis-bull.interfaces"

import { JobType } from "@docs/shared/enums/redis-bull.enum"

@Injectable()
export class RedisBullClientService {
	private readonly logger = new Logger(RedisBullClientService.name)
	private diadocRefreshTime: number

	constructor(
		private readonly configService: ConfigService,

		@InjectQueue(BULL_DOWNLOADER_QUEUE)
		private readonly bullDownloaderQueue: Queue<DownloadJobData>,

		@InjectQueue(BULL_PROCESSOR_QUEUE)
		private readonly bullProcessorQueue: Queue<DownloadJobData>
	) {
		this.diadocRefreshTime = +this.configService.getOrThrow(
			"DIADOC_REFRESH_TIME"
		)

		this.logger.log(`Значение diadocRefreshTime=${this.diadocRefreshTime}`)
	}

	public async addDownloadPrintFormJob(data: DownloadJobData): Promise<Job> {
		return await this.jobBuilder({
			data,
			jobName: BULL_DOWNLOAD_PRINT_FORM_HANDLER_EVENT,
			entityName: "печатных форм",
			jobType: JobType.DOWNLOAD,
			jobOptions: {}
		})
	}

	public async addDownloadArchiveJob(data: DownloadJobData): Promise<Job> {
		return await this.jobBuilder({
			data,
			jobName: BULL_DOWNLOAD_ARCHIVE_HANDLER_EVENT,
			entityName: "архива",
			jobType: JobType.DOWNLOAD,
			jobOptions: {}
		})
	}

	/**
	 * Отправка задачи на загрузку в очередь
	 * @param diadocId diadoc_id файла
	 * @param jobName название job'ы
	 */
	public async addFinalDocumentFlowDownloadJob(
		diadocId: string,
		jobName: string = BULL_ONE_FILE_DOWNLOADER
	): Promise<Job> {
		return await this.jobBuilder({
			data: { diadocId },
			jobName,
			entityName: "",
			jobType: JobType.FINAL_DOCUMENT_FLOW,
			jobOptions: {
				backoff: 1000,
				attempts: 3
			}
		})
	}

	/**
	 * Отправка задачи в очередь
	 * @param data данные (diadoc_id)
	 * @param jobName название job'ы
	 * @param entityName название затрагиваемой сущности
	 * @param jobType тип job'ы
	 * @param jobOptions дополнительные опции
	 * @returns Job
	 */
	private async jobBuilder(params: IJobBuilderParams): Promise<Job> {
		const { data, jobName, entityName, jobType, jobOptions } = params
		const stringifyData: string = JSON.stringify(data)

		let queue: Queue<DownloadJobData>
		let successLog: string
		let errorLog: string

		switch (jobType) {
			case JobType.DOWNLOAD:
				this.logger.log(
					`Создаю задачу на загрузку ${entityName} (${stringifyData})`
				)
				queue = this.bullDownloaderQueue
				successLog = `Задача на загрузку ${entityName} установлена (${stringifyData})`
				errorLog = `Ошибка создания задачи на загрузку ${entityName} (${stringifyData})`
				break
			case JobType.FINAL_DOCUMENT_FLOW:
				this.logger.log(
					`Создаю задачу завершающего документооборота (${stringifyData})`
				)
				queue = this.bullProcessorQueue
				successLog = `Задача завершающего документоборота установлена (${stringifyData})`
				errorLog = `Ошибка создания задачи завершающего документооборота (${stringifyData})`
				break
			default:
				const errorMessage: string = `Непредвиденное значение jobType: ${jobType}`
				this.logger.error(errorMessage)
				throw new InternalServerErrorException(errorMessage)
		}

		try {
			const job: Job = await queue.add(
				jobName,
				data,
				this.getJobOptions(jobOptions)
			)

			this.logger.log(successLog)

			return job
		} catch (error) {
			this.setError(errorLog, this.bullDownloaderQueue, error)
		}
	}

	private getJobOptions(
		{ backoff = 0, attempts = 0 }: Partial<JobOptions> = {
			backoff: 0,
			attempts: 0
		}
	): JobOptions {
		return {
			backoff: backoff || this.diadocRefreshTime,
			removeOnComplete: true,
			attempts: attempts || 7,
			removeOnFail: true
		}
	}

	private setError(message: string, queue: Queue, error: any): void {
		this.logger.error(message)
		throw new InternalServerErrorException(
			`${message} | queue status: ${queue?.client?.status || "unknown"} | error: ${JSON.stringify(error)}`
		)
	}
}
