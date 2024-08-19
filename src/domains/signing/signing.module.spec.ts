import { HttpModule } from "@nestjs/axios"
import { ConfigModule } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"

import { SigningModule } from "./signing.module"
import { ClientsModule } from "@docs/common/clients/clients.module"
import { DbModule } from "@docs/common/db/db.module"

import { DiadocController } from "@docs/signing/controllers/diadoc.controller.v1.controller"

describe("SigningModule", () => {
	let module: TestingModule

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [SigningModule]
		}).compile()
	})

	it("Модуль успешно инициализирован", () => {
		expect(module).toBeDefined()
	})

	it("Контроллеры успешно инициализированы", () => {
		expect(module.get(DiadocController)).toBeInstanceOf(DiadocController)
	})

	it("Дочерние модули успешно инициализированы", () => {
		expect(module.get(ClientsModule)).toBeInstanceOf(ClientsModule)
		expect(module.get(ConfigModule)).toBeInstanceOf(ConfigModule)
		expect(module.get(HttpModule)).toBeInstanceOf(HttpModule)
		expect(module.get(DbModule)).toBeInstanceOf(DbModule)
	})
})
