import compression from "compression"

import "@sentry/tracing"

import { INestMicroservice } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"

import express, { Express } from "express"

import { IOC__SERVICE__OBSERVABILITY_SENTRY } from "@docs/shared/constants/ioc.constants"

import { IBootstrapProduct } from "@docs/shared/interfaces/bootstrap.interfaces"
import { ISentryService } from "@docs/shared/interfaces/observability.interfaces"

export class BootstrapWorkerProduct implements IBootstrapProduct {
	private setupObservability(expressInstance: Express, app: INestMicroservice) {
		const sentryService: ISentryService = app.get(
			IOC__SERVICE__OBSERVABILITY_SENTRY
		)

		sentryService.init(expressInstance)
	}

	private setupCompression(expressInstance: Express) {
		expressInstance.use(compression())
	}

	async bootstrap(appModule: any): Promise<void> {
		const expressInstance = express()

		const app = await NestFactory.createMicroservice(appModule)

		this.setupObservability(expressInstance, app)
		this.setupCompression(expressInstance)

		return app.listen()
	}
}
