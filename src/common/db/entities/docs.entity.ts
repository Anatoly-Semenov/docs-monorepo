import {
	Column,
	Entity,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	OneToMany,
	Relation
} from "typeorm"

import { CommonEntity } from "./common.entity"
import { DocsRecipient } from "./docs-recipient.entity"
import { DocsLinks } from "./docs_links.entity"
import { Files } from "./files.entity"
import { Organizations } from "./organizations.entity"
import { Packets } from "./packets.entity"
import { Status } from "./status.entity"
import { Systems } from "./systems.entity"
import { Counterparty } from "@docs/common/db/entities/counterparty.entity"

import { Vgo } from "@docs/shared/enums/docs.enum"
import { PacketLockmode } from "@docs/shared/enums/packet.enum"

@Entity("docs")
export class Docs extends CommonEntity {
	@Column({
		comment: "ID в системе-источнике"
	})
	doc_id: string

	@Column({
		comment: "ID сообщения в диадок",
		nullable: true
	})
	messages_id: string

	@ManyToOne(() => Packets, (packets) => packets.id)
	@JoinColumn({
		name: "packet_id"
	})
	packet: Relation<Packets>
	@Column({
		comment: "Внешний ключ на ид пакета",
		nullable: true
	})
	packet_id: string

	@Column({
		comment: "Регистрационный номер документа"
	})
	reg_number: string

	@Column({
		comment: "Дата регистрации документа"
	})
	reg_date: Date

	@Column({
		comment: "Наименование документа"
	})
	name: string

	@Column({
		nullable: true,
		comment: "Вид документа"
	})
	document_kind: string

	@Column({
		comment: "Сумма документа",
		type: "numeric",
		precision: 17,
		scale: 2
	})
	sum: number

	@Column({
		comment: "Сумма НДС документа, в том числе",
		nullable: true,
		type: "float"
	})
	total_vat: number

	@Column({
		comment: "Код валюты",
		nullable: true
	})
	currency_code: number

	@Column({
		comment:
			"Флаг, обозначающий запрос подписи получателя под отправляемым документом",
		default: false,
		nullable: true
	})
	need_recipient_signature: boolean

	@Column({
		comment: "Признак документа внутри организации",
		default: false
	})
	is_internal: boolean

	@Column({
		default: false
	})
	is_cancelled: boolean

	@Column({
		comment: "Признак шаблона",
		nullable: true
	})
	is_template: boolean

	@Column({
		comment: "Признак тестового документа",
		nullable: false,
		default: false
	})
	is_test: boolean

	@Column({
		comment: "Признак роуминга",
		nullable: true
	})
	isRoaming: boolean

	@Column({
		comment: "Признак публикации",
		default: false
	})
	isPublish: boolean

	@Column({
		comment: "Комментарий к документу",
		nullable: true
	})
	comment: string

	@Column({
		comment: "Ссылка на карточку документа в системе-источнике",
		nullable: true
	})
	link_contr_system: string

	@Column({
		comment: "Ссылка на карточку в diadoc",
		nullable: true
	})
	link_diadoc: string

	@ManyToOne(() => Systems, (systems) => systems.id)
	@JoinColumn({
		name: "system_id"
	})
	system: Relation<Systems>
	@Column({
		comment: "Внешний ключ ид системы-источника документа"
	})
	system_id: string

	@OneToMany(() => Status, (status) => status.doc) //статус
	@JoinColumn({
		name: "status_id"
	})
	status: Status[]

	@ManyToOne(() => Organizations, (org) => org.id)
	@JoinColumn({
		name: "org_id"
	})
	organization: Relation<Organizations>
	@Column({
		comment: "Внешний ключ ид организации",
		nullable: true
	})
	org_id: string

	// TODO Deprecated: в новых документах не используется
	@Column({
		comment: "ИНН контрагента (Deprecated: в новых документах не используется)",
		nullable: true
	})
	inn: string

	@OneToMany(() => Files, (files) => files.docs)
	files: Files[]

	@Column({
		type: "enum",
		enum: PacketLockmode,
		default: PacketLockmode.None,
		nullable: true
	})
	lockMode: PacketLockmode

	@OneToMany(() => DocsLinks, (docsLinks) => docsLinks.parentDoc)
	DocsLinkAsParent: DocsLinks[]

	@OneToMany(() => DocsLinks, (docsLinks) => docsLinks.linkedDoc)
	DocsLinkAsLinked: DocsLinks[]

	@Column({
		comment: "UUID пользователя или системы",
		nullable: true
	})
	created_by: string

	@Column({
		comment: "UUID пользователя или системы",
		nullable: true
	})
	updated_by: string

	@Column({
		comment: "UUID пользователя или системы",
		nullable: true
	})
	deleted_by: string

	@ManyToMany(() => Counterparty, (counterparty) => counterparty.docs, {
		onDelete: "NO ACTION",
		onUpdate: "NO ACTION"
	})
	counterparties: Counterparty[] // Контрагенты-получатели

	@OneToMany(() => DocsRecipient, (docsRecipient) => docsRecipient.docs, {
		cascade: true
	})
	docsRecipient: DocsRecipient[]

	@Column({
		nullable: true,
		default: Vgo.None,
		type: "enum",
		enum: Vgo
	})
	vgo: Vgo

	@Column({
		comment: "Ссылка на шаблон в диадок",
		nullable: true
	})
	link_diadoc_template: string

	@Column({
		comment: `Список ящиков компаний. Храним массив boxes_id в виде строки через ","`,
		nullable: true
	})
	boxes_id: string
}
