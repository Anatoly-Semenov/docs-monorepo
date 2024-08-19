import { ClassProvider } from "@nestjs/common"

import { FilesDownloadService } from "./files-download.service"

import { IOC__SERVICE__FILES_DOWNLOAD } from "@docs/shared/constants/ioc.constants"

export const FilesDownloadProvider: ClassProvider = {
	provide: IOC__SERVICE__FILES_DOWNLOAD,
	useClass: FilesDownloadService
}
