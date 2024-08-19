import { ClassProvider } from "@nestjs/common"

import { IOC__COUNTERPARTIES_INDICATOR } from "@docs/shared/constants/ioc.constants"

import { CounterpartiesIndicator } from "./counterparties.health"

export const CounterpartiesHealthProvider: ClassProvider = {
	provide: IOC__COUNTERPARTIES_INDICATOR,
	useClass: CounterpartiesIndicator
}
