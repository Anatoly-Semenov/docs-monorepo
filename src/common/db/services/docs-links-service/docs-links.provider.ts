import { ClassProvider } from "@nestjs/common"

import { DocsLinksServiceDb } from "./docs-links.service"

import { IOC__SERVICE__DOCS_LINKS_DB } from "@docs/shared/constants/ioc.constants"

export const DocsLinksProviderDb: ClassProvider = {
	provide: IOC__SERVICE__DOCS_LINKS_DB,
	useClass: DocsLinksServiceDb
}
