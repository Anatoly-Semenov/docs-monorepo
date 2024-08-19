import { Inject, Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"

import { SystemsServiceDb } from "@docs/common/db/services/systems-service/systems.service"

import {
	CONFIG__SA_PASSWORD,
	CONFIG__SA_USERNAME
} from "@docs/shared/constants/config.constants"
import { IOC__SERVICE__SYSTEMS_DB } from "@docs/shared/constants/ioc.constants"

import { UrlDomainResolverHelper } from "@docs/shared/helpers/url-domain-resolver.helper"

import { SystemTokenRequestDto } from "@docs/shared/dto/v1/system-token.dto"

import { IJwtAccessTokenResponse } from "@docs/shared/interfaces/jwt-payload.interface"

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name)

	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,

		@Inject(IOC__SERVICE__SYSTEMS_DB)
		private readonly systemService: SystemsServiceDb
	) {}

	public validateServiceToken(username: string, password: string): boolean {
		this.logger.log("Валидация сервис-аккаунта")

		const definedServiceAccountUsername =
			this.configService.get<string>(CONFIG__SA_USERNAME)
		const definedServiceAccountPassword =
			this.configService.get<string>(CONFIG__SA_PASSWORD)

		const isCredsValid =
			username === definedServiceAccountUsername &&
			password === definedServiceAccountPassword

		if (isCredsValid) {
			this.logger.log("Успешная авторизация в сервис-аккаунт")
		} else {
			this.logger.warn("Неуспешная авторизация в сервис-аккаунт")
		}

		return isCredsValid
	}

	public async getTokenForSystem(
		tokenRequestDto: SystemTokenRequestDto
	): Promise<IJwtAccessTokenResponse> {
		const { system_name } = tokenRequestDto
		const system_link = UrlDomainResolverHelper(tokenRequestDto.system_link)

		this.logger.log(`Запрос выдачи токена для системы:
		link: ${system_link}
		name: ${system_name}`)

		this.logger.log("Проверяю зарегистрирована ли у нас эта система")
		let systemInstance = await this.systemService.getByLink(system_link)

		if (systemInstance) {
			this.logger.warn(
				`Система ${system_link} уже зарегистрирована id: ${systemInstance.id}`
			)
		} else {
			this.logger.log("Система ещё не зарегистрирована, создаю запись")
			systemInstance = await this.systemService.create({
				link: system_link,
				name: system_name
			})
			this.logger.log(`Создана новая система: ${systemInstance.id}`)
		}

		this.logger.log(`Выдаю токен для системы ${systemInstance.id}`)
		const payload = {
			system_id: systemInstance.id
		}
		const secret = this.configService.getOrThrow("JWT_ACCESS_SECRET")

		return {
			accessToken: this.jwtService.sign(payload, {
				secret
			})
		}
	}

	public getSystemByToken(token: string): string {
		return this.jwtService.decode(token)
	}
}
