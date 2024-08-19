import { ClassProvider } from "@nestjs/common"

import { FileCleanerService } from "./file-cleaner.service"

import { IOC__SERVICE__FILES_CLEANER } from "@docs/shared/constants/ioc.constants"

export const FilesCleanerProvider: ClassProvider = {
	provide: IOC__SERVICE__FILES_CLEANER,
	useClass: FileCleanerService
}
