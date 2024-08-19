import { ConfigModule } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"

import { DbModule } from "./db.module"

describe("DbModule", () => {
	let module: TestingModule

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [DbModule]
		}).compile()
	})

	it("Модуль успешно инициализирован", () => {
		expect(module).toBeDefined()
	})

	it("Дочерние модули успешно инициализированы", () => {
		expect(module.get(TypeOrmModule)).toBeInstanceOf(TypeOrmModule)
		expect(module.get(ConfigModule)).toBeInstanceOf(ConfigModule)
	})
})
