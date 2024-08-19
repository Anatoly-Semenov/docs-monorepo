import { CacheInterceptor } from "@nestjs/cache-manager"
import { ExecutionContext, Injectable, Logger } from "@nestjs/common"

import { CustomCacheKey } from "@docs/shared/decorators/custom-cache-key.decorator"

@Injectable()
export class GrpcCacheInterceptor extends CacheInterceptor {
	private readonly logger = new Logger(GrpcCacheInterceptor.name)

	trackBy(context: ExecutionContext): string | undefined {
		const cacheKeyParams = this.reflector.get(
			CustomCacheKey,
			context.getHandler()
		)
		const args = context.getArgByIndex(cacheKeyParams.argumentIndex)

		return `${cacheKeyParams.uniquePrefix}-${args[cacheKeyParams.fieldName]}`
	}
}
