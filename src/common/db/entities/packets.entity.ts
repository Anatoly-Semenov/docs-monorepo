import { Column, Entity, OneToMany, Relation } from "typeorm"

import { CommonEntity } from "./common.entity"
import { Docs } from "./docs.entity"

import { PacketLockmode } from "@docs/shared/enums/packet.enum"

@Entity("packets")
export class Packets extends CommonEntity {
	@Column()
	packetId: string

	@Column({
		type: "enum",
		enum: PacketLockmode
	})
	lockmode: PacketLockmode

	@OneToMany(() => Docs, (docs) => docs.packet)
	docs: Relation<Docs[]>
}
