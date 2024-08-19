import { AdminAuthController } from "./admin-auth.controller"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

const runMode: T_RUN_MODE = process.env.RUN_MODE as T_RUN_MODE

let AdminControllersList: any[] = []

switch (runMode) {
	case T_RUN_MODE.HTTP:
		AdminControllersList = [AdminAuthController]
		break
	case T_RUN_MODE.WORKER:
		AdminControllersList = []
		break
	case T_RUN_MODE.KAFKA:
		AdminControllersList = []
		break
	case T_RUN_MODE.GRPC:
		AdminControllersList = []
		break
	/* Может быть undefined при запуске приложения без docker  */
	default:
		AdminControllersList = [AdminAuthController]
}

export const AdminControllers = AdminControllersList
