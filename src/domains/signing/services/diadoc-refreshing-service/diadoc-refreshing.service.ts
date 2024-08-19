import { Inject, Logger } from "@nestjs/common"

import { BaseRefreshingService } from "@docs/common/base-refreshing/base-refreshing.service"
import { IRefreshingLists } from "@docs/shared/interfaces/services/lists-refreshing.interface"
import { DiadocService } from "@docs/storing/services/diadoc-service/diadoc.service"
import { OperatorService } from "@docs/storing/services/operator-service/operator.service"

import {
	IOC__BASE_REFRESHING_SERVICE,
	IOC__SERVICE__DIADOC,
	IOC__SERVICE__OPERATORS
} from "@docs/shared/constants/ioc.constants"

import { ListNameEnum } from "@docs/shared/enums/lists-name.enum"
import { RedisVariables } from "@docs/shared/enums/redis.enum"

export class DiadocRefreshingService implements IRefreshingLists {
	constructor(
		@Inject(IOC__BASE_REFRESHING_SERVICE)
		private readonly baseRefreshingService: BaseRefreshingService,

		@Inject(IOC__SERVICE__OPERATORS)
		private readonly operatorService: OperatorService,

		@Inject(IOC__SERVICE__DIADOC)
		private readonly diadocService: DiadocService
	) {}

	private logger: Logger = new Logger(DiadocRefreshingService.name)

	private async preloadAllDiadocData(): Promise<void> {
		this.logger.log(
			`Начинаю загрузку справочников Diadoc (данные о роуминговых операторах)`
		)

		try {
			await this.operatorService.loadRoamingOperators()
			await this.diadocService.loadOrganizationFeaturesPaginated()
		} catch (e) {
			this.logger.error(`Ошибка загрузки справочников Diadoc - ${e.message}`)
		}
	}

	public async refreshLists(): Promise<void> {
		this.baseRefreshingService.refreshLists(
			this.preloadAllDiadocData.bind(this),
			RedisVariables.IS_REFRESHING_DIADOC_LISTS_IN_PROCESS,
			ListNameEnum.DIADOC
		)
	}
}
