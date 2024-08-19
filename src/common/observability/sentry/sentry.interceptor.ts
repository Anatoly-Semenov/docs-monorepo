import { Observable, tap } from "rxjs"
import { v4 } from "uuid"

import * as Sentry from "@sentry/node"

import { Metadata } from "@grpc/grpc-js"

import {
	CallHandler,
	ExecutionContext,
	Inject,
	Injectable,
	Logger,
	NestInterceptor
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"

import { SENTRY__HEADER_NAME } from "@docs/common/observability/sentry/sentry.constants"
import { IOC__SERVICE__OBSERVABILITY_SENTRY } from "@docs/shared/constants/ioc.constants"

import { TransactionParams } from "@docs/shared/decorators/sentry.decorator"

import { ISentryService } from "@docs/shared/interfaces/observability.interfaces"

@Injectable()
export class SentryInterceptor implements NestInterceptor {
	private readonly logger = new Logger(SentryInterceptor.name)

	constructor(
		private readonly reflector: Reflector,
		@Inject(IOC__SERVICE__OBSERVABILITY_SENTRY)
		private readonly sentryService: ISentryService
	) {}

	private getTrace(context: ExecutionContext) {
		switch (context.getType()) {
			case "rpc":
				const metadata = context.getArgByIndex(1) as Metadata
				return {
					traceId: metadata.get(SENTRY__HEADER_NAME).at(0) as string,
					transport: "gRPC",
					headers: JSON.parse(JSON.stringify(metadata.getMap())),
					op: "grpc.server"
				}
			case "http":
			default:
				// TODO: custom HTTP instrumentation
				return {
					traceId: "",
					transport: "HTTP"
				}
		}
	}

	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<any> | Promise<Observable<any>> {
		this.logger.log("Получен запрос. Инициирую транзакцию")

		const trace = this.getTrace(context)
		const transactionParams = this.reflector.get(
			TransactionParams,
			context.getHandler()
		)

		const traceData: Pick<
			Sentry.Transaction,
			| "name"
			| "traceId"
			| "startTimestamp"
			| "tags"
			| "metadata"
			| "op"
			| "origin"
		> = {
			traceId: trace.traceId ?? v4(),
			op: trace.op,
			name: transactionParams.name,
			startTimestamp: Date.now(),
			metadata: {
				source: "custom",
				request: {
					headers: trace.headers,
					protocol: trace.transport
				},
				spanMetadata: {}
			},
			tags: {
				transport: trace.transport
			}
		}

		const transaction = this.sentryService.Sentry.startTransaction(traceData)

		context.switchToRpc().getContext().sentry = {
			transaction
		}

		return next.handle().pipe(
			tap(() => {
				this.logger.log(
					`Завершаю транзакцию - внутренняя логика была выполнена`
				)
				transaction.finish(Date.now())
			})
		)
	}
}
