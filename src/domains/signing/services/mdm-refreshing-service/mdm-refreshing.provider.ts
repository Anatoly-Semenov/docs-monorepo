import { ClassProvider } from "@nestjs/common"

import { MdmRefreshingService } from "@docs/signing/services/mdm-refreshing-service/mdm-refreshing.service"

import { IOC__MDM_REFRESHING_SERVICE } from "@docs/shared/constants/ioc.constants"

export const MdmRefreshingProvider: ClassProvider = {
	provide: IOC__MDM_REFRESHING_SERVICE,
	useClass: MdmRefreshingService
}
