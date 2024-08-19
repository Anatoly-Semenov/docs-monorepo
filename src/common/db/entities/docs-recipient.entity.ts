import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
	Relation
} from "typeorm"

import { Counterparty } from "@docs/common/db/entities/counterparty.entity"
import { Docs } from "@docs/common/db/entities/docs.entity"

@Entity("docs_recipient")
export class DocsRecipient {
	@PrimaryColumn({ type: "uuid", name: "docs_id", comment: "ID документа" })
	docsId: string

	@PrimaryColumn({
		type: "uuid",
		name: "counterparties_id",
		comment: "ID контрагента"
	})
	counterpartiesId: string

	@ManyToOne(() => Docs, (docs) => docs.id, {
		onDelete: "NO ACTION",
		onUpdate: "NO ACTION"
	})
	@JoinColumn([{ name: "docs_id", referencedColumnName: "id" }])
	docs: Relation<Docs>

	@ManyToOne(() => Counterparty, (counterparty) => counterparty.id, {
		onDelete: "NO ACTION",
		onUpdate: "NO ACTION"
	})
	@JoinColumn([{ name: "counterparties_id", referencedColumnName: "id" }])
	counterparties: Relation<Counterparty>

	@Column({
		comment: "порядок подписания"
	})
	order: number
}
