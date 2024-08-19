import { HttpModule } from "@nestjs/axios"
import { CacheModule } from "@nestjs/cache-manager"
import { ConfigModule } from "@nestjs/config"
import { ScheduleModule } from "@nestjs/schedule"
import { Test, TestingModule } from "@nestjs/testing"

import { StoringModule } from "./storing.module"
import { ClientsModule } from "@docs/common/clients/clients.module"
import { DbModule } from "@docs/common/db/db.module"
import { ObservabilityModule } from "@docs/common/observability/observability.module"

import { DocsControllerV2 } from "@docs/storing/controllers/docs.v2.controller"
import { FilesControllerV1 } from "@docs/storing/controllers/files.v1.controller"
import { FilesControllerV2 } from "@docs/storing/controllers/files.v2.controller"
import { MdmController } from "@docs/storing/controllers/mdm.controller"

describe("StoringModule", () => {
	let module: TestingModule

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [StoringModule]
		}).compile()
	})

	it("Модуль успешно инициализирован", () => {
		expect(module).toBeDefined()
	})

	it("Контроллеры успешно инициализированы", () => {
		expect(module.get(FilesControllerV1)).toBeInstanceOf(FilesControllerV1)
		expect(module.get(FilesControllerV2)).toBeInstanceOf(FilesControllerV2)
		expect(module.get(DocsControllerV2)).toBeInstanceOf(DocsControllerV2)
		expect(module.get(MdmController)).toBeInstanceOf(MdmController)
	})

	it("Дочерние модули успешно инициализированы", () => {
		expect(module.get(ObservabilityModule)).toBeInstanceOf(ObservabilityModule)
		expect(module.get(ScheduleModule)).toBeInstanceOf(ScheduleModule)
		expect(module.get(ClientsModule)).toBeInstanceOf(ClientsModule)
		expect(module.get(ConfigModule)).toBeInstanceOf(ConfigModule)
		expect(module.get(CacheModule)).toBeInstanceOf(CacheModule)
		expect(module.get(HttpModule)).toBeInstanceOf(HttpModule)
		expect(module.get(DbModule)).toBeInstanceOf(DbModule)
	})
})
