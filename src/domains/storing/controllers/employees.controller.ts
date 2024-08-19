import { AuthSystemGuard } from "@docs/common/auth/guards/system-auth.guard"

import {
	Controller,
	Get,
	Logger,
	Param,
	ParseUUIDPipe,
	Post
} from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"

import { ROUTER__VERSION_2 } from "@docs/shared/constants/router.constants"

@Controller({
	path: "employees",
	version: ROUTER__VERSION_2
})
@AuthSystemGuard()
@ApiBearerAuth()
@ApiTags("Employees")
export class EmployeesControllerV2 {
	private readonly logger: Logger = new Logger(EmployeesControllerV2.name)

	@Get(":org_id")
	getEmployees(@Param("org_id", new ParseUUIDPipe()) orgId: string) {
		this.logger.log("Получен запрос сотрудников организаций в Диадок")
		return "Данынй функционал недоступен"
	}

	@Post()
	employeesPostHandler() {
		this.logger.log("Получен POST-запрос /employees")
		return "Данный функционал недоступен"
	}
}
