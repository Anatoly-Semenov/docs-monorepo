import { ClassProvider } from "@nestjs/common"

import { SystemsServiceDb } from "./systems.service"

import { IOC__SERVICE__SYSTEMS_DB } from "@docs/shared/constants/ioc.constants"

export const SystemsProviderDb: ClassProvider = {
	provide: IOC__SERVICE__SYSTEMS_DB,
	useClass: SystemsServiceDb
}
