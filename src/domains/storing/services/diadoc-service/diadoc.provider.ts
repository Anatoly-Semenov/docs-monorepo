import { ClassProvider } from "@nestjs/common"

import { DiadocService } from "./diadoc.service"

import { IOC__SERVICE__DIADOC } from "@docs/shared/constants/ioc.constants"

export const DiadocProvider: ClassProvider = {
	provide: IOC__SERVICE__DIADOC,
	useClass: DiadocService
}
