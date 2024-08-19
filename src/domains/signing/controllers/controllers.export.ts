import { DiadocController } from "./diadoc.controller.v1.controller"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

const runMode = process.env.RUN_MODE as T_RUN_MODE

type Exports = any[]

let SigningControllers: Exports = []

switch (runMode) {
	case T_RUN_MODE.WORKER:
		SigningControllers = []
		break
	case T_RUN_MODE.KAFKA:
		SigningControllers = []
		break
	case T_RUN_MODE.GRPC:
		SigningControllers = []
		break
	case T_RUN_MODE.HTTP:
		SigningControllers = [DiadocController]
		break
	/* Может быть undefined при запуске приложения без docker  */
	default:
		SigningControllers = [DiadocController]
}

export const SigningControllersExport: Exports = SigningControllers
