import {
	AxiosError,
	AxiosRequestConfig,
	AxiosResponse,
	HttpStatusCode,
	ResponseType
} from "axios"
import { catchError, firstValueFrom } from "rxjs"

import { HttpService } from "@nestjs/axios"
import {
	BadRequestException,
	HttpException,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	UnauthorizedException
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { RedisClientService } from "../redis/redis-client.service"
import { IOperatorDataExpand } from "@docs/shared/interfaces/services/db/operators-service.interfaces"
import { IDiadocStatus } from "@docs/shared/interfaces/services/docs-service.interfaces"

import {
	DIADOC_API_URL,
	DIADOC_ARCHIVE_DOWNLOAD,
	DIADOC_ARCHIVE_PREPARE,
	DIADOC_AUTH_LOGIN,
	DIADOC_AUTH_PASSWORD,
	DIADOC_AUTH_PATH,
	DIADOC_CHECK_CAN_DELETE_PATH,
	DIADOC_CHECK_STATUS_PATH,
	DIADOC_DELETE_DOCUMENT_PATH,
	DIADOC_DEV_KEY,
	DIADOC_GET_ORGANIZATION_FEATURES,
	DIADOC_GET_ORGANIZATIONS_INN_KPP_PATH,
	DIADOC_GET_ORGANIZATIONS_INN_LIST_PATH,
	DIADOC_GET_ROAMING_OPERATORS_PATH,
	DIADOC_PRINTING_FORMS_PATH,
	DIADOC_SEND_DOCUMENT_PATH,
	DIADOC_SEND_TEMPLATE_DOCUMENT_PATH,
	DIADOC_TOKEN_TTL,
	GET_ROAMING_BOX_ID,
	RETRY__DELAY_MILLISECONDS
} from "@docs/shared/constants/config.constants"
import { IOC__SERVICE__CLIENT_PROVIDER_REDIS } from "@docs/shared/constants/ioc.constants"

import { Sentry } from "@docs/shared/decorators/sentry.decorator"

import { OrganizationFeatureResponseDto } from "@docs/shared/dto/diadoc/organization-features.response.dto"
import {
	SendDocumentToDiadocDto,
	SendTemplateToDiadocDto
} from "@docs/shared/dto/v1"

import {
	IDiadocEvent,
	IDiadocEventData,
	IDiadocEventResponse,
	IDiadocGetOrganizationBoxIdByInnKppResponse,
	IDiadocSendResponse,
	IDiadocStatusUpdateRequestBody,
	IDiadocTemplateResponse,
	IInnKppParams,
	IOrganizationFeaturesWrapper
} from "@docs/shared/interfaces/client/diadoc.interfaces"
import { IDiadocOrganizationContainer } from "@docs/shared/interfaces/mdm/organizations.interfaces"

import { OrganizationFeature } from "@docs/shared/enums/organization.enum"

import { Http } from "@docs/shared/types"

@Injectable()
@Sentry
export class DiadocClientService {
	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_REDIS)
		private readonly redisClientService: RedisClientService
	) {}

	private readonly logger = new Logger(DiadocClientService.name)
	private readonly diadocApiUrl = this.configService.getOrThrow(DIADOC_API_URL)

	/**
	 * Основная функция для выполнения запросов к Диадок
	 * @param method
	 * @param diadocPath путь
	 * @param options дополнительные опции (path, responseType, params, body)
	 */
	async generateRequest<T = any>(
		method: Http.Method,
		diadocPath: string,
		options?: {
			responseType?: ResponseType
			params?: object
			path?: string
			body?: object
		}
	): Promise<T> {
		let countOfRetry: number = 0
		const retryTimes: number =
			+this.configService.getOrThrow("RETRY__TIMES") || 3

		const requestWithRetry = async <T = any>(
			countOfRetryLeft: number = 3
		): Promise<T> => {
			let diadocToken: string = await this.redisClientService.get("ddToken")

			if (!diadocToken) {
				diadocToken = await this.getDiadocToken()
			}

			const devKey: string = this.configService.getOrThrow(DIADOC_DEV_KEY)

			const authHeader: string = `DiadocAuth ddauth_api_client_id=${devKey},ddauth_token=${diadocToken}`
			const baseURL: string = `${this.diadocApiUrl}/${diadocPath}/${options?.path ?? ""}`

			if (countOfRetry) {
				this.logger.log(
					`Попытка ${countOfRetry} из ${retryTimes} | Повторяю запрос [${method}] ${baseURL}`
				)
			}

			const requestConfig: AxiosRequestConfig = {
				method,
				baseURL,
				data: options.body,
				params: options.params,
				responseType: options?.responseType ?? "json"
			}

			this.logger.log(`Запрос в diadoc: ${JSON.stringify(requestConfig)}`)

			requestConfig.headers = {
				Authorization: authHeader,
				Accept: "application/json"
			}

			try {
				// @ts-ignore
				const response: AxiosResponse = await firstValueFrom(
					this.httpService.request(requestConfig).pipe(
						catchError(async (error: AxiosError) => {
							if (countOfRetryLeft) {
								const delay: number =
									+this.configService.getOrThrow(RETRY__DELAY_MILLISECONDS) ||
									2_500

								await new Promise((resolve) => setTimeout(resolve, delay))

								countOfRetry++

								requestWithRetry(countOfRetryLeft - 1)
							} else {
								const message: string = `Ошибка обработки запроса Диадок: ${error.message} ${error.status}`

								this.logger.error(message)
								throw error
							}
						})
					)
				)

				if (!response?.data) {
					const errorMessage: string = `Диадок не прислал данные: response = ${JSON.stringify(response)} requestConfig = ${JSON.stringify(requestConfig)}`
					this.logger.error(errorMessage)
					throw new InternalServerErrorException(errorMessage)
				}

				const { data, headers } = response

				this.logger.log(
					`Ответ от diadoc по запросу ${requestConfig.method} ${requestConfig.baseURL}: ${JSON.stringify(data)}`
				)

				return {
					data,
					headers
				} as T
			} catch (error) {
				this.logger.error(
					`Ошибка при считывании Ответа от Диадок: ${error?.message} ${error?.response?.data}`
				)
				throw new HttpException(
					`Ошибка запроса к Диадок: ${error?.message} ${error?.response?.data}`,
					+error.code || HttpStatusCode.InternalServerError
				)
			}
		}

		return await requestWithRetry(retryTimes)
	}

	async getOrganizationBoxIdByInnList(
		inn: string[],
		orgIdDiadoc: string
	): Promise<IDiadocOrganizationContainer> {
		const diadocPath: string = this.configService.getOrThrow(
			DIADOC_GET_ORGANIZATIONS_INN_LIST_PATH
		)

		try {
			const diadocResponse: IDiadocGetOrganizationBoxIdByInnKppResponse =
				await this.generateRequest(Http.Method.POST, diadocPath, {
					body: {
						innList: inn
					},
					params: {
						myOrgId: orgIdDiadoc
					},
					responseType: "json"
				})

			return diadocResponse.data
		} catch (e) {
			const errMessage = `Ошибка запроса boxId по списку ИНН: inn=${JSON.stringify(inn)}, orgIdDiadoc=${orgIdDiadoc}, err=${e.message}`

			this.logger.error(errMessage)
			throw new InternalServerErrorException(errMessage)
		}
	}

	/**
	 * Получение boxId организации
	 * @param inn ИНН
	 * @param kpp КПП (опционально)
	 * @returns Promise<IDidadocOrganizationWrapper>
	 */
	async getOrganizationBoxIdByInnKpp(
		inn: string,
		kpp?: string
	): Promise<IDiadocOrganizationContainer> {
		const diadocPath: string = this.configService.getOrThrow(
			DIADOC_GET_ORGANIZATIONS_INN_KPP_PATH
		)

		const params: IInnKppParams = {
			inn
		}

		if (kpp) params.kpp = kpp

		const diadocResponse: IDiadocGetOrganizationBoxIdByInnKppResponse =
			await this.generateRequest(Http.Method.GET, diadocPath, { params })

		return diadocResponse.data
	}

	/**
	 * Запрос на авторизацию в Диадок и получение токена
	 * @returns Promise<string>
	 */
	async getDiadocToken(): Promise<string> {
		this.logger.log("Запущено обновление токена Диадок")
		const devKey: string = this.configService.getOrThrow(DIADOC_DEV_KEY)
		const diadocLogin: string = this.configService.getOrThrow(DIADOC_AUTH_LOGIN)
		const diadocPassword: string =
			this.configService.getOrThrow(DIADOC_AUTH_PASSWORD)
		const diadocPath: string = this.configService.getOrThrow(DIADOC_AUTH_PATH)

		const headers = {
			Authorization: `DiadocAuth ddauth_api_client_id=${devKey}`
		}

		const authBody = {
			login: diadocLogin,
			password: diadocPassword
		}

		const { data } = await firstValueFrom(
			this.httpService
				.request({
					method: "post",
					baseURL: `${this.diadocApiUrl}/${diadocPath}`,
					params: {
						type: "password"
					},
					headers,
					data: authBody
				})
				.pipe(
					catchError((err: AxiosError) => {
						this.logger.error(
							`Ошибка при выполнении запроса на авторизацию в Диадок: ${err.response.data}`
						)
						throw new UnauthorizedException(
							`Ошибка при выполнении запроса на авторизацию в Диадок: ${err.response.data}`
						)
					})
				)
		)

		this.logger.log(`Авторизация в Диадок завершена`)

		const tokenTtl: string = this.configService.getOrThrow(DIADOC_TOKEN_TTL)

		await this.redisClientService.setWithCustomTtl("ddToken", data, +tokenTtl)

		return data as string
	}

	/**
	 * Запрос на отправку сформированного документа и файлов в Диадок
	 * @param documentDto сформированный DTO с необходимыми для Диадок данными
	 * @param isTemplate флаг шаблона
	 * @returns данные от Диадок (diadocResponse)
	 */
	async sendDocumentToDiadoc(
		documentDto: SendDocumentToDiadocDto,
		isTemplate: boolean = false
	): Promise<IDiadocSendResponse> {
		type Response = { data: IDiadocSendResponse }

		const diadocPath: string = this.configService.getOrThrow(
			isTemplate
				? DIADOC_SEND_TEMPLATE_DOCUMENT_PATH
				: DIADOC_SEND_DOCUMENT_PATH
		)

		const diadocResponse: Response = await this.generateRequest<Response>(
			Http.Method.POST,
			diadocPath,
			{
				body: documentDto
			}
		)

		return diadocResponse.data
	}

	/**
	 * Запрос на отправку сформированного шаблрна и файлов в Диадок
	 * @param body сформированный DTO с необходимыми для Диадок данными
	 * @returns данные от Диадок (IDiadocTemplateResponse)
	 */
	async sendTemplateToDiadoc(
		body: SendTemplateToDiadocDto
	): Promise<IDiadocTemplateResponse> {
		type Response = { data: IDiadocTemplateResponse }

		const diadocPath: string = this.configService.getOrThrow(
			DIADOC_SEND_TEMPLATE_DOCUMENT_PATH
		)

		const diadocResponse: Response = await this.generateRequest<Response>(
			Http.Method.POST,
			diadocPath,
			{ body }
		)

		return diadocResponse.data
	}

	/**
	 * Запрос на подготовку/получение печатной формы из Диадок
	 * @param boxId boxId контрагента
	 * @param messageId значение messages_id из БД
	 * @param documentId значение diadoc_id из БД
	 * @returns файл или true, если файл ещё не готов
	 */
	async getPrintingForms(boxId: string, messageId: string, documentId: string) {
		this.logger.log(
			`Выполняется запрос к Диадок для формирования(загрузки) ПФ (messageId:${messageId}, documentId:${documentId})`
		)
		const diadocPath: string = this.configService.getOrThrow(
			DIADOC_PRINTING_FORMS_PATH
		)

		const params = {
			BoxId: boxId,
			messageId,
			documentId
		}

		const response = await this.generateRequest(Http.Method.GET, diadocPath, {
			params,
			responseType: "arraybuffer"
		})

		if (response?.data?.byteLength) {
			this.logger.log(
				`Получен файл (messageId:${messageId}, documentId:${documentId})`
			)

			return response
		}

		this.logger.log(
			`Запрос на формирование принят (messageId:${messageId}, documentId:${documentId})`
		)

		return true
	}

	/**
	 * Запрос на получение ссылки на архив
	 * @param boxId
	 * @param messageId
	 * @param documentId
	 * @returns ссылка или true, если архив ещё не готов
	 */
	async getArchiveLink(
		boxId: string,
		messageId: string,
		documentId: string
	): Promise<string> {
		this.logger.log("Выполняется запрос к Диадок для формирования Архивов")
		const diadocPath: string = this.configService.getOrThrow(
			DIADOC_ARCHIVE_PREPARE
		)

		const params = {
			BoxId: boxId,
			messageId,
			documentId,
			fullDocflow: true
		}

		const response = await this.generateRequest(Http.Method.GET, diadocPath, {
			params,
			responseType: "json"
		})

		if (!response?.data?.ZipFileNameOnShelf) {
			this.logger.log("Не получена ссылка на файл-архива")

			return ""
		}

		return response.data.ZipFileNameOnShelf as string
	}

	/**
	 * Загрузка архива по подготовленной ссылке
	 * @param zipLink подготовленная ссылка
	 * @returns файл архива
	 */
	async getArchiveFile(zipLink: string) {
		this.logger.log("Выполняется запрос на загрузку архива из Диадок")
		const diadocPath: string = this.configService.getOrThrow(
			DIADOC_ARCHIVE_DOWNLOAD
		)

		const params = {
			nameOnShelf: zipLink
		}

		const response = await this.generateRequest(Http.Method.GET, diadocPath, {
			params,
			responseType: "arraybuffer"
		})

		if (!response?.data?.byteLength) {
			this.logger.error(`Не получен файл архива по ${zipLink}`)
			throw new InternalServerErrorException(
				"Не удалось загрузить архив из Диадок"
			)
		}

		this.logger.log("Получен файл")

		return response
	}

	/**
	 * Генерация запроса на получение списка событий
	 * @param boxId
	 * @param fromTicks стартовое значение временного диапазона
	 * @param toTicks конечное значение временного диапазона
	 * @param AfterIndexKey Ключ индекса события, с которого идет запрос
	 * @returns Promise<IDiadocEventResponse>
	 */
	generateGetEventRequest(
		boxId: string,
		fromTicks: string,
		toTicks: string,
		AfterIndexKey: IDiadocStatusUpdateRequestBody["AfterIndexKey"] = null
	): Promise<IDiadocEventResponse> {
		const diadocPath: string = this.configService.getOrThrow(
			DIADOC_CHECK_STATUS_PATH
		)

		const body: IDiadocStatusUpdateRequestBody = {
			Filter: {
				FromTimeStamp: {
					ticks: fromTicks
				},
				ToTimeStamp: {
					ticks: toTicks
				}
			},

			PopulatePreviousDocumentStates: false,
			DocumentDirections: "Outbound",
			InjectEntityContent: false,
			PopulateDocuments: true,
			AfterIndexKey
		}

		return this.generateRequest<IDiadocEventResponse>(
			Http.Method.POST,
			diadocPath,
			{
				params: {
					boxId
				},
				body
			}
		)
	}

	checkByResponse(
		response: any,
		fields: {
			[key: string]: any
		}
	): void {
		let fieldsMessage: string = ""

		let messageIteration: number = 1
		const fieldsNumber: number = Object.keys(fields).length

		for (const [key, value] of Object.entries(fields)) {
			if (messageIteration !== 1) {
				fieldsMessage += "        "
			}

			fieldsMessage += `${key}: ${value}`

			if (messageIteration !== fieldsNumber) {
				fieldsMessage += "\n"
			}

			messageIteration++
		}

		if (!response || !response?.data) {
			this.logger.error(`Ошибка запроса к Диадок:
        ${fieldsMessage}
        response: ${JSON.stringify(response)}
      `)
			throw new InternalServerErrorException("Ошибка запроса к Диадок")
		}
	}

	/**
	 * Запрос на обновление статусов документов
	 * @param boxId
	 * @param fromTicks стартовое значение временного диапазона
	 * @param toTicks конечное значение временного диапазона
	 * @param orgId идентификатор организации
	 * @returns false если обновлений нет или IDiadocEventData если
	 * обновления есть
	 */
	async getLastUpdatedStatus(
		boxId: string,
		fromTicks: string,
		toTicks: string,
		orgId: string
	): Promise<false | IDiadocEventData> {
		this.logger.log(
			`Запрашиваю события из diadok fromTicks=${fromTicks}, toTicks=${toTicks}, boxId=${boxId}, orgId=${orgId} page=1, total=unknown`
		)
		const response: IDiadocEventResponse = await this.generateGetEventRequest(
			boxId,
			fromTicks,
			toTicks
		)

		const responseData: IDiadocEventData = {
			Events: response.data.Events.filter((event: IDiadocEvent) => {
				return event.Document.DocumentInfo.DocumentDirection === "Outbound"
			}),
			TotalCount: response.data.TotalCount,
			TotalCountType: response.data.TotalCountType
		}

		if (!responseData.Events || !responseData.Events.length) {
			this.logger.log(
				`Нет произошедших событий в данный промежуток времени (boxId:${boxId}, fromTicks:${fromTicks}, toTicks:${toTicks})`
			)
			return false
		} else {
			this.logger.warn(
				`Есть произошедшие события: ${responseData.Events.length} событий, boxId:${boxId}, fromTicks:${fromTicks}, toTicks:${toTicks}`
			)
		}

		return responseData
	}

	/**
	 * Общая функция для запросов GetMessage (получение статуса по файлу)
	 * @param boxId box_id организации-отправителя
	 * @param messageId message_id файла
	 * @returns Promise<IDiadocSendResponse>
	 */
	private async generateGetStatusRequest(
		boxId: string,
		messageId: string
	): Promise<IDiadocSendResponse> {
		try {
			const response: { data: IDiadocSendResponse } =
				await this.generateRequest(
					Http.Method.GET,
					this.configService.getOrThrow(DIADOC_CHECK_CAN_DELETE_PATH),
					{
						responseType: "json",
						params: {
							boxId,
							messageId,
							injectEntityContent: false
						}
					}
				)

			if (response?.data) {
				return response.data
			} else {
				const errorMessage: string = `Не получены данные по запросу GetMessage (boxId:${boxId}, messageId:${messageId})`
				this.logger.error(errorMessage)
				throw new InternalServerErrorException(errorMessage)
			}
		} catch (error) {
			const errorMessage: string = `Ошибка при выполнении запроса GetMessage (boxId:${boxId}, messageId:${messageId}): ${error.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	/**
	 * Получение текущего статуса документа
	 * @param boxId boxId организации-отправителя
	 * @param messageId message_id, полученный от Диадок при публикации
	 * @returns IDiadocStatus
	 */
	public async getCurrentStatus(
		boxId: string,
		messageId: string
	): Promise<IDiadocStatus> {
		try {
			const response: IDiadocSendResponse = await this.generateGetStatusRequest(
				boxId,
				messageId
			)

			const primaryStatus: IDiadocStatus =
				response?.Entities[0]?.DocumentInfo?.DocflowStatus?.PrimaryStatus

			if (!primaryStatus) {
				const errorMessage: string = `Не получен статус от Диадок\nboxId:${boxId}\nmessageId:${messageId}`
				this.logger.error(errorMessage)
				throw new InternalServerErrorException(errorMessage)
			}

			return primaryStatus
		} catch (e) {
			const errorMessage = `Возникла ошибка при получении статуса документа:\nboxId:${boxId}\nmessageId:${messageId}\nerror:${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	/**
	 * Удаление документа в Диадок
	 * @param boxId boxId организации-отправителя
	 * @param messageId message_id, полученный при публикации
	 * @returns
	 */
	async deleteFromDiadoc(boxId: string, messageId: string): Promise<boolean> {
		try {
			await this.generateRequest(
				Http.Method.POST,
				this.configService.getOrThrow(DIADOC_DELETE_DOCUMENT_PATH),
				{
					params: {
						boxId,
						messageId
					}
				}
			)

			return true
		} catch (e) {
			const errorMessage = `Ошибка запроса на удаление в Диадок:\nboxId:${boxId}\nmessageId:${messageId}\nerror:${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	async getRoamingOperators(): Promise<IOperatorDataExpand[]> {
		this.logger.log("Начинаю запрос роуминговых операторов")
		const boxId: string =
			this.configService.getOrThrow<string>(GET_ROAMING_BOX_ID)

		this.logger.log(
			`Для запроса роуминговых операторов используется boxId=${boxId}`
		)

		const response: AxiosResponse = await this.generateRequest(
			Http.Method.GET,
			this.configService.getOrThrow(DIADOC_GET_ROAMING_OPERATORS_PATH),
			{
				params: {
					boxId
				}
			}
		)

		if (!response?.data?.RoamingOperators) {
			const errorMessage: string = `Не получен список роуминговых операторов от Диадок`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}

		return response.data.RoamingOperators
	}

	/**
	 * Проверка удаления файла в Диадок
	 * @param boxId box_id организации-отправителя
	 * @param messageId message_id файла
	 * @returns Promise<boolean>
	 */
	public async checkIsDeletedInDiadoc(
		boxId: string,
		messageId: string
	): Promise<boolean> {
		this.logger.log(
			`Проверка удаления файла в Диадок: boxId:${boxId} messageId:${messageId}`
		)
		const diadocStatuses: IDiadocSendResponse =
			await this.generateGetStatusRequest(boxId, messageId)

		const isDeleted: boolean = diadocStatuses?.IsDeleted || false

		this.logger.log(
			`Результат проверки удаления файла в Диадок: boxId:${boxId} messageId:${messageId} isDeleted: ${isDeleted}`
		)

		return isDeleted
	}

	public async getOrganizationFeatures(
		boxId: string
	): Promise<OrganizationFeature[]> {
		const diadocPath: string = this.configService.getOrThrow<string>(
			DIADOC_GET_ORGANIZATION_FEATURES
		)

		try {
			const diadocResponse: OrganizationFeatureResponseDto =
				new OrganizationFeatureResponseDto(
					await this.generateRequest<IOrganizationFeaturesWrapper>(
						Http.Method.GET,
						diadocPath,
						{
							params: {
								boxId
							}
						}
					)
				)

			const features: OrganizationFeature[] = diadocResponse?.data?.Features

			if (!features) {
				const errorMessage: string = `Получены некорректные данные от Диадок на запрос ${diadocPath}, boxId: ${boxId}`
				this.logger.error(errorMessage)
				throw new InternalServerErrorException(errorMessage)
			}

			return features
		} catch (error) {
			const errorMessage: string = `Диадок не предоставил данные о разрешениях этой организации`
			this.logger.error(errorMessage)
			throw new BadRequestException(errorMessage)
		}
	}
}
