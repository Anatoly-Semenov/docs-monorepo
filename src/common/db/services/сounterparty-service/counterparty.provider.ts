import { ClassProvider } from "@nestjs/common"

import { CounterpartyServiceDb } from "./counterparty.service"

import { IOC__SERVICE__COUNTERPARTY_DB } from "@docs/shared/constants/ioc.constants"

export const CounterpartyProviderDb: ClassProvider = {
	provide: IOC__SERVICE__COUNTERPARTY_DB,
	useClass: CounterpartyServiceDb
}
