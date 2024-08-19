import { Inject, Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

import { FileCleanerService } from "../files-service/file-cleaner.service"
import { ICronStoringService } from "@docs/shared/interfaces/services/cron-service.interfaces"

import { IOC__SERVICE__FILES_CLEANER } from "@docs/shared/constants/ioc.constants"

@Injectable()
export class CronStoringService implements ICronStoringService {
	private readonly logger = new Logger(CronStoringService.name)

	constructor(
		@Inject(IOC__SERVICE__FILES_CLEANER)
		private readonly fileCleanerService: FileCleanerService
	) {}

	@Cron(process.env.CRON_PERIOD_FILE_CLEANER || CronExpression.EVERY_DAY_AT_1AM)
	async deleteOldFiles(): Promise<void> {
		await this.fileCleanerService.deleteOldFiles()
	}
}
