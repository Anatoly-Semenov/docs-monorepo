import { AuthSystemGuardGrpc } from "@docs/common/auth/guards/system-auth.guard"

import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"

import { ROUTER__VERSION_2 } from "@docs/shared/constants/router.constants"

import { GrpcResponseDto } from "@docs/shared/dto/v1/grpc"

import { Grpc } from "@docs/shared/types/grpc.types"

@Controller({
	version: ROUTER__VERSION_2
})
@AuthSystemGuardGrpc()
export class EmployeesGrpcController {
	private readonly logger: Logger = new Logger(EmployeesGrpcController.name)

	private readonly unavailableResponse: GrpcResponseDto = new GrpcResponseDto({
		message: "Данный функционал недоступен",
		code: Grpc.Status.UNAVAILABLE,
		signId: ""
	})

	@GrpcMethod("SigningService", "GetEmployees")
	async getEmployeesHandler() {
		this.logger.log(
			"Получен GRPC-запрос на недоступный функционал Get Employees"
		)
		return this.unavailableResponse
	}

	@GrpcMethod("SigningSerive", "PostEmployees")
	async postEmployeesHandler() {
		this.logger.log(
			"Получен GRPC-запрос на недоступный фунционал Post Employees"
		)
		return this.unavailableResponse
	}
}
