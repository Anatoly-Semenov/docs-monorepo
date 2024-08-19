import {
	IBootstrapFactory,
	IBootstrapProduct
} from "@docs/shared/interfaces/bootstrap.interfaces"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

import { BootstrapGrpcProduct } from "./bootstrap-grpc.product"
import { BootstrapHttpProduct } from "./bootstrap-http.product"
import { BootstrapKafkaProduct } from "./bootstrap-kafka.product"
import { BootstrapWorkerProduct } from "./bootstrap-worker.product"

export class BootstrapFactory implements IBootstrapFactory {
	make(runMode: T_RUN_MODE): IBootstrapProduct {
		console.log(`${runMode} | Bootstrapping Nest Application...`)

		switch (runMode) {
			case T_RUN_MODE.KAFKA:
				return new BootstrapKafkaProduct()
			case T_RUN_MODE.GRPC:
				return new BootstrapGrpcProduct()
			case T_RUN_MODE.WORKER:
				return new BootstrapWorkerProduct()
			case T_RUN_MODE.HTTP:
			default:
				return new BootstrapHttpProduct()
		}
	}
}
