import { ClassProvider } from "@nestjs/common"

import { DocsService } from "./docs.service"

import { IOC__SERVICE__DOCS } from "@docs/shared/constants/ioc.constants"

export const DocsProvider: ClassProvider = {
	provide: IOC__SERVICE__DOCS,
	useClass: DocsService
}
