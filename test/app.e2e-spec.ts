import * as request from "supertest"

import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { AppModule } from "../src/app.module"

describe("AppController (e2e)", () => {
	let app: INestApplication

	const mockAppController = {
		healthCheck: jest.fn()
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile()

		app = module.createNestApplication()
		await app.init()
	})

	describe("GET /", () => {
		beforeEach(() => {
			jest.spyOn(mockAppController, "healthCheck")
		})

		it("should return OK", () => {
			return request(app.getHttpServer()).get("/").expect(200)
		})
	})

	afterAll(async () => {
		if (app) await app.close()
	})
})
