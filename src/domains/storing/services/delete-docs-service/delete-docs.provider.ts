import { ClassProvider } from "@nestjs/common"

import { DeleteDocsService } from "./delete-docs.service"

import { IOC__SERVICE__DELETE_DOCS } from "@docs/shared/constants/ioc.constants"

export const DeleteDocsProvider: ClassProvider = {
	provide: IOC__SERVICE__DELETE_DOCS,
	useClass: DeleteDocsService
}
