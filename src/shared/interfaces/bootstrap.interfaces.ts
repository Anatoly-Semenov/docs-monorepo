import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

export interface IBootstrapFactory {
	make: (runMode: T_RUN_MODE) => IBootstrapProduct
}

export interface IBootstrapProduct {
	bootstrap: (appModule: any) => Promise<void>
}
