import {
	Column,
	Entity,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from "typeorm"

import { Docs } from "@docs/common/db/entities/docs.entity"

import { OrganizationType } from "@docs/shared/enums/organization.enum"

@Entity("counterparties")
export class Counterparty {
	@PrimaryGeneratedColumn("uuid")
	id: string

	@Column({
		nullable: false
	})
	name: string

	@Column({
		nullable: false
	})
	full_name: string

	@Column({
		nullable: false,
		type: "varchar",
		length: 12
	})
	inn: string

	@Column({
		nullable: true,
		type: "varchar",
		length: 9
	})
	kpp: string

	@Column({
		type: "enum",
		nullable: false,
		enum: OrganizationType
	})
	type: OrganizationType

	@Column({
		default: false,
		nullable: false
	})
	is_cancel: boolean

	@UpdateDateColumn()
	modified_at: Date

	@ManyToMany(() => Docs, (doc) => doc.counterparties, {
		onDelete: "NO ACTION",
		onUpdate: "NO ACTION"
	})
	docs: Docs[] // Контрагенты-получатели
}
