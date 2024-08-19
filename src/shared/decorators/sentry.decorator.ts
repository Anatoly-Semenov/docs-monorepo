import * as SentryNode from "@sentry/node"

import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

import { DecorateAll } from "@docs/shared/decorators/decorate-all"

interface ITransactionParams {
	name: string
}

type ClassDecorator = <TFunction extends Function>(
	target: TFunction
) => TFunction | void

export const TransactionParams = Reflector.createDecorator<ITransactionParams>()

export const SentryTransaction = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		return ctx.switchToRpc().getContext().sentry?.transaction
	}
)

function sendExceptionToSentry<T>(logger: Logger, exception: T): void {
	if (logger) logger.log("Отправляю ошибку в sentry")
	const exceptionId: string = SentryNode.captureException(exception)
	if (logger) logger.log(`Отправил ошибку в sentry с id ${exceptionId}`)
}

export const SentryMethod = (bubble = true): MethodDecorator => {
	return (target, _, propertyDescriptor: PropertyDescriptor) => {
		const originalMethod = propertyDescriptor.value

		switch (originalMethod?.constructor?.name) {
			case "AsyncFunction":
				propertyDescriptor.value = async function (...args: any[]) {
					try {
						return await originalMethod.apply(this, args)
					} catch (exception) {
						sendExceptionToSentry(this.logger, exception)
						if (bubble) {
							throw exception
						}
					}
				}
				break

			case "Function":
				propertyDescriptor.value = function (...args: any[]) {
					try {
						return originalMethod.apply(this, args)
					} catch (exception) {
						sendExceptionToSentry(this.logger, exception)
						if (bubble) {
							throw exception
						}
					}
				}
				break

			default:
				break
		}
	}
}

export const Sentry: ClassDecorator = DecorateAll(SentryMethod())
