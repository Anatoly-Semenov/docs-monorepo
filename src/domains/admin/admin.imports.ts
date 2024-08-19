import { AdminAuthModuleFactory, AdminCoreModuleFactory } from "nestjs-admin"

import { ConfigModule } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"

import { DbModule } from "@docs/common/db/db.module"

import { AdminController } from "./controllers/admin.controller"

import { adminCredentialValidator } from "./admin.validator"

import { Admin } from "@docs/common/db/entities/admin.entity"
import { Systems } from "@docs/common/db/entities/systems.entity"

import { T_RUN_MODE } from "@docs/shared/types/bootstrap.types"

import { AdminSite } from "./admin.site"

export const CoreAdminModule = AdminCoreModuleFactory.createAdminCoreModule({
	// @ts-ignore
	adminController: AdminController,
	adminSite: AdminSite
})

export const AuthAdminModule = AdminAuthModuleFactory.createAdminAuthModule({
	adminCoreModule: CoreAdminModule,
	credentialValidator: adminCredentialValidator,
	imports: [TypeOrmModule.forFeature([Admin])]
})

const runMode: T_RUN_MODE = process.env.RUN_MODE as T_RUN_MODE

let AdminImportsList: any[] = []

const HttpModeImports: any[] = [
	TypeOrmModule.forFeature([Admin, Systems]),
	CoreAdminModule,
	AuthAdminModule,
	ConfigModule,
	JwtModule,
	DbModule
]

switch (runMode) {
	case T_RUN_MODE.HTTP:
		AdminImportsList = HttpModeImports
		break
	case T_RUN_MODE.WORKER:
		AdminImportsList = []
		break
	case T_RUN_MODE.KAFKA:
		AdminImportsList = []
		break
	case T_RUN_MODE.GRPC:
		AdminImportsList = []
		break
	/* Может быть undefined при запуске приложения без docker  */
	default:
		AdminImportsList = HttpModeImports
}

export const AdminImports = AdminImportsList
