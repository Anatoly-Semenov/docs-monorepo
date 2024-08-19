import { ClassProvider } from "@nestjs/common"

import { AuthService } from "./auth.service"

import { IOC__AUTH_SERVICE } from "@docs/shared/constants/ioc.constants"

export const AuthProvider: ClassProvider = {
	provide: IOC__AUTH_SERVICE,
	useClass: AuthService
}
