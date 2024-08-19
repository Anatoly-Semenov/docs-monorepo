import { CronProvider } from "./crone/cron.provider"
import { DiadocRefreshingProvider } from "./diadoc-refreshing-service/diadoc-refreshing.provider"
import { FilesProcessingProvider } from "./files-processing-service/files-processing.provider"
import { StatusRefreshingProvider } from "./status-refreshing-service/status-refreshing.provider"
import { WorkerProvider } from "./worker-service/worker.provider"
import { BaseRefreshingProvider } from "@docs/common/base-refreshing/base-refreshing.provider"
import { KafkaProvider } from "@docs/common/kafka-service/kafka.provider"
import { MdmRefreshingProvider } from "@docs/signing/services/mdm-refreshing-service/mdm-refreshing.provider"
import { DeleteDocsProvider } from "@docs/storing/services/delete-docs-service/delete-docs.provider"
import { DiadocProvider } from "@docs/storing/services/diadoc-service/diadoc.provider"
import { DocsProvider } from "@docs/storing/services/docs-service/docs.provider"
import { ErrorLogsProvider } from "@docs/storing/services/error-logs-service/error-logs.provider"
import { FilesProvider } from "@docs/storing/services/files-service/files.provider"
import { MdmProvider } from "@docs/storing/services/mdm-service/mdm.provider"
import { OperatorProvider } from "@docs/storing/services/operator-service/operator.provider"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

import { DownloaderProcessor } from "../processors/downloader.processor"
import { WorkerProcessor } from "../processors/worker.processor"

const runMode: T_RUN_MODE = process.env.RUN_MODE as T_RUN_MODE

type Exports = any[]

let SigningExportsList: Exports = []

const CommonProviders: Exports = [
	BaseRefreshingProvider,
	DeleteDocsProvider,
	ErrorLogsProvider,
	OperatorProvider,
	DiadocProvider,
	FilesProvider,
	KafkaProvider,
	DocsProvider,
	MdmProvider
]

switch (runMode) {
	case T_RUN_MODE.HTTP:
		SigningExportsList = CommonProviders
		break
	case T_RUN_MODE.WORKER:
		SigningExportsList = [
			...CommonProviders,
			StatusRefreshingProvider,
			DiadocRefreshingProvider,
			FilesProcessingProvider,
			FilesProcessingProvider,
			MdmRefreshingProvider,
			DownloaderProcessor,
			WorkerProcessor,
			WorkerProvider,
			CronProvider
		]
		break
	case T_RUN_MODE.KAFKA:
		SigningExportsList = CommonProviders
		break
	case T_RUN_MODE.GRPC:
		SigningExportsList = [...CommonProviders]
		break
	/* Может быть undefined при запуске приложения без docker  */
	default:
		SigningExportsList = CommonProviders
}

export const SigningServicesExport: Exports = SigningExportsList
