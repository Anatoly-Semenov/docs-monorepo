import { ClassProvider } from "@nestjs/common"

import { DiadocRefreshingService } from "./diadoc-refreshing.service"

import { IOC__DIADOC_REFRESHING_SERVICE } from "@docs/shared/constants/ioc.constants"

export const DiadocRefreshingProvider: ClassProvider = {
	provide: IOC__DIADOC_REFRESHING_SERVICE,
	useClass: DiadocRefreshingService
}
