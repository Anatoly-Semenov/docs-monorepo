import AdminSection from "nestjs-admin/dist/src/adminCore/adminSection"

import { EntityMetadata } from "typeorm"

import { EntityType } from "nestjs-admin/dist/src/types"

export interface AdminModelsQuery {
	sectionName?: string
	entityName?: string
	primaryKey?: string
}

export interface AdminModel {
	metadata: EntityMetadata
	adminEntity: EntityType
	section: AdminSection
	entity: EntityType
}
