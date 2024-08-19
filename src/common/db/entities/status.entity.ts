import { Column, Entity, JoinColumn, ManyToOne, Relation } from "typeorm"

import { CommonEntity } from "./common.entity"
import { Docs } from "./docs.entity"
import { Files } from "./files.entity"

@Entity()
export class Status extends CommonEntity {
	@ManyToOne(() => Docs, (docs) => docs.id)
	@JoinColumn({
		name: "docs_id"
	})
	doc: Relation<Docs>
	@Column({
		nullable: true
	})
	docs_id: string

	@ManyToOne(() => Files, (files) => files.id)
	@JoinColumn({
		name: "files_id"
	})
	files: Relation<Files>
	@Column({
		nullable: true
	})
	files_id: string

	@Column()
	name: string

	@Column()
	severity: string

	@Column({
		nullable: true
	})
	service_status: string

	@Column({
		nullable: true
	})
	mapped_status: string

	@Column()
	primary_status: boolean

	@Column()
	is_active: boolean
}
