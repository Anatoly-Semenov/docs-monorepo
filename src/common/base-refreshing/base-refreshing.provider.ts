import { ClassProvider } from "@nestjs/common"

import { BaseRefreshingService } from "./base-refreshing.service"

import { IOC__BASE_REFRESHING_SERVICE } from "@docs/shared/constants/ioc.constants"

export const BaseRefreshingProvider: ClassProvider = {
	provide: IOC__BASE_REFRESHING_SERVICE,
	useClass: BaseRefreshingService
}
