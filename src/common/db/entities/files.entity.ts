import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	Relation
} from "typeorm"

import { CommonEntity } from "./common.entity"
import { Docs } from "./docs.entity"
import { Status } from "./status.entity"

import { KindFiles } from "@docs/shared/enums/files.enum"

@Entity("files")
export class Files extends CommonEntity {
	@Column()
	name: string // наименование

	@Column({
		nullable: true
	})
	source_id: string //ID от системы-источника

	@Column({
		enum: KindFiles,
		type: "enum",
		nullable: true
	})
	document_kind: KindFiles // вид файла в документе

	@Column({
		nullable: true
	})
	diadoc_id: string //entityId от Диадок

	@Column({
		nullable: true
	})
	link_diadoc: string // внешний ключ

	@ManyToOne(() => Docs, (docs) => docs.id)
	@JoinColumn({
		name: "docs_id"
	})
	docs: Relation<Docs> // внеш. ключ ид документа
	@Column({
		nullable: true
	})
	docs_id: string

	@OneToMany(() => Status, (status) => status.files)
	status: Status[]

	@Column()
	is_main: boolean

	@Column({
		default: false,
		nullable: true
	})
	need_recipient_signature: boolean // запрос подписи получателя

	@Column({
		nullable: true
	})
	is_print_form: boolean

	@Column({
		nullable: true
	})
	is_archive: boolean

	@Column({
		nullable: true
	})
	received_date: Date // дата получения смежной системой

	@Column({
		nullable: true
	})
	file_type: string

	@Column({
		nullable: true,
		type: "float"
	})
	total_sum: number

	@Column({
		nullable: true
	})
	price_list_effective_date: Date

	@Column({
		nullable: true
	})
	begin_date: Date

	@Column({
		nullable: true
	})
	end_date: Date

	@Column({
		nullable: true
	})
	created_by: string

	@Column({
		nullable: true
	})
	updated_by: string

	@Column({
		nullable: true
	})
	deleted_by: string

	@Column({
		nullable: true
	})
	link_diadoc_template: string

	@Column({
		nullable: false,
		default: false
	})
	is_deleted_from_s3: boolean // Признак удаления файла из s3
}
