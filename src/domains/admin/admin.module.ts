import { Module } from "@nestjs/common"

import { AdminProvider } from "./admin.provider"
import { SystemsProviderDb } from "@docs/common/db/services/systems-service/systems.provider"

import { AdminControllers } from "./controllers/controllers.export"

import { AdminExports } from "./admin.exports"

import adminModels from "@docs/common/db/entities/admin.entities"

import { AdminImports } from "./admin.imports"
import { AdminSite } from "./admin.site"

@Module({
	providers: [AdminProvider, SystemsProviderDb],
	controllers: [...AdminControllers],
	imports: [...AdminImports],
	exports: [...AdminExports]
})
export class AdminModule {
	constructor(private readonly adminSite: AdminSite) {
		for (const model of [...adminModels]) {
			adminSite.register(new model().getName(), model)
		}
	}
}
