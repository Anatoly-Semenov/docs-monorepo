import * as process from "node:process"
import fs from "fs"
import { addReflectionToGrpcConfig } from "nestjs-grpc-reflection"
import { resolve } from "path"

import "@sentry/tracing"

import { ServerCredentials, status } from "@grpc/grpc-js"

import { INestMicroservice, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import {
	GrpcOptions,
	MicroserviceOptions,
	Transport
} from "@nestjs/microservices"

import {
	CONFIG__GRPC_CA_CERT_FILE,
	CONFIG__GRPC_CERT_FILE,
	CONFIG__GRPC_HOST,
	CONFIG__GRPC_IS_SECURED,
	CONFIG__GRPC_KEY_FILE,
	CONFIG__GRPC_LOADER,
	CONFIG__GRPC_PACKAGE,
	CONFIG__GRPC_PORT,
	CONFIG__GRPC_PROTO_PATH
} from "@docs/shared/constants/config.constants"
import { IOC__SERVICE__OBSERVABILITY_SENTRY } from "@docs/shared/constants/ioc.constants"

import { IBootstrapProduct } from "@docs/shared/interfaces/bootstrap.interfaces"
import { ISentryService } from "@docs/shared/interfaces/observability.interfaces"

interface Options {
	protoPackage: string
	isSecured: boolean
	caCertFile: string
	protoPath: string
	certFile: string
	keyFile: string
	loader: string
	host: string
	port: string
}

export class BootstrapGrpcProduct implements IBootstrapProduct {
	private setupCredentials({
		keyFile,
		certFile,
		caCertFile
	}: {
		keyFile: string
		certFile: string
		caCertFile: string
	}) {
		return ServerCredentials.createSsl(fs.readFileSync(caCertFile), [
			{
				private_key: fs.readFileSync(keyFile),
				cert_chain: fs.readFileSync(certFile)
			}
		])
	}

	private setupSentry(app: INestMicroservice): ISentryService {
		const sentryService: ISentryService = app.get(
			IOC__SERVICE__OBSERVABILITY_SENTRY
		)

		sentryService.init()

		return sentryService
	}

	private getOptionsOrThrow(): Options {
		function getEnv(name: string): string {
			const value: string = process.env[name]

			if (!value) {
				throw new Error(`Не определено значение переменной ${name}`)
			}

			return value
		}

		let caCertFile: string = ""
		let certFile: string = ""
		let keyFile: string = ""

		const isSecured: boolean = getEnv(CONFIG__GRPC_IS_SECURED) === "true"
		const protoPath: string = getEnv(CONFIG__GRPC_PROTO_PATH)
		const protoPackage: string = getEnv(CONFIG__GRPC_PACKAGE)
		const loader: string = getEnv(CONFIG__GRPC_LOADER)
		const host: string = getEnv(CONFIG__GRPC_HOST)
		const port: string = getEnv(CONFIG__GRPC_PORT)

		if (isSecured) {
			caCertFile = getEnv(CONFIG__GRPC_CA_CERT_FILE)
			certFile = getEnv(CONFIG__GRPC_CERT_FILE)
			keyFile = getEnv(CONFIG__GRPC_KEY_FILE)
		}

		return {
			protoPackage,
			caCertFile,
			protoPath,
			isSecured,
			certFile,
			keyFile,
			loader,
			host,
			port
		}
	}

	public getGrpcOptions(isReflection: boolean = true): GrpcOptions {
		const {
			host,
			port,
			loader,
			keyFile,
			certFile,
			protoPath,
			isSecured,
			caCertFile,
			protoPackage
		}: Options = this.getOptionsOrThrow()

		const processRoot: string = process.cwd()

		const config: GrpcOptions = {
			transport: Transport.GRPC,
			options: {
				package: protoPackage,
				protoPath: resolve(processRoot, `node_modules/${protoPath}`),

				url: `${host}:${port}`,

				loader: {
					includeDirs: [resolve(processRoot, `node_modules/${loader}`)],
					keepCase: false,
					enums: String,
					longs: Number
				},

				credentials: isSecured
					? this.setupCredentials({
							caCertFile,
							certFile,
							keyFile
						})
					: false
			}
		}

		return isReflection ? addReflectionToGrpcConfig(config) : config
	}

	public async bootstrap(appModule: any): Promise<void> {
		const app: INestMicroservice =
			await NestFactory.createMicroservice<MicroserviceOptions>(
				appModule,
				this.getGrpcOptions()
			)

		this.setupSentry(app)

		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				transform: true,
				transformOptions: { enableImplicitConversion: true }
			})
		)

		return app.listen()
	}
}
