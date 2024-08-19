import { S3ClientProvider } from "@docs/common/clients/providers/s3/s3-client-provider"
import { SentryProvider } from "@docs/common/observability/sentry/sentry.provider"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

const runMode: T_RUN_MODE = process.env.RUN_MODE as T_RUN_MODE

type Exports = any[]

let ObservabilityProvidersList: Exports = []

const CommonProviders: Exports = [...SentryProvider, S3ClientProvider]

switch (runMode) {
	case T_RUN_MODE.HTTP:
		ObservabilityProvidersList = CommonProviders
		break
	case T_RUN_MODE.WORKER:
		ObservabilityProvidersList = [...CommonProviders]
		break
	case T_RUN_MODE.GRPC:
		ObservabilityProvidersList = [...CommonProviders]
		break
	/* Может быть undefined при запуске приложения без docker  */
	default:
		ObservabilityProvidersList = CommonProviders
}

export const ObservabilityProviders: Exports = ObservabilityProvidersList
