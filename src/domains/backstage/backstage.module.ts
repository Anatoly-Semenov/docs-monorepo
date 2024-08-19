import { Module } from "@nestjs/common"

import { AuthModule } from "@docs/common/auth/auth.module"
import { ClientsModule } from "@docs/common/clients/clients.module"

import { BackstageProvider } from "./backstage-service/backstage.provider"

import { AuthSystemController } from "./controllers/auth-system.controller"
import { BackstageRedisController } from "./controllers/backstage-redis.controller"

@Module({
	imports: [ClientsModule, AuthModule],
	controllers: [BackstageRedisController, AuthSystemController],
	providers: [BackstageProvider]
})
export class BackstageModule {}
