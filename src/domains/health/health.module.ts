import { HttpModule } from "@nestjs/axios"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TerminusModule } from "@nestjs/terminus"

import { DbModule } from "@docs/common/db/db.module"

import { CounterpartiesHealthProvider } from "./indicators/counterparties/counterparties-health.provider"
import { OrganizationsHealthProvider } from "./indicators/organizations/organizations-health.provider"
import { RedisHealthProvider } from "./indicators/redis/redis-health.provider"
import { RedisClientProvider } from "@docs/common/clients/providers/redis/redis-client.provider"

import { HealthController } from "./health.controller"

@Module({
	imports: [TerminusModule, ConfigModule, HttpModule, DbModule],
	controllers: [HealthController],
	providers: [
		CounterpartiesHealthProvider,
		OrganizationsHealthProvider,
		RedisClientProvider,
		RedisHealthProvider,
		ConfigService
	]
})
export class HealthModule {}
