import { ClassProvider } from "@nestjs/common"

import { ErrorLogsService } from "./error-logs.service"

import { IOC__SERVICE__ERROR_LOGS } from "@docs/shared/constants/ioc.constants"

export const ErrorLogsProvider: ClassProvider = {
	provide: IOC__SERVICE__ERROR_LOGS,
	useClass: ErrorLogsService
}
