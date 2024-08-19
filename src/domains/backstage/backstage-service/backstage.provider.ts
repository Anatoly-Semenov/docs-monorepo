import { ClassProvider } from "@nestjs/common"

import { BackstageService } from "./backstage.service"

import { IOC__BACKSTAGE_SERVICE } from "@docs/shared/constants/ioc.constants"

export const BackstageProvider: ClassProvider = {
	provide: IOC__BACKSTAGE_SERVICE,
	useClass: BackstageService
}
