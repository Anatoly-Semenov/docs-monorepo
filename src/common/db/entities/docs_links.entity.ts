import { Column, Entity, JoinColumn, ManyToOne, Relation } from "typeorm"

import { CommonEntity } from "./common.entity"
import { Docs } from "./docs.entity"

@Entity()
export class DocsLinks extends CommonEntity {
	@ManyToOne(() => Docs, (docs) => docs.id)
	@JoinColumn({
		name: "parent_doc_id"
	})
	parentDoc: Relation<Docs>
	@Column()
	parent_doc_id: string

	@ManyToOne(() => Docs, (docs) => docs.id)
	@JoinColumn({
		name: "linked_doc_id"
	})
	linkedDoc: Relation<Docs>
	@Column({
		nullable: true
	})
	linked_doc_id: string

	@Column({
		nullable: true
	})
	remote_linked_doc_id: string
}
