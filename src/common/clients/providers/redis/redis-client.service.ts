import { Redis } from "ioredis"

import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { InjectRedis } from "@nestjs-modules/ioredis"

import { Sentry } from "@docs/shared/decorators/sentry.decorator"

import { RedisFlag, RedisVariables } from "@docs/shared/enums/redis.enum"

@Injectable()
@Sentry
export class RedisClientService {
	constructor(
		private readonly configService: ConfigService,

		@InjectRedis()
		private readonly redis: Redis
	) {}

	private readonly logger = new Logger(RedisClientService.name)

	async setWithCustomTtl(
		key: string,
		value: string,
		ttl: number
	): Promise<void> {
		this.logger.log(`Запись в REDIS: key: ${key} ttl: ${ttl.toString()}`)

		try {
			await this.redis.set(key, value, "EX", ttl)
		} catch (error) {
			const message: string = `Ошибка записи в redis, key=${key}, value=${value}, ttl=${ttl}`

			this.logger.error(message)
			throw new Error(message)
		}
	}

	async setWithTtl(key: RedisVariables, value: string) {
		const croneWorkingTtl: number = +this.configService.getOrThrow<number>(
			"CRON_STATUS_WORKING_TTL"
		)

		return await this.setWithCustomTtl(key, value, croneWorkingTtl)
	}

	async setFlag(key: RedisVariables, value: boolean): Promise<void> {
		return this.setWithTtl(key, value ? RedisFlag.TRUE : RedisFlag.FALSE)
	}

	async getFlag(key: RedisVariables): Promise<boolean> {
		return (await this.get<RedisFlag>(key)) === RedisFlag.TRUE
	}

	async setSimple(key: string, value: string): Promise<void> {
		this.logger.log(`Запись в REDIS: ${key}`)

		try {
			await this.redis.set(key, value)
		} catch (error) {
			const message: string = `Ошибка записи в redis, key=${key}, value=${value}`

			this.logger.error(message)
			throw new Error(message)
		}
	}

	async get<T = string>(key: string): Promise<T> {
		this.logger.log(`Чтение REDIS ${key}`)

		try {
			return (await this.redis.get(key)) as T
		} catch (error) {
			const message: string = `Ошибка чтения redis по key=${key}`

			this.logger.error(message)
			throw new Error(message)
		}
	}
}
