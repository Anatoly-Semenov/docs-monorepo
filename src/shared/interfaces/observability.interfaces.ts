import * as Sentry from "@sentry/node"

import { Express } from "express"

export interface ISentryService {
	sendExceptionToSentry<T>(exception: T): void
	init(expressInstance?: Express): void
	get Sentry(): Sentry.Hub
}
