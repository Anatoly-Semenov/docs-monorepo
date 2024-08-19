import { ClassProvider } from "@nestjs/common"

import { MdmClientService } from "./mdm-client.service"

import { IOC__SERVICE__CLIENT_PROVIDER_MDM } from "@docs/shared/constants/ioc.constants"

export const MdmClientProvider: ClassProvider = {
	provide: IOC__SERVICE__CLIENT_PROVIDER_MDM,
	useClass: MdmClientService
}
