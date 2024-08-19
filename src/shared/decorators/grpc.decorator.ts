import { createParamDecorator, ExecutionContext } from "@nestjs/common"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import { Grpc } from "@docs/shared/types/grpc.types"

export const GrpcData = createParamDecorator((_, context: ExecutionContext) => {
	return context.getArgByIndex(Grpc.Args.DATA)
})

export const GrpcMetadata = createParamDecorator(
	(_, context: ExecutionContext) => {
		return context.getArgByIndex(Grpc.Args.METADATA)
	}
)

export const GrpcSystemPayload = createParamDecorator(
	(_, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest()

		return request?.system as IJwtPayloadSystem
	}
)

export const GrpcCall = createParamDecorator((_, context: ExecutionContext) => {
	return context.getArgByIndex(Grpc.Args.CALL)
})
