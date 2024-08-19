import { GrpcVgo, Vgo } from "@docs/shared/enums/docs.enum"

export function grpcVgoMapper(vgo: GrpcVgo): Vgo {
	switch (vgo) {
		case GrpcVgo.One:
			return Vgo.One
		case GrpcVgo.Two:
			return Vgo.Two
		case GrpcVgo.None:
		default:
			return Vgo.None
	}
}
