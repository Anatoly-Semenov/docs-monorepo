import * as Sentry from "@sentry/node"
import "@sentry/tracing"

import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import express, { Express } from "express"

import {
	CONFIG__APP_ENV,
	CONFIG__NODE_ENV,
	CONFIG__RUN_MODE,
	CONFIG__SENTRY_DSN,
	CONFIG__SENTRY_VERSION
} from "@docs/shared/constants/config.constants"

import { ISentryService } from "@docs/shared/interfaces/observability.interfaces"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"
import { NodeEnv } from "@docs/shared/types/config.types"

@Injectable()
export class SentryService implements ISentryService {
	private logger = new Logger(SentryService.name)
	private sentryParams = {
		runMode: "",
		dsn: "",
		env: "",
		release: "",
		debug: true
	}
	private sentryInstance: Sentry.Hub

	constructor(private readonly configService: ConfigService) {}

	private composeIntegrationsList(expressInstance?: Express) {
		const integrations: any = [
			new Sentry.Integrations.FunctionToString(),
			new Sentry.Integrations.InboundFilters(),
			new Sentry.Integrations.LocalVariables(),
			new Sentry.Integrations.ContextLines(),
			new Sentry.Integrations.LinkedErrors(),
			new Sentry.Integrations.Postgres(),
			new Sentry.Integrations.Console(),
			new Sentry.Integrations.Context(),
			new Sentry.Integrations.Modules()
		]

		if ((this.sentryParams.runMode as T_RUN_MODE) === "MODE_HTTP") {
			integrations.push(
				new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
				new Sentry.Integrations.OnUnhandledRejection(),
				new Sentry.Integrations.OnUncaughtException(),
				new Sentry.Integrations.Express({
					app: expressInstance
				}),
				new Sentry.Integrations.RequestData(),
				new Sentry.Integrations.Undici()
			)
		}

		return integrations
	}

	private initGrpcSentry() {
		Sentry.init({
			tracesSampleRate: 1.0, // Adjust the sample rate as needed
			integrations: this.composeIntegrationsList(),
			environment: this.sentryParams.env,
			release: this.sentryParams.release,
			debug: this.sentryParams.debug,
			dsn: this.sentryParams.dsn,
			enableTracing: true
		})
	}

	private initHttpSentry(expressInstance: Express) {
		Sentry.init({
			integrations: this.composeIntegrationsList(expressInstance),
			tracesSampleRate: 1.0, // Adjust the sample rate as needed
			environment: this.sentryParams.env,
			release: this.sentryParams.release,
			debug: this.sentryParams.debug,
			dsn: this.sentryParams.dsn,
			enableTracing: true
		})

		expressInstance.use(
			Sentry.Handlers.requestHandler() as express.RequestHandler
		)
		expressInstance.use(Sentry.Handlers.tracingHandler())
		expressInstance.use(
			Sentry.Handlers.errorHandler() as express.ErrorRequestHandler
		)
	}

	private fillSentryParams() {
		this.sentryParams = {
			runMode: this.configService.get<T_RUN_MODE>(CONFIG__RUN_MODE),
			release:
				this.configService.get<string>(CONFIG__SENTRY_VERSION) ??
				`docs-backend@${this.sentryParams.env}`,
			dsn: this.configService.get<string>(CONFIG__SENTRY_DSN),
			env: this.configService.get<string>(CONFIG__APP_ENV),
			debug:
				[NodeEnv.DEV, NodeEnv.LOCAL].includes(
					this.configService.get<NodeEnv>(CONFIG__NODE_ENV)
				) ?? false
		}
	}

	public init(expressInstance?: Express): any {
		this.fillSentryParams()

		switch (this.sentryParams.runMode) {
			case "MODE_GRPC":
				this.initGrpcSentry()
				break
			case "MODE_HTTP":
				this.initHttpSentry(expressInstance)
				break
			default:
				this.initHttpSentry(expressInstance)
				break
		}

		this.sentryInstance = Sentry.getCurrentHub()
	}

	sendExceptionToSentry<T>(exception: T): void {
		this.logger.log("Отправляю ошибку в sentry")
		const exceptionId: string = Sentry.captureException(exception)
		this.logger.log(`Отправил ошибку в sentry с id ${exceptionId}`)
	}

	public get Sentry() {
		return this.sentryInstance
	}
}
