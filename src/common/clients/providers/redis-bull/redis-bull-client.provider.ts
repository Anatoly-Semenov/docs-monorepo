import { ClassProvider } from "@nestjs/common"

import { RedisBullClientService } from "@docs/common/clients/providers/redis-bull/redis-bull-client.service"

import { IOC__SERVICE__CLIENT_PROVIDER_REDIS_BULL } from "@docs/shared/constants/ioc.constants"

export const RedisBullClientProvider: ClassProvider = {
	provide: IOC__SERVICE__CLIENT_PROVIDER_REDIS_BULL,
	useClass: RedisBullClientService
}
