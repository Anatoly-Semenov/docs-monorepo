import { Admin } from "./admin.entity"
import { Docs } from "./docs.entity"
import { DocsLinks } from "./docs_links.entity"
import { ErrorLogs } from "./error-logs.entity"
import { Files } from "./files.entity"
import { Operator } from "./operators.entity"
import { Organizations } from "./organizations.entity"
import { Packets } from "./packets.entity"
import { Status } from "./status.entity"
import { Systems } from "./systems.entity"
import { Counterparty } from "@docs/common/db/entities/counterparty.entity"
import { DocsRecipient } from "@docs/common/db/entities/docs-recipient.entity"

export const exportEntities = [
	Organizations,
	DocsRecipient,
	Counterparty,
	DocsLinks,
	Operator,
	ErrorLogs,
	Systems,
	Packets,
	Status,
	Files,
	Admin,
	Docs
]
