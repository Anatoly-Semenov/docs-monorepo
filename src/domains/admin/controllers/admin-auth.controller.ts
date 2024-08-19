import { HttpStatusCode } from "axios"

import { Body, Controller, Inject, Post } from "@nestjs/common"
import { ApiResponse, ApiTags } from "@nestjs/swagger"

import { AdminService } from "../admin.service"

import { IOC__ADMIN_SERVICE } from "@docs/shared/constants/ioc.constants"

import { AdminLoginDto } from "../dto/admin-login.dto"
import { AdminRegistrationDto } from "../dto/admin-registration.dto"
import { AdminResponseDto } from "../dto/admin-response.dto"

@Controller("/admin/auth")
@ApiTags("Admin auth")
export class AdminAuthController {
	constructor(
		@Inject(IOC__ADMIN_SERVICE)
		private readonly adminService: AdminService
	) {}

	@Post("/registration")
	@ApiResponse({
		status: HttpStatusCode.Ok,
		type: AdminResponseDto
	})
	@ApiResponse({
		status: HttpStatusCode.InternalServerError,
		description: "Ошибка регистрации"
	})
	async registration(
		@Body() body: AdminRegistrationDto
	): Promise<AdminResponseDto> {
		return await this.adminService.registration(body)
	}

	@Post("/login")
	@ApiResponse({
		status: HttpStatusCode.Ok,
		type: AdminLoginDto
	})
	@ApiResponse({
		status: HttpStatusCode.Unauthorized,
		description: "Ошибка авторизации"
	})
	async login(@Body() body: AdminLoginDto): Promise<AdminResponseDto> {
		return await this.adminService.login(body.username, body.password)
	}
}
