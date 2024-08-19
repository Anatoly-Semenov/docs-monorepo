import { ClassProvider } from "@nestjs/common"

import { S3ClientService } from "./s3-client.service"

import { IOC__SERVICE__CLIENT_PROVIDER_S3 } from "@docs/shared/constants/ioc.constants"

export const S3ClientProvider: ClassProvider = {
	provide: IOC__SERVICE__CLIENT_PROVIDER_S3,
	useClass: S3ClientService
}
