import * as process from "node:process"
import * as winston from "winston"
import * as Transport from "winston-transport"
import { StringBuilder } from "@docs/shared/builders/string.builder"
import { Format } from "logform"
import { utilities as nestWinstonModuleUtilities } from "nest-winston/dist/winston.utilities"
import DailyRotateFile from "winston-daily-rotate-file"
import Sentry from "winston-transport-sentry-node"
import { ConsoleTransportOptions } from "winston/lib/winston/transports"

import { CONFIG__APP_ENV } from "@docs/shared/constants/config.constants"
import { CONFIG__SENTRY_DSN } from "@docs/shared/constants/config.constants"

import { WinstonModuleOptions } from "nest-winston/dist/winston.interfaces"

import { NodeEnv } from "@docs/shared/types/config.types"

export class WinstonOptions {
	private appName: string = "SigningService"
	private transports: Transport[] = []

	constructor() {
		this.initTransports()
	}

	private getProductionFormat(): Format {
		return winston.format.printf(
			({ level, message, label, timestamp, ...meta }) => {
				return new StringBuilder().stringify({
					"@timestamp": timestamp,
					[this.appName]: meta,
					message,
					level,
					label
				})
			}
		)
	}

	private getLocalFormat(): Format {
		return nestWinstonModuleUtilities.format.nestLike(this.appName, {
			prettyPrint: true,
			processId: true,
			appName: true,
			colors: true
		})
	}

	private initConsole(): Transport {
		const isLocalDev: boolean =
			process?.env?.[CONFIG__APP_ENV] === NodeEnv.LOCAL

		/*
			 Локально отображаются красивый формат nest-логов,
			 на боевой сборке логи пишутся в формате объекта
		*/
		const options: ConsoleTransportOptions = {
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.ms(),
				isLocalDev ? this.getLocalFormat() : this.getProductionFormat()
			)
		}

		return new winston.transports.Console(options)
	}

	private initFile(): DailyRotateFile {
		return new DailyRotateFile({
			filename: "logs/application-%DATE%.log",
			format: this.getProductionFormat(),
			datePattern: "YYYY-MM-DD-HH",
			zippedArchive: true,
			maxFiles: "14d",
			maxSize: "20m"
		})
	}

	private initSentry(): Transport {
		const dsn: string = process.env[CONFIG__SENTRY_DSN]

		if (!dsn) {
			console.error(
				`[WinstonOptions]: Не получилось прочитать значение переменной .env ${CONFIG__SENTRY_DSN} при инициализации sentry transport для winston`
			)

			return
		}

		return new Sentry({
			sentry: { dsn },
			level: "info"
		})
	}

	private initTransports(): void {
		// Console
		this.transports.push(this.initConsole())

		// File
		this.transports.push(this.initFile())

		// Sentry
		this.transports.push(this.initSentry())
	}

	public getConfig(): WinstonModuleOptions {
		return {
			transports: this.transports
		}
	}
}
