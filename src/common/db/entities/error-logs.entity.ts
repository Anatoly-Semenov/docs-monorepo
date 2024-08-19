import { Column, Entity } from "typeorm"

import { CommonEntity } from "./common.entity"

@Entity()
export class ErrorLogs extends CommonEntity {
	@Column()
	doc_id: string

	@Column({
		nullable: true
	})
	errors: string
}
