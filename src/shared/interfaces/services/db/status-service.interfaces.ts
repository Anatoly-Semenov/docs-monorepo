import { IDiadocStatus } from "@docs/shared/interfaces/services/docs-service.interfaces"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"
import { Status } from "@docs/common/db/entities/status.entity"

import { StatusDto } from "@docs/shared/dto/v1/db-dto/status.dto"

export interface IStatusServiceDb {
	create(statusDto: StatusDto): Promise<Status>
	getBySeverity(severity: string): Promise<Status>
	saveInstance(statusInstance: Status): Promise<Status>
	bulkSaveInstance(statusInstances: Status[]): Promise<Status[]>
	processNewStatus(
		newPrimaryStatus: IDiadocStatus,
		instance: Docs | Files
	): Promise<Status>
}

interface ICommonStatusFields {
	name: string
	severity: string
	service_status?: string
	mapped_status?: string
}

export interface IStatusForUpdating extends ICommonStatusFields {
	primaryStatus: boolean
	fileInstance?: Files
	docInstance?: Docs
}

export interface IStatusForUpdatingEntity extends ICommonStatusFields {
	primary_status: boolean
	is_active: boolean
	doc?: Docs
	files?: Files
}
