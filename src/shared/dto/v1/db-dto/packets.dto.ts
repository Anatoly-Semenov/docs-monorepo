import { IsEnum, IsOptional, IsString } from "class-validator"

import { PacketLockmode } from "@docs/shared/enums/packet.enum"

export class PacketsDto {
	@IsString()
	packetId: string

	@IsEnum(PacketLockmode)
	@IsOptional()
	lockmode?: PacketLockmode
}
