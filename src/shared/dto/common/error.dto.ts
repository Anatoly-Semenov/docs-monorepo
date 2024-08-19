import { HttpStatus } from "@nestjs/common"

import { IsNotEmpty, IsNumber, IsString } from "class-validator"

import { ErrorTraceDto } from "./error-trace.dto"

export class ErrorDto {
	@IsNumber()
	statusCode: HttpStatus

	message: string | object

	@IsString()
	error: string

	@IsString()
	timestamp: string

	@IsString()
	path: string

	@IsNotEmpty()
	trace: ErrorTraceDto

	constructor(fields?: Partial<ErrorDto>) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
