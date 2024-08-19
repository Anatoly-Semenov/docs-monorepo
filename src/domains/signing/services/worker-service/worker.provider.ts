import { ClassProvider } from "@nestjs/common"

import { WorkerService } from "./worker.service"

import { IOC__WORKER_SERVICE } from "@docs/shared/constants/ioc.constants"

export const WorkerProvider: ClassProvider = {
	provide: IOC__WORKER_SERVICE,
	useClass: WorkerService
}
