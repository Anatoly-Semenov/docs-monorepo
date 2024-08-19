import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"

import { BackstageService } from "../backstage-service/backstage.service"
import { AuthServiceGuard } from "@docs/common/auth/guards/service-auth.guard"

import { IOC__BACKSTAGE_SERVICE } from "@docs/shared/constants/ioc.constants"

import { BackstageSetRedisDto } from "@docs/shared/dto/v1/backstage.dto"

@AuthServiceGuard()
@Controller("backstage")
@ApiTags("backstage")
export class BackstageRedisController {
	constructor(
		@Inject(IOC__BACKSTAGE_SERVICE)
		private readonly backstageService: BackstageService
	) {}

	@Post("/redis")
	setRedisSimple(@Body() backstageDto: BackstageSetRedisDto): Promise<string> {
		return this.backstageService.setRedis(
			backstageDto.key,
			backstageDto.value,
			backstageDto.ttl
		)
	}

	@Get("redis/:key")
	getRedisValue(@Param("key") key: string): Promise<string> {
		return this.backstageService.getRedisValue(key)
	}
}
