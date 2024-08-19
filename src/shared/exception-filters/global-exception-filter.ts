import {
	ArgumentsHost,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger
} from "@nestjs/common"
import { HttpArgumentsHost } from "@nestjs/common/interfaces"
import { ConfigService } from "@nestjs/config"

import { Request, Response } from "express"

import { CONFIG__RUN_MODE } from "@docs/shared/constants/config.constants"

import { ErrorTraceDto } from "@docs/shared/dto/common/error-trace.dto"
import { ErrorDto } from "@docs/shared/dto/common/error.dto"

import { IErrorTraceInterface } from "@docs/shared/interfaces/error/error-trace.interface"
import { IHttpError } from "@docs/shared/interfaces/error/error.interfaces"
import { ISentryService } from "@docs/shared/interfaces/observability.interfaces"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name)

	private runMode: T_RUN_MODE

	constructor(
		private readonly configService: ConfigService,
		private readonly sentryService: ISentryService
	) {
		this.runMode = configService.get<T_RUN_MODE>(CONFIG__RUN_MODE)
	}

	sendExceptionResponse<T>(
		exception: T,
		request: Request,
		response: Response
	): void {
		const parentSpanId = request.headers["parent-span-id"] as string
		const traceId = request.headers["trace-id"] as string
		const spanId = request.headers["trace-id"] as string

		const trace: IErrorTraceInterface = new ErrorTraceDto({
			parentSpanId,
			traceId,
			spanId
		})

		let errorResponse: ErrorDto
		let status: number

		this.logger.error(
			`Error | ${JSON.stringify({
				trace_id: request.headers["trace-id"],
				exception: exception.toString()
			})}`
		)

		if (exception instanceof HttpException) {
			status = exception.getStatus()
			const rawMessage: IHttpError = exception.getResponse() as IHttpError

			errorResponse = new ErrorDto({
				timestamp: new Date().toISOString(),
				message: rawMessage.message,
				error: rawMessage.error,
				statusCode: status,
				path: request.url,
				trace
			})
		} else {
			status = HttpStatus.INTERNAL_SERVER_ERROR

			errorResponse = new ErrorDto({
				timestamp: new Date().toISOString(),
				message: "Internal server error",
				error: "Internal server error",
				statusCode: status,
				path: request.url,
				trace
			})
		}

		this.logger.error(`Response error | ${JSON.stringify(errorResponse)}`)

		response.status(status).json(new ErrorDto(errorResponse))
	}

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx: HttpArgumentsHost = host.switchToHttp()

		const response: Response = ctx.getResponse<Response>()
		const request: Request = ctx.getRequest<Request>()

		const isAdmin: boolean = request.path.includes("/admin")
		const isAdminAuth: boolean = request.path.includes("/admin/auth")

		if (!isAdmin || isAdminAuth) {
			this.sentryService.sendExceptionToSentry(exception)

			if (this.runMode === T_RUN_MODE.HTTP) {
				this.sendExceptionResponse<unknown>(exception, request, response)
			}
		}
	}
}
