import { ClassProvider } from "@nestjs/common"

import { DocsServiceDb } from "./docs.service"

import { IOC__SERVICE__DOCS_DB } from "@docs/shared/constants/ioc.constants"

export const DocsServiceProviderDb: ClassProvider = {
	provide: IOC__SERVICE__DOCS_DB,
	useClass: DocsServiceDb
}
