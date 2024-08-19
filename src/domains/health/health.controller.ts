import { Controller, Get, Inject } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckResult,
	HealthCheckService,
	HttpHealthIndicator,
	MemoryHealthIndicator,
	TypeOrmHealthIndicator
} from "@nestjs/terminus"
import type { HealthIndicatorFunction } from "@nestjs/terminus/dist/health-indicator"

import {
	IOC__COUNTERPARTIES_INDICATOR,
	IOC__ORGANIZATIONS_INDICATOR,
	IOC__REDIS_INDICATOR
} from "@docs/shared/constants/ioc.constants"

import { BytesIn } from "@docs/shared/types/bytes.enum"

import { Health } from "@docs/shared/types"

@Controller("health")
@ApiTags("health")
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,

		private readonly memory: MemoryHealthIndicator,
		private readonly db: TypeOrmHealthIndicator,
		private readonly http: HttpHealthIndicator,
		private readonly disk: DiskHealthIndicator,

		@Inject(IOC__COUNTERPARTIES_INDICATOR)
		private counterpartiesIndicator: Health.Indicator,

		@Inject(IOC__ORGANIZATIONS_INDICATOR)
		private organizationsIndicator: Health.Indicator,

		@Inject(IOC__REDIS_INDICATOR)
		private redisIndicator: Health.Indicator
	) {}

	@Get()
	@HealthCheck()
	check(): Promise<HealthCheckResult> {
		return this.health.check([
			() => this.counterpartiesIndicator.check("counterparties:list"),
			() => this.organizationsIndicator.check("organizations:list"),

			...this.redisIndicator.isHealthy(),
			...this.checkDatabase(),

			...this.checkMemory(),
			...this.checkDisk()
		])
	}

	private checkDatabase(): HealthIndicatorFunction[] {
		return [() => this.db.pingCheck("database")]
	}

	private checkMemory(): HealthIndicatorFunction[] {
		return [
			async () => this.memory.checkHeap("memory:heap", 200 * BytesIn.MEGABYTE),
			async () => this.memory.checkRSS("memory:rss", 3 * BytesIn.GIGABYTE)
		]
	}

	private checkDisk(): HealthIndicatorFunction[] {
		return [
			() =>
				this.disk.checkStorage("storage", {
					path: "/",
					thresholdPercent: 3 * BytesIn.GIGABYTE
				})
		]
	}
}
