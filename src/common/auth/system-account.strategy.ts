import {
	Inject,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"

import { ExtractJwt, Strategy } from "passport-jwt"

import { SystemsServiceDb } from "@docs/common/db/services/systems-service/systems.service"

import { GUARD__SYSTEM_ACCOUNT_BASIC } from "@docs/shared/constants/guard.constants"
import { IOC__SERVICE__SYSTEMS_DB } from "@docs/shared/constants/ioc.constants"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

@Injectable()
export class SystemAccountStrategy extends PassportStrategy(
	Strategy,
	GUARD__SYSTEM_ACCOUNT_BASIC
) {
	constructor(
		private readonly configService: ConfigService,

		@Inject(IOC__SERVICE__SYSTEMS_DB)
		private readonly systemsService: SystemsServiceDb
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: configService.getOrThrow("JWT_ACCESS_SECRET")
		})
	}

	private readonly logger = new Logger(SystemAccountStrategy.name)

	async validate(payload: IJwtPayloadSystem) {
		try {
			await this.systemsService.getById(payload.system_id)

			return payload
		} catch (e) {
			if (e instanceof NotFoundException) {
				this.logger.error(
					`Ошибка авторизации для системы system_id=${payload.system_id}`
				)
				throw new UnauthorizedException("Ошибка авторизации системы")
			} else {
				throw e
			}
		}
	}
}
