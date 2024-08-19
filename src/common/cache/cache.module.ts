import { CacheModule as NestCacheModule } from "@nestjs/cache-manager"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"

import { interceptorsExport } from "./interceptors/interceptors.export"

import { CONFIG__CACHE_BASE_TTL } from "@docs/shared/constants/config.constants"

@Module({
	imports: [
		NestCacheModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				ttl: parseInt(configService.get<string>(CONFIG__CACHE_BASE_TTL), 10)
			}),
			inject: [ConfigService]
		})
	],
	providers: [...interceptorsExport],
	exports: [...interceptorsExport]
})
export class CacheModule {}
