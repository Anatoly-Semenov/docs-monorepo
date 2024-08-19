import { CronProvider } from "./cron/cron.provider"
import { DiadocProvider } from "./diadoc-service/diadoc.provider"
import { DocsProvider } from "./docs-service/docs.provider"
import { ErrorLogsProvider } from "./error-logs-service/error-logs.provider"
import { FilesCleanerProvider } from "./files-service/file-cleaner.provider"
import { FilesDownloadProvider } from "./files-service/files-download.provider"
import { FilesProvider } from "./files-service/files.provider"
import { MdmProvider } from "./mdm-service/mdm.provider"
import { OperatorProvider } from "./operator-service/operator.provider"
import { KafkaProvider } from "@docs/common/kafka-service/kafka.provider"
import { DeleteDocsProvider } from "@docs/storing/services/delete-docs-service/delete-docs.provider"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

type Providers = any[]

const runMode: T_RUN_MODE = process.env.RUN_MODE as T_RUN_MODE

let StoringProvidersList: Providers = []

const BaseProviders: Providers = [
	FilesCleanerProvider,
	DeleteDocsProvider,
	ErrorLogsProvider,
	OperatorProvider,
	DiadocProvider,
	KafkaProvider,
	FilesProvider,
	DocsProvider,
	MdmProvider
]

const CommonProviders: Providers = [
	FilesDownloadProvider,
	FilesCleanerProvider,
	...BaseProviders
]

switch (runMode) {
	case T_RUN_MODE.HTTP:
		StoringProvidersList = CommonProviders
		break
	case T_RUN_MODE.KAFKA:
		StoringProvidersList = BaseProviders
		break
	case T_RUN_MODE.WORKER:
		StoringProvidersList = [...BaseProviders, CronProvider]
		break
	case T_RUN_MODE.GRPC:
		StoringProvidersList = [...CommonProviders]
		break
	/* Может быть undefined при запуске приложения без docker  */
	default:
		StoringProvidersList = CommonProviders
}

export const StoringServicesProviders: Providers = StoringProvidersList
