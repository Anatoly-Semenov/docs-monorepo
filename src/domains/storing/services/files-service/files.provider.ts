import { ClassProvider } from "@nestjs/common"

import { FilesService } from "./files.service"

import { IOC__SERVICE__FILES } from "@docs/shared/constants/ioc.constants"

export const FilesProvider: ClassProvider = {
	provide: IOC__SERVICE__FILES,
	useClass: FilesService
}
