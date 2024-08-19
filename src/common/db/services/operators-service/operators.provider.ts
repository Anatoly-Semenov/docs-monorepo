import { ClassProvider } from "@nestjs/common"

import { OperatorServiceDb } from "./operators.service"

import { IOC__SERVICE__ROAMING_OPERATORS_DB } from "@docs/shared/constants/ioc.constants"

export const OperatorProviderDb: ClassProvider = {
	provide: IOC__SERVICE__ROAMING_OPERATORS_DB,
	useClass: OperatorServiceDb
}
