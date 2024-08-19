import { ClassProvider } from "@nestjs/common"

import { GrpcCacheInterceptor } from "./grpc-cache.interceptor"

import { IOC__INTERCEPTOR__GRPC_CACHE } from "@docs/shared/constants/ioc.constants"

export const grpcCacheProvider: ClassProvider = {
	provide: IOC__INTERCEPTOR__GRPC_CACHE,
	useClass: GrpcCacheInterceptor
}
