import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

import { AuthAdminModule, CoreAdminModule } from "./admin.imports"

const runMode: T_RUN_MODE = process.env.RUN_MODE as T_RUN_MODE

let AdminExportsList: any[] = []
const HttpModeExports: any[] = [CoreAdminModule, AuthAdminModule]

switch (runMode) {
	case T_RUN_MODE.HTTP:
		AdminExportsList = HttpModeExports
		break
	case T_RUN_MODE.WORKER:
		AdminExportsList = []
		break
	case T_RUN_MODE.KAFKA:
		AdminExportsList = []
		break
	case T_RUN_MODE.GRPC:
		AdminExportsList = []
		break
	/* Может быть undefined при запуске приложения без docker  */
	default:
		AdminExportsList = HttpModeExports
}

export const AdminExports = AdminExportsList
