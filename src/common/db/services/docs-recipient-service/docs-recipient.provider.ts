import { ClassProvider } from "@nestjs/common"

import { DocsRecipientServiceDb } from "./docs-recipient.service"

import { IOC__SERVICE__DOCS_RECIPIENT_DB } from "@docs/shared/constants/ioc.constants"

export const DocsRecipientProviderDb: ClassProvider = {
	provide: IOC__SERVICE__DOCS_RECIPIENT_DB,
	useClass: DocsRecipientServiceDb
}
