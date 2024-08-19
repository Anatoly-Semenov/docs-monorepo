import { SigningModule } from "../domains/signing/signing.module"
import { StoringModule } from "../domains/storing/storing.module"
import { AuthModule } from "@docs/common/auth/auth.module"

import { Imports } from "./common.imports"

export const BusinessLogicImports: Imports = [
	// Модули бизнес-логики
	AuthModule,
	SigningModule,
	StoringModule
]
