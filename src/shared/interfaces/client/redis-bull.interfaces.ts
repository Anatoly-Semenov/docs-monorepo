import { JobOptions } from "bull"

import { JobType } from "@docs/shared/enums/redis-bull.enum"

export interface DownloadJobData {
	diadocId?: string
	sourceId?: string
	docId?: string
}

export interface IJobBuilderParams {
	data: DownloadJobData
	jobName: string
	entityName: string
	jobType: JobType
	jobOptions: JobOptions
}
