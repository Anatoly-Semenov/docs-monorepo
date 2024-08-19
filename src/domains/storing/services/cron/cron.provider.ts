import { ClassProvider } from "@nestjs/common"

import { CronStoringService } from "./cron.service"

import { IOC__CRON_STORING_SERVICE } from "@docs/shared/constants/ioc.constants"

export const CronProvider: ClassProvider = {
	provide: IOC__CRON_STORING_SERVICE,
	useClass: CronStoringService
}
