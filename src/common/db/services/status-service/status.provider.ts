import { ClassProvider } from "@nestjs/common"

import { StatusServiceDb } from "./status.service"

import { IOC__SERVICE__STATUS_DB } from "@docs/shared/constants/ioc.constants"

export const StatusProviderDb: ClassProvider = {
	provide: IOC__SERVICE__STATUS_DB,
	useClass: StatusServiceDb
}
