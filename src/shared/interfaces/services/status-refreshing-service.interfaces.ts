import { IDiadocStatus, IDiadocStatusExtended } from "./docs-service.interfaces"

import { IDiadocEventData } from "../client/diadoc.interfaces"

export interface IStatusRefreshingService {
	refreshStatuses(): Promise<void>
	processUpdatedStatusData(
		updateStatusDataRaw: IDiadocStatusExtended[]
	): Promise<void>
	saveStatus(updateStatusData: IDiadocStatusExtended): Promise<void>
	sendLastUpdateToKafka(updateStatusData: IDiadocStatusExtended): Promise<void>
	checkDocFlowCompleteFileStatus(primaryStatus: IDiadocStatus): boolean
}

export interface IFetchPaginationEventParams {
	totalCount: number
	data: IDiadocEventData
	fromTicks: string
	toTicks: string
	boxId: string
}
