import { DocResponseDto } from "@docs/shared/dto/v1/doc.responses.dto"
import { GrpcResponseDto } from "@docs/shared/dto/v1/grpc"

export function docResponseGrpcMapper(value: DocResponseDto): GrpcResponseDto {
	return new GrpcResponseDto({
		message: value.message,
		signId: value.sign_id,
		code: value.code
	})
}
