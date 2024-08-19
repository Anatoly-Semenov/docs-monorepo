import { BootstrapFactory } from "./bootstrap/bootstrap.factory"

import { AppModule } from "./app.module"

import { T_RUN_MODE } from "./shared/types/bootstrap.types"

new BootstrapFactory()
	.make(process.env.RUN_MODE as T_RUN_MODE)
	.bootstrap(AppModule)
