import {
	GrpcPacketLockMode,
	PacketLockmode
} from "@docs/shared/enums/packet.enum"

export function grpcPacketLockModeMapper(
	vgo: GrpcPacketLockMode
): PacketLockmode {
	switch (vgo) {
		case GrpcPacketLockMode.Send:
			return PacketLockmode.Send
		case GrpcPacketLockMode.Full:
			return PacketLockmode.Full
		case GrpcPacketLockMode.None:
		default:
			return PacketLockmode.None
	}
}
