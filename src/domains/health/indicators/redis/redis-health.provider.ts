import { ClassProvider } from "@nestjs/common"

import { IOC__REDIS_INDICATOR } from "@docs/shared/constants/ioc.constants"

import { RedisIndicator } from "./redis.health"

export const RedisHealthProvider: ClassProvider = {
	provide: IOC__REDIS_INDICATOR,
	useClass: RedisIndicator
}
