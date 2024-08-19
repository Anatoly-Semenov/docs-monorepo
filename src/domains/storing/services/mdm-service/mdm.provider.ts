import { ClassProvider } from "@nestjs/common"

import { MdmService } from "./mdm.service"

import { IOC__SERVICE__MDM } from "@docs/shared/constants/ioc.constants"

export const MdmProvider: ClassProvider = {
	provide: IOC__SERVICE__MDM,
	useClass: MdmService
}
