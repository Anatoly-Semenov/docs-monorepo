import { AuthSystemGuardGrpc } from "@docs/common/auth/guards/system-auth.guard"

import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"

import {
	GrpcData,
	GrpcSystemPayload
} from "@docs/shared/decorators/grpc.decorator"

import { GetOperatorsGrpcDto, GrpcResponseDto } from "@docs/shared/dto/v1/grpc"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import { Grpc } from "@docs/shared/types/grpc.types"

@Controller()
@AuthSystemGuardGrpc()
export class DiadocGrpcControllerV1 {
	private readonly logger = new Logger(DiadocGrpcControllerV1.name)
	private mockSystemPayload: IJwtPayloadSystem = {
		system_id: "204b7b7a-de8d-4920-8cea-a8ce4bd1a84a",
		iat: 1
	}

	@GrpcMethod("SigningService", "GetOperatorsList")
	async GetOperatorsList(
		@GrpcData() data: GetOperatorsGrpcDto,
		@GrpcSystemPayload() system: IJwtPayloadSystem
	): Grpc.Response {
		return new GrpcResponseDto({
			message: "Данный функционал недоступен",
			code: Grpc.Status.UNAVAILABLE,
			signId: ""
		})
	}
}
