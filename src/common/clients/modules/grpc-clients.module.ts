import { DynamicModule } from "@nestjs/common"
import { ClientsModule as NestClientsModule } from "@nestjs/microservices/module/clients.module"

import { IOC__GRPC_SELF_CLIENT } from "@docs/shared/constants/ioc.constants"

import { BootstrapGrpcProduct } from "../../../bootstrap/bootstrap-grpc.product"

export const GrpcClientsModule: DynamicModule = NestClientsModule.register([
	{
		name: IOC__GRPC_SELF_CLIENT,
		...new BootstrapGrpcProduct().getGrpcOptions(false)
	}
])
