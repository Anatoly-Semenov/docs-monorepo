import { Column, Entity, OneToMany } from "typeorm"

import { ORGANIZATION_ENTITY_NULL_FEATURE } from "@docs/shared/constants/comment.constants"

import { CommonEntity } from "./common.entity"
import { Docs } from "./docs.entity"

import { OrganizationType } from "@docs/shared/enums/organization.enum"

@Entity("organizations")
export class Organizations extends CommonEntity {
	/** ID организации в Диадок */
	@Column({
		nullable: true
	})
	org_id: string

	/** Наименование организации */
	@Column({
		nullable: true
	})
	name: string

	/** Полное наименование */
	@Column({
		nullable: true
	})
	full_name: string

	/** ИНН организации */
	@Column({
		nullable: true
	})
	inn: string

	/** КПП организации */
	@Column({
		nullable: true
	})
	kpp: string

	/** Идентификатор ящика в Диадок */
	@Column({
		nullable: true
	})
	box_id: string

	/** Идентификатор ящика в Диадок UUID без домена (@diadoc.com) */
	@Column({
		nullable: true
	})
	box_id_guid: string

	/** Вид организации */
	@Column({
		type: "enum",
		enum: OrganizationType,
		nullable: true
	})
	type: OrganizationType

	/** Зарегистрированный в ФНС ИД участника (uuid) */
	@Column({
		nullable: true
	})
	fns_participant_id: string

	/** Организация начала документооборот
	 * (включаем её в запрос на обновление статусов) */
	@Column({
		nullable: true,
		default: false
	})
	is_document_flow: boolean

	/** OrgId на стороне Диадок */
	@Column({
		nullable: true
	})
	org_id_diadoc: string

	@OneToMany(() => Docs, (docs) => docs.organization)
	docs: Docs[]

	@Column({
		comment: ORGANIZATION_ENTITY_NULL_FEATURE,
		nullable: true
	})
	is_proxy_allowed: boolean

	@Column({
		comment: ORGANIZATION_ENTITY_NULL_FEATURE,
		nullable: true
	})
	is_lock_send_allowed: boolean

	@Column({
		comment: ORGANIZATION_ENTITY_NULL_FEATURE,
		nullable: true
	})
	is_approvement_signatures_allowed: boolean
}
