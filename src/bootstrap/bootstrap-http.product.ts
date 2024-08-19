import { WinstonOptions } from "@docs/shared/config/winston-options.config"
import compression from "compression"
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from "nest-winston"

import "@sentry/tracing"

import {
	INestApplication,
	ValidationPipe,
	VersioningType
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import { ExpressAdapter } from "@nestjs/platform-express"
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger"

import express, { Express } from "express"

import { SentryMiddleware } from "@docs/common/observability/sentry/sentry.middleware"

import { GlobalExceptionFilter } from "@docs/shared/exception-filters/global-exception-filter"

import { IOC__SERVICE__OBSERVABILITY_SENTRY } from "@docs/shared/constants/ioc.constants"

import { IBootstrapProduct } from "@docs/shared/interfaces/bootstrap.interfaces"
import { ISentryService } from "@docs/shared/interfaces/observability.interfaces"

export class BootstrapHttpProduct implements IBootstrapProduct {
	private setupSentry(
		expressInstance: Express,
		app: INestApplication
	): ISentryService {
		const sentryService: ISentryService = app.get(
			IOC__SERVICE__OBSERVABILITY_SENTRY
		)

		sentryService.init(expressInstance)

		return sentryService
	}

	private setupCompression(expressInstance: Express) {
		expressInstance.use(compression())
	}

	private initSwagger(app: INestApplication<any>): void {
		const config = new DocumentBuilder()
			.addBearerAuth()
			.setTitle("Сервис подписания REST API")
			.setDescription(
				"Спецификация синхронного обмена данными систем-источников через REST API с Сервисом подписания"
			)
			.setVersion("2.0")
			.build()

		const document: OpenAPIObject = SwaggerModule.createDocument(app, config)
		SwaggerModule.setup("swagger", app, document)
	}

	async bootstrap(appModule: any): Promise<void> {
		const expressInstance = express()

		const app: INestApplication<any> = await NestFactory.create(appModule, {
			...new ExpressAdapter(expressInstance),
			logger: WinstonModule.createLogger(new WinstonOptions().getConfig())
		})

		this.setupCompression(expressInstance)
		const sentryService: ISentryService = this.setupSentry(expressInstance, app)

		app.useGlobalFilters(
			new GlobalExceptionFilter(app.get(ConfigService), sentryService)
		)
		app.enableShutdownHooks()
		app.useGlobalPipes(new ValidationPipe())
		app.enableVersioning({
			type: VersioningType.URI
		})

		app.use(new SentryMiddleware().use())
		app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))

		this.initSwagger(app)

		return app.listen(3000, "0.0.0.0")
	}
}
