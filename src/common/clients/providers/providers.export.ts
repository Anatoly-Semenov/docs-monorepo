import { ClassProvider } from "@nestjs/common"

import { DiadocClientProvider } from "./diadoc/diadoc-client.provider"
import { MdmClientProvider } from "./mdm/mdm-client.provider"
import { RedisBullClientProvider } from "./redis-bull/redis-bull-client.provider"
import { RedisClientProvider } from "./redis/redis-client.provider"
import { S3ClientProvider } from "./s3/s3-client-provider"

export const clientProviders: ClassProvider[] = [
	RedisBullClientProvider,
	DiadocClientProvider,
	RedisClientProvider,
	MdmClientProvider,
	S3ClientProvider
]
