import { Inject } from "@nestjs/common"
import {
	HealthCheckError,
	HealthIndicator,
	HealthIndicatorResult
} from "@nestjs/terminus"
import { HealthIndicatorFunction } from "@nestjs/terminus/dist/health-indicator"

import { RedisClientService } from "@docs/common/clients/providers/redis/redis-client.service"

import { IOC__SERVICE__CLIENT_PROVIDER_REDIS } from "@docs/shared/constants/ioc.constants"

import { RedisVariables } from "@docs/shared/enums/redis.enum"

import { Health } from "@docs/shared/types"

export class RedisIndicator
	extends HealthIndicator
	implements Health.Indicator
{
	constructor(
		@Inject(IOC__SERVICE__CLIENT_PROVIDER_REDIS)
		private readonly redisClientService: RedisClientService
	) {
		super()
	}

	private async checkKeys(): Promise<HealthIndicatorResult> {
		let isHealthy: boolean = true

		const keysList: string[] = [
			"IS_WORKING_FLAG_EVENTS_PROCESSING",
			"DIADOC_UPDATE_FROM_TICKS"
		]

		for (const key of keysList) {
			const keyResult: string = await this.redisClientService.get(
				RedisVariables[key]
			)

			if (!keyResult) {
				isHealthy = false

				break
			}
		}

		const result: HealthIndicatorResult = super.getStatus(
			"redis-available-keys",
			isHealthy,
			{
				message: "Доступность всех используемых ключей redis"
			}
		)

		if (!isHealthy) {
			throw new HealthCheckError("Список контрагентов недоступен", result)
		}

		return result
	}

	public isHealthy(): HealthIndicatorFunction[] {
		return [async () => await this.checkKeys()]
	}
}
