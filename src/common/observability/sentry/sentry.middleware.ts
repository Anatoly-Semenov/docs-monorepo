import { v4 } from "uuid"

import { Injectable, NestMiddleware } from "@nestjs/common"

import { NextFunction, Request, Response } from "express"

type Header = string | string[]

@Injectable()
export class SentryMiddleware implements NestMiddleware {
	public use(): (req: Request, res: Response, next: NextFunction) => void {
		const _this = this

		return (req, res, next) => {
			const url: string = req.url

			const parentSpanId: Header =
				req.headers["span-id"] ||
				req.headers["sentry-span-id"] ||
				req.headers["parent-span-id"] ||
				""

			let traceId: Header =
				req.headers["trace"] ||
				req.headers["trace-id"] ||
				req.headers["sentry-trace"] ||
				""

			const spanId: string = v4()

			if (!traceId) {
				const id: string = v4()

				req.headers["trace-id"] = id
				traceId = id
			}

			req.headers["span-id"] = spanId

			_this.sendTransactionToSentry({
				parentSpanId,
				traceId,
				spanId,
				url
			})

			next()
		}
	}

	private sendTransactionToSentry({
		parentSpanId,
		traceId,
		spanId,
		url
	}: {
		[key: string]: Header
	}): void {
		// Todo: Send transaction to sentry
	}
}
