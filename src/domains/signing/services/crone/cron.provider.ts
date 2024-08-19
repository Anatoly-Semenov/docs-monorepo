import { ClassProvider } from "@nestjs/common"

import { CronSigningService } from "./cron.service"

import { IOC__CRON_SIGNING_SERVICE } from "@docs/shared/constants/ioc.constants"

export const CronProvider: ClassProvider = {
	provide: IOC__CRON_SIGNING_SERVICE,
	useClass: CronSigningService
}
