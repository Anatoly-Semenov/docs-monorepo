import { Column, Entity, OneToMany, Relation } from "typeorm"

import { CommonEntity } from "./common.entity"
import { Docs } from "./docs.entity"

@Entity("systems")
export class Systems extends CommonEntity {
	@Column()
	name: string // наименование

	@Column()
	link: string // ссылка для подключения к системе

	@OneToMany(() => Docs, (docs) => docs.id)
	doc: Relation<Docs>
}
