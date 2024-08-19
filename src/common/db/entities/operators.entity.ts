import { Column, Entity } from "typeorm"

import { CommonEntity } from "./common.entity"

@Entity("operators")
export class Operator extends CommonEntity {
	@Column({
		unique: true
	})
	fns_id: string

	@Column()
	name: string

	@Column()
	is_active: boolean
}
