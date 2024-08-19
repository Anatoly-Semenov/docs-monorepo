import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"

import { DbModule } from "@docs/common/db/db.module"

import { AuthProvider } from "./auth-service/auth.provider"

import { ServiceAccountStrategy } from "./service-account.strategy"

import { SystemAccountStrategy } from "./system-account.strategy"

@Module({
	imports: [PassportModule, ConfigModule, JwtModule, DbModule],
	providers: [ServiceAccountStrategy, SystemAccountStrategy, AuthProvider],
	exports: [AuthProvider, JwtModule]
})
export class AuthModule {}
