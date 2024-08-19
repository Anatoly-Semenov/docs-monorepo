import { Inject, Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"

import { BasicStrategy } from "passport-http"

import { AuthService } from "./auth-service/auth.service"

import { GUARD__SERVICE_ACCOUNT_BASIC } from "@docs/shared/constants/guard.constants"
import { IOC__AUTH_SERVICE } from "@docs/shared/constants/ioc.constants"

@Injectable()
export class ServiceAccountStrategy extends PassportStrategy(
	BasicStrategy,
	GUARD__SERVICE_ACCOUNT_BASIC
) {
	constructor(
		@Inject(IOC__AUTH_SERVICE)
		private readonly authService: AuthService
	) {
		super()
	}

	async validate(username: string, password: string): Promise<any> {
		const isValid = this.authService.validateServiceToken(username, password)

		if (!isValid) {
			throw new UnauthorizedException()
		}

		return {
			username,
			password
		}
	}
}
