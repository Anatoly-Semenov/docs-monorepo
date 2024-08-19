import * as process from "process"

import { Inject, Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

import { StatusRefreshingService } from "../status-refreshing-service/status-refreshing.service"
import { ICronSigningService } from "@docs/shared/interfaces/services/cron-service.interfaces"
import { IRefreshingLists } from "@docs/shared/interfaces/services/lists-refreshing.interface"

import {
	IOC__DIADOC_REFRESHING_SERVICE,
	IOC__MDM_REFRESHING_SERVICE,
	IOC__STATUS_REFRESHING_SERVICE
} from "@docs/shared/constants/ioc.constants"

@Injectable()
export class CronSigningService implements ICronSigningService {
	constructor(
		@Inject(IOC__STATUS_REFRESHING_SERVICE)
		private readonly statusRefreshingService: StatusRefreshingService,

		@Inject(IOC__MDM_REFRESHING_SERVICE)
		private readonly mdmRefreshingService: IRefreshingLists,

		@Inject(IOC__DIADOC_REFRESHING_SERVICE)
		private readonly diadocRefreshingService: IRefreshingLists
	) {}

	private readonly logger = new Logger(CronSigningService.name)

	@Cron(process.env.CRON_PERIOD)
	async handleStatusRefreshing(): Promise<void> {
		this.logger.log("Выполняется CRON-задача status refreshing")
		await this.statusRefreshingService.refreshStatuses()
	}

	@Cron(
		process.env.CRON_PERIOD_REFRESH_LISTS || CronExpression.EVERY_DAY_AT_1AM
	)
	async refreshLists(): Promise<void> {
		this.logger.log("Выполняется CRON-задача обновления справочников")
		await Promise.all([
			await this.mdmRefreshingService.refreshLists(),
			await this.diadocRefreshingService.refreshLists()
		])
	}
}
