import { ClassProvider } from "@nestjs/common"

import { IOC__ORGANIZATIONS_INDICATOR } from "@docs/shared/constants/ioc.constants"

import { OrganizationsIndicator } from "./organizations.health"

export const OrganizationsHealthProvider: ClassProvider = {
	provide: IOC__ORGANIZATIONS_INDICATOR,
	useClass: OrganizationsIndicator
}
