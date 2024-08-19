import { ClassProvider } from "@nestjs/common"

import { OrganizationServiceDb } from "./organization.service"

import { IOC__SERVICE__ORGANIZATION_DB } from "@docs/shared/constants/ioc.constants"

export const OrganizationsProviderDb: ClassProvider = {
	provide: IOC__SERVICE__ORGANIZATION_DB,
	useClass: OrganizationServiceDb
}
