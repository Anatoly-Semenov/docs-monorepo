import { DIADOC_URL } from "@docs/shared/constants/config.constants"

describe("Проверка переменных окружения (.env)", () => {
	test("Все переменные окружения инициализированы", () => {
		expect(process.env.COMPOSE_PROJECT_NAME).toBeDefined()
		expect(process.env.PORT__APP_HTTP).toBeDefined()
		expect(process.env.PORT__APP_GRPC).toBeDefined()

		expect(process.env.DOCKER_REGISTRY__PASSWORD).toBeDefined()
		expect(process.env.DOCKER_REGISTRY__LOGIN).toBeDefined()
		expect(process.env.DOCKER_REGISTRY__URL).toBeDefined()

		expect(process.env.NPM_REGISTRY__TOKEN).toBeDefined()
		expect(process.env.NPM_REGISTRY__URL).toBeDefined()

		expect(process.env.POSTGRES_PASSWORD).toBeDefined()
		expect(process.env.POSTGRES_HOST).toBeDefined()
		expect(process.env.POSTGRES_PORT).toBeDefined()
		expect(process.env.POSTGRES_USER).toBeDefined()
		expect(process.env.POSTGRES_DB).toBeDefined()

		expect(process.env.MDM_COUNTERPARTIES_PATH).toBeDefined()
		expect(process.env.MDM_ORGANIZATION_PATH).toBeDefined()
		expect(process.env.MDM_PASSWORD).toBeDefined()
		expect(process.env.MDM_LOGIN).toBeDefined()
		expect(process.env.MDM_URL).toBeDefined()

		expect(process.env.KAFKA__BROKERS_URL).toBeDefined()
		expect(process.env.KAFKA__TOPIC_NAME).toBeDefined()
		expect(process.env.KAFKA__CLIENT_ID).toBeDefined()
		expect(process.env.KAFKA__GROUP_ID).toBeDefined()
		expect(process.env.KAFKA__PASSWORD).toBeDefined()
		expect(process.env.KAFKA__CA_CERT).toBeDefined()
		expect(process.env.KAFKA__LOGIN).toBeDefined()

		expect(process.env.DIADOC_GET_ORGANIZATIONS_INN_LIST_PATH).toBeDefined()
		expect(process.env.DIADOC_GET_ORGANIZATIONS_INN_KPP_PATH).toBeDefined()
		expect(process.env.DIADOC_PRINTING_FORMS_PATH).toBeDefined()
		expect(process.env.DIADOC_SEND_DOCUMENT_PATH).toBeDefined()
		expect(process.env.DIADOC_CHECK_STATUS_PATH).toBeDefined()
		expect(process.env.DIADOC_ARCHIVE_DOWNLOAD).toBeDefined()
		expect(process.env.DIADOC_ARCHIVE_PREPARE).toBeDefined()
		expect(process.env.DIADOC_AUTH_PASSWORD).toBeDefined()
		expect(process.env.DIADOC_REFRESH_TIME).toBeDefined()
		expect(process.env.DIADOC_AUTH_LOGIN).toBeDefined()
		expect(process.env.DIADOC_AUTH_PATH).toBeDefined()
		expect(process.env.DIADOC_TOKEN_TTL).toBeDefined()
		expect(process.env.DIADOC_DEV_KEY).toBeDefined()
		expect(process.env.DIADOC_API_URL).toBeDefined()
		expect(process.env.DIADOC_URL).toBeDefined()

		expect(process.env.S3_ACCESS_DOMAIN_NAME).toBeDefined()
		expect(process.env.S3_ROOT_PASSWORD).toBeDefined()
		expect(process.env.S3_ENDPOINT).toBeDefined()
		expect(process.env.S3_USE_SSL).toBeDefined()
		expect(process.env.S3_BUCKET).toBeDefined()
		expect(process.env.S3_PORT).toBeDefined()
		expect(process.env.S3_USER).toBeDefined()
		expect(process.env.S3_AKEY).toBeDefined()
		expect(process.env.S3_PKEY).toBeDefined()

		expect(process.env.MINIO_ROOT_PASSWORD).toBeDefined()
		expect(process.env.MINIO_ROOT_USER).toBeDefined()

		expect(process.env.MINIO_ACCESS_KEY).toBeDefined()
		expect(process.env.MINIO_SECRET_KEY).toBeDefined()

		expect(process.env.REDIS_PASSWORD).toBeDefined()
		expect(process.env.REDIS_HOST).toBeDefined()
		expect(process.env.REDIS_HOST).toBeDefined()
		expect(process.env.REDIS_PORT).toBeDefined()

		expect(process.env.CRON_PERIOD_REFRESH_LISTS).toBeDefined()
		expect(process.env.CRON_PERIOD_FILE_CLEANER).toBeDefined()
		expect(process.env.CRON_STATUS_WORKING_TTL).toBeDefined()
		expect(process.env.CRON_PERIOD).toBeDefined()

		expect(process.env.JWT_ACCESS_SECRET).toBeDefined()
		expect(process.env.JWT_REFRESH_SECRET).toBeDefined()

		expect(process.env.APP_ENV).toBeDefined()
		expect(process.env.NODE_ENV).toBeDefined()
		expect(process.env.RUN_MODE).toBeDefined()

		expect(process.env.RETRY__DELAY_MILLISECONDS).toBeDefined()
		expect(process.env.RETRY__TIMES).toBeDefined()

		expect(process.env.STORING__MONTHS_DOCUMENT_DRAFTS).toBeDefined()
		expect(process.env.STORING__MONTHS_FILES).toBeDefined()

		expect(process.env.LIMIT_FILES_BY_DOCUMENT).toBeDefined()
		expect(process.env.PORT__APP_WORKER).toBeDefined()
		expect(process.env.SENTRY__DSN).toBeDefined()
		expect(process.env.T_RUN_MODE).toBeDefined()
	})
})
