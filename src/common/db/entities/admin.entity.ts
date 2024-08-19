import { Column, Entity, JoinColumn, ManyToOne, Relation } from "typeorm"

import { CommonEntity } from "./common.entity"
import { Systems } from "@docs/common/db/entities/systems.entity"

@Entity({
	name: "admin_users"
})
export class Admin extends CommonEntity {
	@Column()
	username: string

	@Column()
	password: string

	@Column({
		default: "canRead"
	})
	rights: string

	@ManyToOne(() => Systems, (system) => system.id, {
		onDelete: "CASCADE"
	})
	@JoinColumn({
		name: "system_id"
	})
	system: Relation<Systems>
}
