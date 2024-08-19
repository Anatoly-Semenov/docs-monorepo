import { HttpModule } from "@nestjs/axios"
import { CacheModule } from "@nestjs/cache-manager"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"

import { ClientsModule } from "@docs/common/clients/clients.module"
import { DbModule } from "@docs/common/db/db.module"

import { KafkaClientWrapper } from "@docs/common/kafka-client/kafka-client.wrapper"

import { DiadocController } from "@docs/signing/controllers/diadoc.controller.v1.controller"

import { SigningServicesExport } from "@docs/signing/services/services.export"
import { DocsService } from "@docs/storing/services/docs-service/docs.service"
import { FilesService } from "@docs/storing/services/files-service/files.service"

import { CONFIG__CACHE_BASE_TTL } from "@docs/shared/constants/config.constants"
import {
	IOC__SERVICE__DOCS,
	IOC__SERVICE__FILES
} from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_1 } from "@docs/shared/constants/router.constants"

import { docMock, jwtPayloadSystemMock } from "@docs/mocks/entities"

describe(`Controller | diadoc/v${ROUTER__VERSION_1}`, () => {
	let controller: DiadocController

	let filesService: FilesService
	let docsService: DocsService

	const mockFilesService = {
		downloadFile: jest.fn(),
		upload: jest.fn()
	}

	const mockFilesProvider = {
		provide: IOC__SERVICE__FILES,
		useClass: class {
			downloadFile() {
				// @ts-ignore
				return filesService.downloadFile()
			}

			upload() {
				// @ts-ignore
				return filesService.upload()
			}
		}
	}

	// @ts-ignore
	const mockDocsService: DocsService = {
		setPublish: jest.fn(),
		create: jest.fn()
	}

	const mockDocsProvider = {
		provide: IOC__SERVICE__DOCS,
		useClass: class {
			create() {
				// @ts-ignore
				return mockDocsService.create()
			}
			setPublish() {
				// @ts-ignore
				return mockDocsService.setPublish()
			}
		}
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
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
				mockFilesProvider,
				mockDocsProvider,
				FilesService,
				DocsService
			],
			controllers: [DiadocController]
		})
			.overrideProvider(DocsService)
			.useValue(mockDocsService)
			.overrideProvider(FilesService)
			.useValue(mockFilesService)
			.overrideProvider(KafkaClientWrapper)
			.useValue({})
			.compile()

		controller = module.get<DiadocController>(DiadocController)
		filesService = module.get<FilesService>(FilesService)
		docsService = module.get<DocsService>(DocsService)
	})

	it("Контроллер успешно инициализирован", () => {
		expect(controller).toBeDefined()
	})

	describe("POST / | sendToDiadoc ", () => {
		beforeEach(() => {
			jest.spyOn(docsService, "create")
		})

		it("Метод сервиса успешно инициализирован", () => {
			expect(docsService.create).toBeDefined()
		})

		it("Метод сервиса успешно отработал", () => {
			// @ts-ignore
			controller.sendToDiadoc(docMock, jwtPayloadSystemMock)

			expect(docsService.create).toBeCalled()
		})
	})

	describe("POST upload/:docId | uploadFile ", () => {
		beforeEach(() => {
			jest.spyOn(filesService, "upload")
		})

		it("Метод сервиса успешно инициализирован", () => {
			expect(filesService.upload).toBeDefined()
		})

		it("Метод сервиса успешно отработал", () => {
			// @ts-ignore
			controller.uploadFile("", "", "", "")

			expect(filesService.upload).toBeCalled()
		})
	})

	describe("POST upload/:doc_id/publish | setPublish ", () => {
		beforeEach(() => {
			jest.spyOn(docsService, "setPublish")
		})

		it("Метод сервиса успешно инициализирован", () => {
			expect(docsService.setPublish).toBeDefined()
		})

		it("Метод сервиса успешно отработал", () => {
			// @ts-ignore
			controller.setPublish("", "")

			expect(docsService.setPublish).toBeCalled()
		})
	})

	// Todo: нужна доработка теста
	// describe("GET :id/:filetype | getFile ", () => {
	// 	beforeEach(() => {
	// 		jest.spyOn(filesService, "downloadFile")
	// 	})
	//
	// 	it("Метод сервиса успешно инициализирован", () => {
	// 		expect(filesService.downloadFile).toBeDefined()
	// 	})
	//
	// 	it("Метод сервиса успешно отработал", () => {
	// 		// @ts-ignore
	// 		controller.getFile("", FileTypeForDownloadPath.ARCHIVE, "", "")
	//
	// 		expect(filesService.downloadFile).toBeCalled()
	// 	})
	// })
})
