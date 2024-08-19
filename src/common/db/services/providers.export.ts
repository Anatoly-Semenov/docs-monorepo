import { ClassProvider } from "@nestjs/common"

import { DocsRecipientProviderDb } from "./docs-recipient-service/docs-recipient.provider"
import { ErrorLogsDbProvider } from "./error-logs-service/error-logs-db.provider"
import { FilesProviderDb } from "./files-service/files.provider"
import { OperatorProviderDb } from "./operators-service/operators.provider"
import { OrganizationsProviderDb } from "./organizations/organization.provider"
import { PacketsProviderDb } from "./packets-service/packets.provider"
import { StatusProviderDb } from "./status-service/status.provider"
import { SystemsProviderDb } from "./systems-service/systems.provider"
import { CounterpartyProviderDb } from "./сounterparty-service/counterparty.provider"
import { DocsLinksProviderDb } from "@docs/common/db/services/docs-links-service/docs-links.provider"
import { DocsServiceProviderDb } from "@docs/common/db/services/docs-service/docs.provider"

export const DBProvidersExport: ClassProvider[] = [
	OrganizationsProviderDb,
	DocsRecipientProviderDb,
	CounterpartyProviderDb,
	DocsServiceProviderDb,
	ErrorLogsDbProvider,
	DocsLinksProviderDb,
	OperatorProviderDb,
	SystemsProviderDb,
	PacketsProviderDb,
	StatusProviderDb,
	FilesProviderDb
]
