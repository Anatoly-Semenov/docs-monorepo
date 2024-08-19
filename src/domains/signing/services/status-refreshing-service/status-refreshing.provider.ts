import { ClassProvider } from "@nestjs/common"

import { StatusRefreshingService } from "./status-refreshing.service"

import { IOC__STATUS_REFRESHING_SERVICE } from "@docs/shared/constants/ioc.constants"

export const StatusRefreshingProvider: ClassProvider = {
	provide: IOC__STATUS_REFRESHING_SERVICE,
	useClass: StatusRefreshingService
}
