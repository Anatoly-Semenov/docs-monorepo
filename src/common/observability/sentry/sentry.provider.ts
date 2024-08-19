import { Provider, Scope } from "@nestjs/common"

import { SentryInterceptor } from "@docs/common/observability/sentry/sentry.interceptor"

import { SentryService } from "@docs/common/observability/sentry/sentry.service"

import {
	IOC__INTERCEPTOR__SENTRY,
	IOC__SERVICE__OBSERVABILITY_SENTRY
} from "@docs/shared/constants/ioc.constants"

export const SentryProvider: Provider[] = [
	{
		provide: IOC__INTERCEPTOR__SENTRY,
		useClass: SentryInterceptor,
		scope: Scope.REQUEST
	},
	{
		provide: IOC__SERVICE__OBSERVABILITY_SENTRY,
		useClass: SentryService
	}
]
