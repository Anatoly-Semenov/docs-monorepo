import { ClassProvider } from "@nestjs/common"

import { AdminService } from "./admin.service"

import { IOC__ADMIN_SERVICE } from "@docs/shared/constants/ioc.constants"

export const AdminProvider: ClassProvider = {
	provide: IOC__ADMIN_SERVICE,
	useClass: AdminService
}
