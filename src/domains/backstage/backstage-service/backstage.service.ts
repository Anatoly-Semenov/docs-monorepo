import { Inject, Injectable, Logger } from "@nestjs/common"

import { RedisClientService } from "@docs/common/clients/providers/redis/redis-client.service"

import { IOC__SERVICE__CLIENT_PROVIDER_REDIS } from "@docs/shared/constants/ioc.constants"

@Injectable()
export class BackstageService {
	constructor(
		@Inject(IOC__SERVICE__CLIENT_PROVIDER_REDIS)
		private readonly redisClient: RedisClientService
	) {}

	private readonly logger = new Logger(BackstageService.name)

	async setRedis(key: string, value: string, ttl?: number): Promise<string> {
		if (ttl) {
			this.logger.log(
				`Backstage установка значения redis key=${key} ttl=${ttl}`
			)
			await this.redisClient.setWithCustomTtl(key, value, ttl)
		} else {
			this.logger.log(`Backstage установка значения redis key=${key}`)
			await this.redisClient.setSimple(key, value)
		}

		this.logger.log("Backstage установка значения redis выполнена успешно")
		return "Новое значение установлено"
	}

	async getRedisValue(key: string): Promise<string> {
		this.logger.log(`Backstage считывание значения redis key=${key}`)
		return this.redisClient.get(key)
	}
}
