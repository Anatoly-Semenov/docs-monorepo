import { Metadata } from "@grpc/grpc-js"

import { ExecutionContext, Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { RpcException } from "@nestjs/microservices"
import { AuthGuard } from "@nestjs/passport"

import { GUARD__SYSTEM_ACCOUNT_BASIC } from "@docs/shared/constants/guard.constants"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import { Grpc } from "@docs/shared/types/grpc.types"

@Injectable()
export class GrpcAuthGuard extends AuthGuard(GUARD__SYSTEM_ACCOUNT_BASIC) {
	constructor(private readonly jwtService: JwtService) {
		super()
	}

	private throwException(details: string): void {
		throw new RpcException({
			code: Grpc.Status.UNAUTHENTICATED,
			details
		})
	}

	canActivate(context: ExecutionContext): boolean {
		const metadata = context.getArgByIndex(1) as Metadata
		const request = context.switchToHttp().getRequest()

		const bearerToken: string = (metadata.get("authorization")?.at(0) ??
			"") as string

		if (!bearerToken.toLowerCase().includes("bearer")) {
			this.throwException("Отсутствует ключевое слово Bearer")
		}

		const token: string = bearerToken?.split(" ")?.[1] || ""

		if (!this.jwtService.decode(token)) {
			this.throwException("Не валидный JWT token системы")
		}

		const system: IJwtPayloadSystem =
			this.jwtService.decode<IJwtPayloadSystem>(token)

		// Добавление системы в контекст http-request (context.switchToHttp().getRequest())
		request.system = system

		return !!system
	}
}
