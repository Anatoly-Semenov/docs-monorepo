import { Inject, Injectable, Logger, Scope } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { RedisClientService } from "@docs/common/clients/providers/redis/redis-client.service"

import { IBaseRefreshingList } from "@docs/shared/interfaces/services/lists-refreshing.interface"

import { CONFIG__RUN_MODE } from "@docs/shared/constants/config.constants"
import { IOC__SERVICE__CLIENT_PROVIDER_REDIS } from "@docs/shared/constants/ioc.constants"

import { RedisVariables } from "@docs/shared/enums/redis.enum"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

@Injectable({
	scope: Scope.TRANSIENT
})
export class BaseRefreshingService implements IBaseRefreshingList {
	constructor(
		@Inject(IOC__SERVICE__CLIENT_PROVIDER_REDIS)
		private readonly redisClientService: RedisClientService,

		private readonly configService: ConfigService
	) {}

	private logger: Logger = new Logger(BaseRefreshingService.name)

	private async setRedisProcessFlag(
		isProcess: boolean,
		redisFlag: RedisVariables
	): Promise<void> {
		return await this.redisClientService.setFlag(redisFlag, isProcess)
	}

	public async refreshLists(
		refreshFunction: () => Promise<void>,
		redisFlag: RedisVariables,
		listName: string
	): Promise<void> {
		this.logger.log(`Начинаю актуализировать справочники ${listName}`)

		const runMode: T_RUN_MODE =
			this.configService.getOrThrow<T_RUN_MODE>(CONFIG__RUN_MODE)

		// Check by worker mode
		if (runMode !== T_RUN_MODE.WORKER) {
			return
		}

		const isRefreshingInProcess: boolean =
			await this.redisClientService.getFlag(redisFlag)

		if (isRefreshingInProcess) {
			return
		} else {
			this.setRedisProcessFlag(true, redisFlag)
		}

		try {
			refreshFunction()
		} catch (error) {
			this.logger.error(
				`Возникла ошибка при актуализации справочников ${listName}`
			)
		}

		this.setRedisProcessFlag(false, redisFlag)
		this.logger.log(`Закончил актуализировать справочники ${listName}`)
	}
}
