import { AdminEntity } from "nestjs-admin"
import DefaultAdminSite from "nestjs-admin/dist/src/adminCore/adminSite"

import { Admin } from "./admin.entity"
import { CommonEntity } from "./common.entity"
import { Docs } from "./docs.entity"
import { DocsLinks } from "./docs_links.entity"
import { Files } from "./files.entity"
import { Organizations } from "./organizations.entity"
import { Packets } from "./packets.entity"
import { Status } from "./status.entity"
import { Systems } from "./systems.entity"

import { Connection } from "nestjs-admin/dist/src/utils/typeormProxy"

interface Entity {
	fields: string[]
	entity: any
}

const commonFields: string[] = ["id", "created_at", "updated_at", "deleted_at"]

const entities: Entity[] = [
	{
		entity: Organizations,
		fields: [...commonFields]
	},
	{
		entity: DocsLinks,
		fields: [...commonFields]
	},
	{
		entity: Systems,
		fields: [...commonFields]
	},
	{
		entity: Packets,
		fields: [...commonFields, "packetId", "lockmode", "docs"]
	},
	{
		entity: Status,
		fields: [
			...commonFields,
			"service_status",
			"mapped_status",
			"primary_status",
			"is_active",
			"key_status",
			"files_id",
			"severity",
			"docs_id",
			"name"
		]
	},
	{
		entity: Files,
		fields: [
			...commonFields,
			"need_recipient_signature",
			"file_signing_results",
			"is_print_form",
			"messages_id",
			"link_diadoc",
			"document_kind",
			"is_archive",
			"created_by",
			"updated_by",
			"source_id",
			"diadoc_id",
			"deleted_by",
			"s3_links",
			"docs_id",
			"name"
		]
	},
	{
		entity: Admin,
		fields: [...commonFields, "username", "password", "rights"]
	},
	{
		entity: Docs,
		fields: [
			...commonFields,
			"link_contr_system",
			"document_kind",
			"is_cancelled",
			"messages_id",
			"is_internal",
			"is_template",
			"link_diadoc",
			"reg_number",
			"updated_by",
			"entity_id",
			"packet_id",
			"system_id",
			"status_id",
			"isPublish",
			"deleted_by",
			"reg_date",
			"is_send",
			"comment",
			"doc_id",
			"org_id",
			"name",
			"sum",
			"inn",
			"kpp"
		]
	}
]

function generateModel(
	entity: typeof CommonEntity,
	fields: string[] = commonFields
) {
	return class AdminModel extends AdminEntity {
		private list: string[] = fields

		constructor(adminSite: DefaultAdminSite, connection: Connection) {
			super(adminSite, connection)
		}

		public entity = entity

		public searchFields: string[] = this.list
		public listDisplay: string[] = this.list
		public fields: string[] = this.list

		public getName(): string {
			return this.entity?.name || ""
		}
	}
}

const adminModels: any[] = []

for (const item of entities) {
	adminModels.push(generateModel(item.entity, item.fields))
}

export default adminModels
