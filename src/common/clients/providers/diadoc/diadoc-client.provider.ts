import { ClassProvider } from "@nestjs/common"

import { DiadocClientService } from "./diadoc-client.service"

import { IOC__SERVICE__CLIENT_PROVIDER_DIADOC } from "@docs/shared/constants/ioc.constants"

export const DiadocClientProvider: ClassProvider = {
	provide: IOC__SERVICE__CLIENT_PROVIDER_DIADOC,
	useClass: DiadocClientService
}
