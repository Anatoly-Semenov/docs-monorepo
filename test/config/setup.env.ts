process.env.COMPOSE_PROJECT_NAME = "nest-template"

//< Ports
process.env.PORT__APP_HTTP = "60030"
process.env.PORT__APP_GRPC = "60031"
//> Ports

//< Docker Registry params
process.env.DOCKER_REGISTRY__LOGIN = ""
process.env.DOCKER_REGISTRY__PASSWORD = ""
process.env.DOCKER_REGISTRY__URL = ""
//> Docker Registry params

//< NPM Registry params
process.env.NPM_REGISTRY__URL = ""
process.env.NPM_REGISTRY__TOKEN = ""
//> NPM Registry params

//> POSTGRES
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || "postgres"
process.env.POSTGRES_DB = process.env.POSTGRES_DB || "signing-backend-db"
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || "postgres"
process.env.POSTGRES_USER = process.env.POSTGRES_USER || "postgres"
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || "5432"
//< POSTGRES

//> MDM data
process.env.MDM_URL = ""
process.env.MDM_ORGANIZATION_PATH = "organizations"
process.env.MDM_COUNTERPARTIES_PATH = "partners"
process.env.MDM_LOGIN = "mdm_api"
process.env.MDM_PASSWORD = ""
//< MDM data

//> KAFKA
process.env.KAFKA__CLIENT_ID = "SIGNING_BACKEND"
process.env.KAFKA__GROUP_ID = "SIGNING_BACKEND"
process.env.KAFKA__TOPIC_NAME = "e1c-builder-organizations-01"

process.env.KAFKA__BROKERS_URL = "kafka:29092,localhost:9092 #DEV"
process.env.KAFKA__PASSWORD = ""
process.env.KAFKA__CA_CERT = ""
process.env.KAFKA__LOGIN = ""
//< KAFKA

//> DIADOC
process.env.DIADOC_API_URL = ""
process.env.DIADOC_GET_ORGANIZATIONS_INN_LIST_PATH = "GetOrganizationsByInnList"
process.env.DIADOC_GET_ORGANIZATIONS_INN_KPP_PATH = "GetOrganizationsByInnKpp"
process.env.DIADOC_AUTH_PATH = "V3/Authenticate"
process.env.DIADOC_SEND_DOCUMENT_PATH = "/V3/PostMessage"
process.env.DIADOC_PRINTING_FORMS_PATH = "GeneratePrintForm"
process.env.DIADOC_ARCHIVE_PREPARE = "GenerateDocumentZip"
process.env.DIADOC_ARCHIVE_DOWNLOAD = "ShelfDownload"
process.env.DIADOC_CHECK_STATUS_PATH = "GetDocflowEvents"

process.env.DIADOC_DEV_KEY = ""
process.env.DIADOC_AUTH_LOGIN = ""
process.env.DIADOC_AUTH_PASSWORD = ""
process.env.DIADOC_TOKEN_TTL = "82800"
process.env.DIADOC_REFRESH_TIME = "15000"
//< DIADOC

//> S3
process.env.S3_ACCESS_DOMAIN_NAME = "media"
process.env.S3_BUCKET = "media"
process.env.S3_ENDPOINT = "minio-service"
process.env.S3_PORT = "9099"
process.env.S3_USE_SSL = "false"

process.env.S3_USER = "rootroot"
process.env.S3_ROOT_PASSWORD = "rootroot"
process.env.S3_AKEY = "rootroot"
process.env.S3_PKEY = "rootroot"
//< S3

// minio>
process.env.MINIO_ROOT_USER = "rootroot"
process.env.MINIO_ROOT_PASSWORD = "rootroot"
process.env.MINIO_ACCESS_KEY = "rootroot"
process.env.MINIO_SECRET_KEY = "rootroot"
//< minio

//> REDIS
process.env.REDIS_PASSWORD = process.env.REDIS_PASSWORD || "redis"
process.env.REDIS_HOST = "127.0.0.1"
process.env.REDIS_HOST = "redis"
process.env.REDIS_PORT = "6379"
//< REDIS

//> SENTRY
process.env.SENTRY__DSN = ""
//< SENTRY

//> WORKER
process.env.PORT__APP_WORKER = "3018"
//< WORKER

//> CRON
process.env.CRON_PERIOD_REFRESH_LISTS = "0 01 * * *"
process.env.CRON_PERIOD_FILE_CLEANER = "0 01 * * *"
process.env.CRON_STATUS_WORKING_TTL = "5242880"
process.env.CRON_PERIOD = "*/30 * * * * *"
//< CRON

//> STAND_INFO
process.env.APP_ENV = "development"
process.env.NODE_ENV = "development"
process.env.RUN_MODE = "MODE_HTTP"
process.env.JWT_ACCESS_SECRET = "secretka"
process.env.JWT_REFRESH_SECRET = "secretka-123"
//< STAND_INFO

//> Retry
process.env.RETRY__TIMES = "3"
process.env.RETRY__DELAY_MILLISECONDS = "2500"
//< Retry

//> Limits
process.env.LIMIT_FILES_BY_DOCUMENT = "40"
//< Limits

//> STORING
process.env.STORING__MONTHS_FILES = "6"
process.env.STORING__MONTHS_DOCUMENT_DRAFTS = "3"
//< STORING

process.env.T_RUN_MODE = "MODE_HTTP"
