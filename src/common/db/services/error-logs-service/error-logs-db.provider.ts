import { ClassProvider } from "@nestjs/common"

import { ErrorLogsServiceDb } from "./error-logs-db.service"

import { IOC__SERVICE__ERROR_LOGS_DB } from "@docs/shared/constants/ioc.constants"

export const ErrorLogsDbProvider: ClassProvider = {
	provide: IOC__SERVICE__ERROR_LOGS_DB,
	useClass: ErrorLogsServiceDb
}
