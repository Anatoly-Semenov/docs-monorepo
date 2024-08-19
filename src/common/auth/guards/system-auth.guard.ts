import { GrpcAuthGuard } from "@docs/common/auth/guards/grpc-auth.guard"

import {
	applyDecorators,
	createParamDecorator,
	ExecutionContext,
	Injectable,
	UseGuards
} from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

import { GUARD__SYSTEM_ACCOUNT_BASIC } from "@docs/shared/constants/guard.constants"

@Injectable()
export class JwtAuthGuardSystem extends AuthGuard(
	GUARD__SYSTEM_ACCOUNT_BASIC
) {}

export const AuthSystemGuard = () =>
	applyDecorators(UseGuards(JwtAuthGuardSystem))

export const AuthSystemGuardGrpc = () =>
	applyDecorators(UseGuards(GrpcAuthGuard))

export const SystemPayload = createParamDecorator(
	(_: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()

		return request.user
	}
)
