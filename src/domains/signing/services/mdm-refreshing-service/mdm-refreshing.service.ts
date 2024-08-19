import { Inject, Injectable, Logger } from "@nestjs/common"

import { BaseRefreshingService } from "@docs/common/base-refreshing/base-refreshing.service"
import { IRefreshingLists } from "@docs/shared/interfaces/services/lists-refreshing.interface"
import { MdmService } from "@docs/storing/services/mdm-service/mdm.service"

import {
	IOC__BASE_REFRESHING_SERVICE,
	IOC__SERVICE__MDM
} from "@docs/shared/constants/ioc.constants"

import { ListNameEnum } from "@docs/shared/enums/lists-name.enum"
import { RedisVariables } from "@docs/shared/enums/redis.enum"

@Injectable()
export class MdmRefreshingService implements IRefreshingLists {
	constructor(
		@Inject(IOC__SERVICE__MDM)
		private readonly mdmService: MdmService,

		@Inject(IOC__BASE_REFRESHING_SERVICE)
		private readonly baseRefreshingService: BaseRefreshingService
	) {}

	private logger = new Logger(MdmRefreshingService.name)

	private async preloadAllMdmData(): Promise<void> {
		this.logger.log(
			`Начинаю загрузку справочников МДМ (Организации, контрагенты)`
		)

		try {
			await Promise.all([
				this.mdmService.loadOrganizations(),
				this.mdmService.loadCounterparties()
			])
		} catch (error) {
			this.logger.error(`Ошибка загрузки справочников МДМ - ${error.message}`)
		}
	}

	public async refreshLists(): Promise<void> {
		this.baseRefreshingService.refreshLists(
			this.preloadAllMdmData.bind(this),
			RedisVariables.IS_REFRESHING_MDM_LISTS_IN_PROCESS,
			ListNameEnum.MDM
		)
	}
}
