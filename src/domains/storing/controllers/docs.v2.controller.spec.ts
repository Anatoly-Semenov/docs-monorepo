import { HttpModule } from "@nestjs/axios"
import { CacheModule } from "@nestjs/cache-manager"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"

import { ClientsModule } from "@docs/common/clients/clients.module"
import { DbModule } from "@docs/common/db/db.module"

import { KafkaClientWrapper } from "@docs/common/kafka-client/kafka-client.wrapper"

import { OrganizationsProviderDb } from "@docs/common/db/services/organizations/organization.provider"
import { DeleteDocsProvider } from "@docs/storing/services/delete-docs-service/delete-docs.provider"

import { DocsControllerV2 } from "@docs/storing/controllers/docs.v2.controller"

import { OrganizationServiceDb } from "@docs/common/db/services/organizations/organization.service"
import { SigningServicesExport } from "@docs/signing/services/services.export"
import { DeleteDocsService } from "@docs/storing/services/delete-docs-service/delete-docs.service"
import { DocsService } from "@docs/storing/services/docs-service/docs.service"

import { CONFIG__CACHE_BASE_TTL } from "@docs/shared/constants/config.constants"
import {
	IOC__SERVICE__DOCS,
	IOC__SERVICE__ORGANIZATION_DB
} from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_2 } from "@docs/shared/constants/router.constants"

import { ActionDto } from "@docs/shared/dto/common/action.dto"
import { CreateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/create-docs.dto"

import { docMock, jwtPayloadSystemMock } from "@docs/mocks/entities"

describe(`Controller | files/v${ROUTER__VERSION_2}`, () => {
	let module: TestingModule

	let controller: DocsControllerV2

	let docsService: DocsService
	let deleteDocsService: DeleteDocsService

	// @ts-ignore
	const mockDocsService: DocsService = {
		setPublish: jest.fn(),
		create: jest.fn()
	}

	// @ts-ignore
	const mockOrganizationServiceDb: OrganizationServiceDb = {
		getById: jest.fn()
	}

	// @ts-ignore
	const mockDeleteDocsService: DeleteDocsService = {
		deleteFromSystem: jest.fn()
	}

	const mockDocsProvider = {
		provide: IOC__SERVICE__DOCS,
		useClass: class {
			create() {
				// @ts-ignore
				return mockDocsService.create()
			}
			attachFile() {
				// @ts-ignore
				return mockDocsService.attachFile()
			}
			setPublish() {
				// @ts-ignore
				return mockDocsService.setPublish()
			}
		}
	}

	const mockOrganizationProvider = {
		provide: IOC__SERVICE__ORGANIZATION_DB,
		useClass: class {
			getById() {
				// @ts-ignore
				return mockOrganizationServiceDb.getById()
			}
		}
	}

	beforeEach(async (): Promise<void> => {
		module = await Test.createTestingModule({
			imports: [
				DbModule,
				HttpModule,
				ConfigModule,
				ClientsModule,

				CacheModule.registerAsync({
					imports: [ConfigModule],
					useFactory: async (configService: ConfigService) => ({
						ttl: parseInt(configService.get(CONFIG__CACHE_BASE_TTL), 10)
					}),
					inject: [ConfigService]
				})
			],
			providers: [
				...SigningServicesExport,
				KafkaClientWrapper,
				DeleteDocsProvider,
				DeleteDocsService,
				mockDocsProvider,
				DocsService
			],
			controllers: [DocsControllerV2]
		})
			.overrideProvider(DocsService)
			.useValue(mockDocsService)
			.overrideProvider(OrganizationsProviderDb)
			.useValue(mockOrganizationProvider)
			.overrideProvider(DeleteDocsService)
			.useValue(mockDeleteDocsService)
			.overrideProvider(KafkaClientWrapper)
			.useValue({})
			.compile()

		deleteDocsService = module.get<DeleteDocsService>(DeleteDocsService)
		docsService = module.get<DocsService>(DocsService)

		controller = module.get<DocsControllerV2>(DocsControllerV2)
	})

	it("Контроллер успешно инициализирован", () => {
		expect(controller).toBeDefined()
	})

	describe("POST v2/docs/ | { action: create } ", () => {
		beforeEach(() => {
			jest.spyOn(docsService, "create")
		})

		it("Метод сервиса успешно инициализирован", () => {
			expect(docsService.create).toBeDefined()
		})

		it("Метод сервиса успешно отработал", () => {
			// @ts-ignore
			controller.handlePostMethod(
				new ActionDto<CreateDocsDto>({
					action: "create",
					data: docMock
				}),
				jwtPayloadSystemMock
			)

			expect(docsService.create).toBeCalled()
		})
	})
})
