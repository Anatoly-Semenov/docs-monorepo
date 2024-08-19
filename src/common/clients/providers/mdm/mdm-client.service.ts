import { AxiosError, AxiosRequestConfig, HttpStatusCode } from "axios"
import _cloneDeep from "lodash"
import { catchError, firstValueFrom } from "rxjs"

import { HttpService } from "@nestjs/axios"
import { HttpException, Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import {
	CONFIG__MDM_COUNTERPARTIES_PATH,
	CONFIG__MDM_ORGANIZATION_PATH,
	RETRY__DELAY_MILLISECONDS
} from "@docs/shared/constants/config.constants"

import { Sentry } from "@docs/shared/decorators/sentry.decorator"

import { IMdmOrganizationResponse } from "@docs/shared/interfaces/mdm/organizations.interfaces"
import { IMdmPartnerResponse } from "@docs/shared/interfaces/mdm/partners.interfaces"

import { Http } from "@docs/shared/types"

@Injectable()
@Sentry
export class MdmClientService {
	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {}

	private readonly logger = new Logger(MdmClientService.name)

	async generateRequest<T = any>(
		method: Http.Method,
		mdmPath: string,
		params: object,
		path: string = ""
	): Promise<T> {
		let countOfRetry: number = 0

		const retryTimes: number =
			+this.configService.getOrThrow("RETRY__TIMES") || 3

		const requestWithRetry = async <T = any>(
			countOfRetryLeft: number = 3
		): Promise<T> => {
			const mdmUrl: string = this.configService.getOrThrow("MDM_URL")
			const mdmLogin: string = this.configService.getOrThrow("MDM_LOGIN")
			const mdmPassword: string = this.configService.getOrThrow("MDM_PASSWORD")

			const baseURL: string = `${mdmUrl}/${mdmPath}/${path}`

			if (countOfRetry) {
				this.logger.log(
					`Попытка ${countOfRetry} из ${retryTimes} | Повторяю запрос [${method}] ${baseURL}\n\n[params]: ${JSON.stringify(params, null, 2)}`
				)
			}

			const requestConfig: AxiosRequestConfig = {
				baseURL,
				method,
				params
			}

			this.logger.log(`Запрос в mdm: ${JSON.stringify(requestConfig)}`)

			requestConfig.auth = {
				username: mdmLogin,
				password: mdmPassword
			}

			try {
				// @ts-ignore
				const { data } = await firstValueFrom(
					this.httpService.request(requestConfig).pipe(
						// @ts-ignore
						catchError(async (error: AxiosError) => {
							if (countOfRetryLeft) {
								const delay: number =
									+this.configService.getOrThrow(RETRY__DELAY_MILLISECONDS) ||
									2_500

								await new Promise((resolve) => setTimeout(resolve, delay))

								countOfRetry++

								requestWithRetry(countOfRetryLeft - 1)
							} else {
								this.logger.error(
									`Ошибка при считывании Организаций: ${error.message} ${error.response.data}`
								)

								throw error
							}
						})
					)
				)

				this.logger.log(
					`Ответ от mdm по запросу ${requestConfig.method} ${requestConfig.baseURL}: ${JSON.stringify(data)}`
				)

				return data
			} catch (error) {
				throw new HttpException(
					`Ошибка запроса к MDM: ${error.response.data}`,
					+error.code || HttpStatusCode.InternalServerError
				)
			}
		}

		return await requestWithRetry(retryTimes)
	}

	async getOrganizations(
		take: number,
		page: number
	): Promise<IMdmOrganizationResponse> {
		const mdmOrganizationsPath = this.configService.getOrThrow(
			CONFIG__MDM_ORGANIZATION_PATH
		)
		const params: object = {
			qt: take,
			page
		}

		return await this.generateRequest<IMdmOrganizationResponse>(
			Http.Method.GET,
			mdmOrganizationsPath,
			params
		)
	}

	async getCounterparties(
		take: number,
		page: number
	): Promise<IMdmPartnerResponse> {
		const path = this.configService.getOrThrow(CONFIG__MDM_COUNTERPARTIES_PATH)
		const params: object = {
			qt: take,
			page
		}

		return await this.generateRequest<IMdmPartnerResponse>(
			Http.Method.GET,
			path,
			params
		)
	}
}
