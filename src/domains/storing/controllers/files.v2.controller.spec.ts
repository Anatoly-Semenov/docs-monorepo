import { HttpModule } from "@nestjs/axios"
import { CacheModule } from "@nestjs/cache-manager"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"

import { ClientsModule } from "@docs/common/clients/clients.module"
import { DbModule } from "@docs/common/db/db.module"

import { KafkaClientWrapper } from "@docs/common/kafka-client/kafka-client.wrapper"

import { FilesDownloadProvider } from "@docs/storing/services/files-service/files-download.provider"

import { DiadocController } from "@docs/signing/controllers/diadoc.controller.v1.controller"
import { FilesControllerV2 } from "@docs/storing/controllers/files.v2.controller"

import { SigningServicesExport } from "@docs/signing/services/services.export"
import { DocsService } from "@docs/storing/services/docs-service/docs.service"
import { FilesDownloadService } from "@docs/storing/services/files-service/files-download.service"
import { FilesService } from "@docs/storing/services/files-service/files.service"

import { CONFIG__CACHE_BASE_TTL } from "@docs/shared/constants/config.constants"
import { IOC__SERVICE__FILES } from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_2 } from "@docs/shared/constants/router.constants"

describe(`Controller | files/v${ROUTER__VERSION_2}`, () => {
	let controller: FilesControllerV2

	let filesService: FilesService

	const mockFilesService = {
		downloadFile: jest.fn()
	}

	const mockFilesDownloadService = {
		createDownloadJob: jest.fn()
	}

	const mockFilesProvider = {
		provide: IOC__SERVICE__FILES,
		useClass: class {
			downloadFile() {
				// @ts-ignore
				return filesService.downloadFile()
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
				FilesDownloadProvider,
				FilesDownloadService,
				KafkaClientWrapper,
				FilesService
			],
			controllers: [FilesControllerV2]
		})
			.overrideProvider(FilesService)
			.useValue(mockFilesService)
			.overrideProvider(FilesDownloadService)
			.useValue(mockFilesDownloadService)
			.overrideProvider(KafkaClientWrapper)
			.useValue({})
			.compile()

		controller = module.get<FilesControllerV2>(FilesControllerV2)
		filesService = module.get<FilesService>(FilesService)
	})

	it("Контроллер успешно инициализирован", () => {
		expect(controller).toBeDefined()
	})

	// Todo: нужна доработка теста
	// describe("GET v2/files/:id?filetype | getFile ", () => {
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
