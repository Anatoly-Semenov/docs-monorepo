import { Inject, Logger } from "@nestjs/common"
import {
	HealthCheckError,
	HealthIndicator,
	HealthIndicatorResult
} from "@nestjs/terminus"

import { CounterpartyServiceDb } from "@docs/common/db/services/сounterparty-service/counterparty.service"

import { IOC__SERVICE__COUNTERPARTY_DB } from "@docs/shared/constants/ioc.constants"

import { Health } from "@docs/shared/types"

export class CounterpartiesIndicator
	extends HealthIndicator
	implements Health.Indicator
{
	private readonly logger = new Logger(CounterpartiesIndicator.name)

	constructor(
		@Inject(IOC__SERVICE__COUNTERPARTY_DB)
		private readonly counterpartyService: CounterpartyServiceDb
	) {
		super()
	}

	private async countAvailableCounterparties(): Promise<number> {
		try {
			return await this.counterpartyService.count()
		} catch (error) {
			this.logger.error("[Health] Ошибка проверки контрагентов")

			return 0
		}
	}

	public async check(key: string): Promise<HealthIndicatorResult> {
		const countOfCounterparties: number =
			await this.countAvailableCounterparties()

		const isHealthy: boolean = countOfCounterparties > 0

		const result: HealthIndicatorResult = super.getStatus(key, isHealthy, {
			message: `Список контрагентов${isHealthy ? "" : " не"} доступен`,
			count: countOfCounterparties
		})

		if (!isHealthy) {
			throw new HealthCheckError("Список контрагентов недоступен", result)
		}

		return result
	}
}
