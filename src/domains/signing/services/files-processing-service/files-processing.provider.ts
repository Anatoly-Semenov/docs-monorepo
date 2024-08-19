import { ClassProvider } from "@nestjs/common"

import { FilesProcessingService } from "./files-processing.service"

import { IOC__FILES_PROCESSING_SERVICE } from "@docs/shared/constants/ioc.constants"

export const FilesProcessingProvider: ClassProvider = {
	provide: IOC__FILES_PROCESSING_SERVICE,
	useClass: FilesProcessingService
}
