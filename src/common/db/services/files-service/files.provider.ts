import { ClassProvider } from "@nestjs/common"

import { FilesServiceDb } from "./files.service"

import { IOC__SERVICE__FILES_DB } from "@docs/shared/constants/ioc.constants"

export const FilesProviderDb: ClassProvider = {
	provide: IOC__SERVICE__FILES_DB,
	useClass: FilesServiceDb
}
