import { EmployeesControllerV2 } from "./employees.controller"
import { EmployeesGrpcController } from "./employees.grpc.controller"
import { MdmController } from "./mdm.controller"
import { MdmKafkaController } from "./mdm.kafka.controller"
import { OperatorsControllerV1 } from "./operators.controller"
import { OrganizationControllerV2 } from "./organizations.controller"
import { DiadocController } from "@docs/signing/controllers/diadoc.controller.v1.controller"
import { DiadocGrpcControllerV1 } from "@docs/storing/controllers/diadoc.v1.grpc.controller"
import { DocsGrpcControllerV1 } from "@docs/storing/controllers/docs.v1.grpc.controller"
import { DocsControllerV2 } from "@docs/storing/controllers/docs.v2.controller"
import { FilesControllerV1 } from "@docs/storing/controllers/files.v1.controller"
import { FilesGrpcControllerV1 } from "@docs/storing/controllers/files.v1.grpc.controller"
import { FilesControllerV2 } from "@docs/storing/controllers/files.v2.controller"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

type Controllers = any[]

const runMode = process.env.RUN_MODE as T_RUN_MODE

let StoringControllersExportRaw: Controllers = []

const HttpControllers: Controllers = [
	OrganizationControllerV2,
	OperatorsControllerV1,
	EmployeesControllerV2,
	FilesControllerV1,
	FilesControllerV2,
	DocsControllerV2,
	DiadocController,
	MdmController
]

switch (runMode) {
	case T_RUN_MODE.WORKER:
		StoringControllersExportRaw = []
		break
	case T_RUN_MODE.HTTP:
		StoringControllersExportRaw = HttpControllers
		break
	case T_RUN_MODE.KAFKA:
		StoringControllersExportRaw = [MdmKafkaController]
		break
	case T_RUN_MODE.GRPC:
		StoringControllersExportRaw = [
			EmployeesGrpcController,
			DiadocGrpcControllerV1,
			FilesGrpcControllerV1,
			DocsGrpcControllerV1
		]
		break
	/* Может быть undefined при запуске приложения без docker  */
	default:
		StoringControllersExportRaw = HttpControllers
}

export const StoringControllersExport: Controllers = StoringControllersExportRaw
