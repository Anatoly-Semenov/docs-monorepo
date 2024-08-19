import { IsUUID } from "class-validator"

import { IErrorTraceInterface } from "@docs/shared/interfaces/error/error-trace.interface"

export class ErrorTraceDto {
	@IsUUID()
	parentSpanId: IErrorTraceInterface["parentSpanId"]

	@IsUUID()
	traceId: IErrorTraceInterface["traceId"]

	@IsUUID()
	spanId: IErrorTraceInterface["spanId"]

	constructor(fields?: Partial<ErrorTraceDto>) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
