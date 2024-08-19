import { HttpStatusCode } from "axios"

import { Body, Controller, Inject, Post } from "@nestjs/common"
import { ApiResponse, ApiTags } from "@nestjs/swagger"

import { AuthService } from "../../../common/auth/auth-service/auth.service"
import { AuthServiceGuard } from "@docs/common/auth/guards/service-auth.guard"

import { IOC__AUTH_SERVICE } from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_1 } from "@docs/shared/constants/router.constants"

import { JwtResponseDto } from "@docs/shared/dto/common/jwt-response.dto"
import { SystemTokenRequestDto } from "@docs/shared/dto/v1/system-token.dto"

import { IJwtAccessTokenResponse } from "@docs/shared/interfaces/jwt-payload.interface"

@Controller({
	path: "auth",
	version: ROUTER__VERSION_1
})
@ApiTags("Auth")
export class AuthSystemController {
	constructor(
		@Inject(IOC__AUTH_SERVICE)
		private readonly authService: AuthService
	) {}

	@AuthServiceGuard()
	@Post("get-credentials")
	@ApiResponse({
		status: HttpStatusCode.Ok,
		type: JwtResponseDto
	})
	@ApiResponse({
		status: HttpStatusCode.NotFound,
		description: "Ошибка авторизации"
	})
	getTokenForSystem(
		@Body() tokenRequestDto: SystemTokenRequestDto
	): Promise<IJwtAccessTokenResponse> {
		return this.authService.getTokenForSystem(tokenRequestDto)
	}
}
