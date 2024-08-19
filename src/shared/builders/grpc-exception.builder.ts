import { StringBuilder } from "@docs/shared/builders/string.builder"

import { HttpException, Logger } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"

import { IHttpError } from "@docs/shared/interfaces/error/error.interfaces"

import { Grpc } from "@docs/shared/types/grpc.types"

export class GrpcExceptionBuilder {
	private readonly stringBuilder = new StringBuilder()

	constructor(private readonly logger: Logger) {}

	build(details: string, error: unknown): void {
		if (error instanceof HttpException) {
			const errorResponse: IHttpError = error.getResponse() as IHttpError
			details = this.stringBuilder.stringify(errorResponse)
		}

		this.logger.error(`[GRPC/ERROR] ${details}`)

		throw new RpcException({
			code: Grpc.Status.INTERNAL,
			details
		})
	}
}
