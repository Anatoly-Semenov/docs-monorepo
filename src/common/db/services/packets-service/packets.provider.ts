import { ClassProvider } from "@nestjs/common"

import { PacketsServiceDb } from "./packets.service"

import { IOC__SERVICE__PACKETS_DB } from "@docs/shared/constants/ioc.constants"

export const PacketsProviderDb: ClassProvider = {
	provide: IOC__SERVICE__PACKETS_DB,
	useClass: PacketsServiceDb
}
