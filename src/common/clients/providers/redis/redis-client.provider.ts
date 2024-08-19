import { ClassProvider } from "@nestjs/common"

import { RedisClientService } from "./redis-client.service"

import { IOC__SERVICE__CLIENT_PROVIDER_REDIS } from "@docs/shared/constants/ioc.constants"

export const RedisClientProvider: ClassProvider = {
	provide: IOC__SERVICE__CLIENT_PROVIDER_REDIS,
	useClass: RedisClientService
}
