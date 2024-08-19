import { ClassProvider } from "@nestjs/common"

import { OperatorService } from "./operator.service"

import { IOC__SERVICE__OPERATORS } from "@docs/shared/constants/ioc.constants"

export const OperatorProvider: ClassProvider = {
	provide: IOC__SERVICE__OPERATORS,
	useClass: OperatorService
}
