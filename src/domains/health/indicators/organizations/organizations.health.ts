import { Inject, Logger } from "@nestjs/common"
import {
	HealthCheckError,
	HealthIndicator,
	HealthIndicatorResult
} from "@nestjs/terminus"

import { OrganizationServiceDb } from "@docs/common/db/services/organizations/organization.service"

import { IOC__SERVICE__ORGANIZATION_DB } from "@docs/shared/constants/ioc.constants"

import { Health } from "@docs/shared/types"

export class OrganizationsIndicator
	extends HealthIndicator
	implements Health.Indicator
{
	private readonly logger = new Logger(OrganizationsIndicator.name)

	constructor(
		@Inject(IOC__SERVICE__ORGANIZATION_DB)
		private readonly organizationServiceDb: OrganizationServiceDb
	) {
		super()
	}

	private async countAvailableOrganizations(): Promise<number> {
		try {
			return await this.organizationServiceDb.count()
		} catch (error) {
			this.logger.error("[Health] Ошибка проверки организаций")

			return 0
		}
	}

	public async check(key: string): Promise<HealthIndicatorResult> {
		const countOfOrganizations: number =
			await this.countAvailableOrganizations()

		const isHealthy: boolean = countOfOrganizations > 0

		const result: HealthIndicatorResult = super.getStatus(key, isHealthy, {
			message: `Список организаций${isHealthy ? "" : " не"} доступен`,
			count: countOfOrganizations
		})

		if (!isHealthy) {
			throw new HealthCheckError("Список организаций недоступен", result)
		}

		return result
	}
}
