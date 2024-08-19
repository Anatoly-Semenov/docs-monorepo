import { applyDecorators, Injectable, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

import { GUARD__SERVICE_ACCOUNT_BASIC } from "@docs/shared/constants/guard.constants"

@Injectable()
export class BasicAuthGuardService extends AuthGuard(
	GUARD__SERVICE_ACCOUNT_BASIC
) {}

export const AuthServiceGuard = () =>
	applyDecorators(UseGuards(BasicAuthGuardService))
