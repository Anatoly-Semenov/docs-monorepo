import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod
} from "@nestjs/common"

import { LogsMiddleware } from "@docs/common/observability/logs/logs.middleware"

import { AppController } from "./app.controller"

import { AppImports } from "./imports/app.imports"

@Module({
	imports: [...AppImports],
	controllers: [AppController],
	providers: []
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LogsMiddleware)
			.forRoutes({ path: "*", method: RequestMethod.ALL })
	}
}
