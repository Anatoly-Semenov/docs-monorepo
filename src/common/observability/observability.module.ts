import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"

import { DbModule } from "@docs/common/db/db.module"

import { ObservabilityProviders } from "@docs/common/observability/observability.providers"

@Module({
	imports: [DbModule, ConfigModule],
	providers: [...ObservabilityProviders],
	exports: [...ObservabilityProviders]
})
export class ObservabilityModule {}
