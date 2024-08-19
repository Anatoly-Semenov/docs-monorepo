import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException
} from "@nestjs/common"

import { DiadocClientService } from "@docs/common/clients/providers/diadoc/diadoc-client.service"
import { MdmClientService } from "@docs/common/clients/providers/mdm/mdm-client.service"

import { OrganizationServiceDb } from "@docs/common/db/services/organizations/organization.service"
import { CounterpartyServiceDb } from "@docs/common/db/services/сounterparty-service/counterparty.service"
import { ICounterpartyData } from "@docs/shared/interfaces/services/docs-service.interfaces"
import {
	IBoxIdResult,
	IMdmService
} from "@docs/shared/interfaces/services/mdm-service.interfaces"

import {
	IOC__SERVICE__CLIENT_PROVIDER_DIADOC,
	IOC__SERVICE__CLIENT_PROVIDER_MDM,
	IOC__SERVICE__COUNTERPARTY_DB,
	IOC__SERVICE__ORGANIZATION_DB
} from "@docs/shared/constants/ioc.constants"

import {
	MdmOrganizationMapper,
	MdmPartnersMapper
} from "@docs/shared/helpers/mdm-mappers.helper"

import { isEnum } from "class-validator"

import { Counterparty } from "@docs/common/db/entities/counterparty.entity"
import { Organizations } from "@docs/common/db/entities/organizations.entity"

import { OrganizationsDto } from "@docs/shared/dto/v1/db-dto/organizations.dto"

import { ICounterparty } from "@docs/shared/interfaces/mdm/counterparty.interface"
import {
	IDiadocOrganizationContainer,
	IDidadocOrganization,
	IMdmOrganization,
	IMdmOrganizationResponse,
	IMdmOrganizationsStoreData
} from "@docs/shared/interfaces/mdm/organizations.interfaces"
import {
	IMdmPartner,
	IMdmPartnerResponse
} from "@docs/shared/interfaces/mdm/partners.interfaces"

import {
	CounteragentStatuses,
	NotReadyCounteragentStatuses
} from "@docs/shared/enums/mdm.enum"

type FetchMdmResponse =
	| { data: ICounterparty[]; page: number; pages: number }
	| undefined

@Injectable()
export class MdmService implements IMdmService {
	constructor(
		@Inject(IOC__SERVICE__ORGANIZATION_DB)
		private readonly organizationServiceDb: OrganizationServiceDb,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_MDM)
		private readonly mdmClientService: MdmClientService,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_DIADOC)
		private readonly diadocClientService: DiadocClientService,

		@Inject(IOC__SERVICE__COUNTERPARTY_DB)
		private readonly counterpartyServiceDb: CounterpartyServiceDb
	) {}

	private readonly logger = new Logger(MdmService.name)

	/**
	 * Загрузка организаций от MDM
	 * @param startPage стартовая страница
	 * @returns Promise<string>
	 */
	async loadOrganizations(startPage: number = 1): Promise<string> {
		this.logger.log("Загрузка организаций")
		const take: number = 50

		let page: number = startPage
		let pages: number = 1

		do {
			this.logger.log(`Запрос организаций, страница ${page}`)
			const chunk: IMdmOrganizationResponse =
				await this.mdmClientService.getOrganizations(take, page)

			if (!chunk) {
				this.logger.error(
					`Не получен chunk данных об организациях от МДМ, take=${take} page=${page}`
				)
				throw new InternalServerErrorException("Ошибка получения данных от MDM")
			}

			page++
			pages = chunk.paging.pages

			if (chunk?.data) {
				const mdmOrganizationData: IMdmOrganizationsStoreData[] =
					MdmOrganizationMapper(chunk.data)

				// @ts-ignore
				await this.organizationServiceDb.bulkCreate(mdmOrganizationData)
			} else {
				this.logger.log(
					`Запрос организаций, страница ${page} пришла с пустыми данными`
				)
			}
		} while (page <= pages)

		return "Организации успешно подтянуты из МДМ"
	}

	/**
	 * Загрузка контрагентов от MDM
	 * @param startPage стартовая страница
	 * @returns Promise<string>
	 */
	async loadCounterparties(startPage: number = 1): Promise<string> {
		this.logger.log("Подгружаю справочник контрагентов из МДМ")
		const take: number = 50

		let page: number = startPage
		let pages: number = 1

		do {
			const response: FetchMdmResponse = await this.fetchCounterpartiesFromMdm(
				page,
				pages,
				take
			)

			if (response) {
				pages = response.pages
				page = response.page

				if (response?.data) {
					try {
						await this.counterpartyServiceDb.saveList(response.data)
					} catch (error) {
						this.logger.error(
							`Ошибка сохранения списка контрагентов на странице ${page}, перехожу к следующей странице`
						)
					}
				}
			} else {
				page++
			}
		} while (page <= pages)

		const successMessage: string =
			"Справочник контрагентов из МДМ успешно подгружен"

		this.logger.log(successMessage)

		return successMessage
	}

	private async fetchCounterpartiesFromMdm(
		page: number,
		pages: number,
		take: number
	): Promise<FetchMdmResponse> {
		this.logger.log(
			`Запрос контрагентов, страница ${page} из ${pages} с размером ${take} штук`
		)
		let chunk: IMdmPartnerResponse

		try {
			chunk = await this.mdmClientService.getCounterparties(take, page)
		} catch (error) {
			this.logger.error(
				"Не получилось подгрузить справочник контрагентов из МДМ\nзапрашиваю следующую страницу"
			)
			return
		}

		if (!chunk) {
			this.logger.error(
				`Не получен chunk данных об контрагентах от МДМ, take=${take} page=${page}\nзапрашиваю следующую страницу`
			)
			return
		}

		page++
		pages = chunk.paging.pages

		try {
			return { data: MdmPartnersMapper(chunk.data), page, pages }
		} catch (error) {
			const message: string =
				"Ошибка преобразования данных из mdm в формат базы данных"

			this.logger.error(message)
			throw new InternalServerErrorException(message)
		}
	}

	/**
	 * Получение boxId и boxIdGuid организации
	 * @param id внутренний ID организации
	 * @returns Promise<IBoxIdResult>
	 */
	async getBoxIdOrganization(id: string): Promise<IBoxIdResult> {
		this.logger.log(`Проверяю boxId для организации ID: ${id}`)
		const orgEntity = await this.organizationServiceDb.getById(id)

		if (orgEntity.box_id && orgEntity.box_id_guid && orgEntity.org_id_diadoc) {
			this.logger.log(`Найден boxId в БД ${orgEntity.box_id}`)
			return {
				boxId: orgEntity.box_id,
				boxIdGuid: orgEntity.box_id_guid,
				orgIdDiadoc: orgEntity.org_id_diadoc
			}
		}

		if (this.checkUl(orgEntity)) {
			this.logger.log("Обрабатываю как ЮЛ")

			if (orgEntity.kpp) {
				return this.checkByInnKpp(orgEntity.inn, orgEntity.kpp, orgEntity)
			} else {
				this.logger.log("КПП остутствует")
				return this.checkByInn(orgEntity.inn, orgEntity)
			}
		} else {
			this.logger.log("Обрабатываю НЕ как ЮЛ")

			return this.checkByInn(orgEntity.inn, orgEntity)
		}
	}

	/**
	 * Получение boxId для внешних систем
	 * @param inn ИНН
	 * @returns Promise<string>
	 */
	async getBoxIdOuterSystem(
		inn: string,
		orgIdDiadoc: string,
		isRoaming: boolean
	): Promise<string> {
		try {
			// TODO: Перепроверить интерфейсы ответов по организациям
			this.logger.log(`Запрос boxId получателя по ИНН: ${inn}`)
			const organizationsWrapper: IDiadocOrganizationContainer =
				await this.diadocClientService.getOrganizationBoxIdByInnList(
					[inn],
					orgIdDiadoc
				)

			this.logger.log(
				`Начинаю выбор аккаунта\ninn=${inn}\norgIdDiadoc=${orgIdDiadoc}\nisRoaming=${isRoaming}`
			)
			switch (organizationsWrapper.Organizations.length) {
				case 0:
					// Непредвиденная ситуация - нет ни одного аккаунта от Диадок
					const errorMessage = `Не получено аккаунтов Диадок для инн=${inn}`
					this.logger.error(errorMessage)
					throw new InternalServerErrorException(errorMessage)
				case 1:
					// Если в ответе одна организация
					this.logger.log(`Имеется только одна организация`)
					return this.getBoxIdByOneOrganization(
						organizationsWrapper.Organizations[0],
						inn
					)
				default:
					// Если в ответе несколько организаций
					this.logger.log(`Имеется несколько организаций`)
					return this.getBoxIdBySeveralOrganizations(
						organizationsWrapper.Organizations,
						inn,
						isRoaming
					)
			}
		} catch (error) {
			this.logger.error(
				`Ошибка получения boxId по ИНН = ${inn} error=${error.message}`
			)
			throw new InternalServerErrorException("Ошибка получения boxId от Диадок")
		}
	}

	private getBoxIdByOneOrganization(
		organization: IDidadocOrganization,
		inn: string
	): string {
		this.logger.log(
			`Поиск аккаунта по одной организации\norganization:${JSON.stringify(organization)}\ninn=${inn}`
		)
		const counteragentStatus: string = organization.CounteragentStatus

		if (counteragentStatus !== CounteragentStatuses.IsMyCounteragent) {
			this.logger.log("Нет статуса IsMyCounteragent")
			if (isEnum(counteragentStatus, NotReadyCounteragentStatuses)) {
				throw new BadRequestException(counteragentStatus)
			} else {
				throw new InternalServerErrorException(
					`Ошибка получения boxId для инн=(${inn})`
				)
			}
		}

		this.logger.log(
			`Возвращаю аккаунт ${organization.Organization.Boxes[0].BoxId}`
		)

		return organization.Organization.Boxes[0].BoxId
	}

	private getBoxIdBySeveralOrganizations(
		organizations: IDidadocOrganization[],
		inn: string,
		isRoaming: boolean
	): string {
		this.logger.log(
			`Поиск аккаунта из нескольких организаций\norganizations=${JSON.stringify(organizations)}\ninn=${inn}\nisRoaming=${isRoaming}`
		)

		const myCounteragents: IDidadocOrganization[] = organizations.filter(
			(organization) =>
				organization.CounteragentStatus ===
				CounteragentStatuses.IsMyCounteragent
		)

		this.logger.log(`
			myCounteragents = ${JSON.stringify(myCounteragents)}
			`)

		switch (myCounteragents.length) {
			case 0:
				// Непредвиденная ситуация - нет ни одного myCounteragent
				const errorMessage: string = `Не получено аккаунтов myCounteragent для инн=${inn}`
				this.logger.error(errorMessage)
				throw new InternalServerErrorException(errorMessage)
			case 1:
				// Если myCounteragent статус только у одного аккаунта
				this.logger.log(`myCounteragent только один`)
				this.logger.log(
					`Возвращаю аккаунт ${myCounteragents[0].Organization.Boxes[0].BoxId}`
				)
				return myCounteragents[0].Organization.Boxes[0].BoxId
			default:
				// Если myCounteragent статус у нескольких аккаунтов
				this.logger.log(
					`myCounteragent несколько, ищу по параметрам isRoaming=${isRoaming}`
				)
				const selectedCounteragent: IDidadocOrganization =
					myCounteragents.find(
						(counteragent) => counteragent.Organization.IsRoaming === isRoaming
					) ?? myCounteragents[0]

				this.logger.log(
					`Возвращаю аккаунт ${selectedCounteragent.Organization.Boxes[0].BoxId}`
				)

				return selectedCounteragent.Organization.Boxes[0].BoxId
		}
	}

	/**
	 * Проверка КА и получение их boxId
	 * @param counterparty Структура данных контрагента ICounterpartyData
	 * @param orgIdDiadoc OrgId со стороны Диадок
	 */
	async checkBoxesCounterparty(
		counterparty: ICounterpartyData,
		orgIdDiadoc: string
	): Promise<void> {
		this.logger.log(
			`Получаю контрагентов из БД по ${counterparty.ids ?? counterparty.inn}`
		)
		let counterpartyInstances: Counterparty[]

		if (counterparty.ids) {
			counterpartyInstances = await this.counterpartyServiceDb.getById(
				counterparty.ids
			)
		} else if (counterparty.inn) {
			counterpartyInstances = await this.counterpartyServiceDb.getByInn(
				counterparty.inn
			)
		} else {
			const errorMessage: string = `Не получены данные о контрагентах`
			this.logger.error(errorMessage)
			throw new BadRequestException(errorMessage)
		}

		if (!counterpartyInstances.length) {
			const message: string = `Не найдено контрагентов из БД по ${counterparty.ids ?? counterparty.inn}\``

			this.logger.error(message)
			throw new NotFoundException(message)
		}

		const innArray: string[] = counterpartyInstances.map(
			(counterparty) => counterparty.inn
		)

		this.logger.log(
			`Запрос boxId по контрагентам (${JSON.stringify(innArray)}), orgIdDiadoc: ${orgIdDiadoc}`
		)

		let organizationsInfoWrapper: IDiadocOrganizationContainer

		try {
			organizationsInfoWrapper =
				await this.diadocClientService.getOrganizationBoxIdByInnList(
					innArray,
					orgIdDiadoc
				)
		} catch (e) {
			this.logger.error(
				`Ошибка получения boxId по списку ИНН(${JSON.stringify(innArray)}), orgIdDiadoc=${orgIdDiadoc}`
			)
			throw new InternalServerErrorException(
				"Ошибка получения boxId по списку ИНН"
			)
		}

		const organizationsInfo: IDidadocOrganization[] =
			organizationsInfoWrapper.Organizations

		if (organizationsInfo.length < innArray.length) {
			this.logger.error(`Получено меньше учётных записей, чем было запрошено`)
			throw new NotFoundException("Организация не участвует в документообороте")
		}

		this.logger.log(
			`Данные о контрагенте получены (${organizationsInfo.length} шт.), проверяю их статус`
		)

		if (!organizationsInfo.length) {
			const errorMessage: string = `Организация не участвует в документообороте`

			this.logger.error(errorMessage)
			throw new NotFoundException(errorMessage)
		}

		if (
			organizationsInfo.every((organizationInfo) =>
				isEnum(
					organizationInfo.CounteragentStatus,
					NotReadyCounteragentStatuses
				)
			)
		) {
			const errorMessage: string = "Все аккаунты имеют недействующий статус"
			this.logger.error(errorMessage)
			throw new NotFoundException(errorMessage)
		}
	}

	/**
	 * Проверка является ли организация юр.лицом
	 * @param entity инстанс организации
	 * @returns boolean
	 */
	checkUl(entity: Organizations): boolean {
		if (entity.inn.length === 10) {
			return true
		}
		return false
	}

	/**
	 * Получение boxId и boxIdGuid по ИНН
	 * @param inn ИНН
	 * @param entity инстанс организации
	 * @returns Promise<IBoxIdResult> - boxId и boxIdGuid
	 */
	async checkByInn(inn: string, entity: Organizations): Promise<IBoxIdResult> {
		this.logger.log(`Делаю запрос по ИНН: ${inn}`)
		const response =
			await this.diadocClientService.getOrganizationBoxIdByInnKpp(inn)

		if (response.Organizations.length) {
			return this.resultProcessing(response.Organizations, entity)
		}
		return null
	}

	/**
	 * Получение boxId и boxIdGuid по ИНН и КПП
	 * @param inn ИНН
	 * @param kpp КПП
	 * @param entity инстанс организации
	 * @returns Promise<IBoxIdResult> - boxId и boxIdGuid
	 */
	async checkByInnKpp(
		inn: string,
		kpp: string,
		entity: Organizations
	): Promise<IBoxIdResult> {
		this.logger.log(`Делаю запрос ИНН+КПП: ${inn} + ${kpp}`)
		const response: IDiadocOrganizationContainer =
			await this.diadocClientService.getOrganizationBoxIdByInnKpp(inn, kpp)

		if (response.Organizations.length) {
			return this.resultProcessing(response.Organizations, entity)
		} else {
			this.logger.log("Понижаю запрос до ИНН-only")
			return this.checkByInn(inn, entity)
		}
	}

	/**
	 * Обработка ответа от Диадок при получении boxId организации
	 * @param organizations объект IDidadocOrganization - структура от Диадок
	 * @param entity инстанс организации
	 * @returns Promise<IBoxIdResult> - boxId и boxIdGuid
	 */
	async resultProcessing(
		organizations: IDidadocOrganization[],
		entity: Organizations
	): Promise<IBoxIdResult> {
		this.logger.log(`Обработка результата`)

		const diadocAccount = this.getOrganizationAccount(organizations)
		await this.updateBoxIdAndOrgId(
			entity,
			diadocAccount.Boxes[0].BoxId,
			diadocAccount.Boxes[0].BoxIdGuid,
			diadocAccount.OrgId
		)
		return {
			boxId: diadocAccount.Boxes[0].BoxId,
			boxIdGuid: diadocAccount.Boxes[0].BoxIdGuid,
			orgIdDiadoc: diadocAccount.OrgId
		}
	}

	/**
	 * Обновление boxId и boxIdGuid в БД
	 * @param entity инстанс организации
	 * @param newBoxId новый boxId
	 * @param newBoxIdGuid новый boxIdGuid
	 */
	async updateBoxIdAndOrgId(
		entity: Organizations,
		newBoxId: string,
		newBoxIdGuid: string,
		newOrgIdDiadoc: string
	): Promise<void> {
		this.logger.log(`Записываю boxId ${newBoxId} в БД`)

		await this.organizationServiceDb.setBoxIdAndOrgId(
			entity,
			newBoxId,
			newBoxIdGuid,
			newOrgIdDiadoc
		)

		this.logger.log("Запись в БД обновлена")
	}

	/**
	 * Массовое обновление организаций данными из MDM
	 * @param organization IMdmOrganization[]
	 * @returns Promise<Organizations[]>
	 */
	async updateOrganization(
		organization: IMdmOrganization[]
	): Promise<Organizations[]> {
		const mdmOrganizationData = MdmOrganizationMapper(
			organization
		) as OrganizationsDto[]

		return this.organizationServiceDb.bulkCreate(mdmOrganizationData)
	}

	/**
	 * Массовое обновление контрагентов данными из MDM
	 * @param organization IMdmPartner[]
	 * @returns Promise<Organizations[]>
	 */
	async updateCounterparties(
		organization: IMdmPartner[]
	): Promise<Counterparty[]> {
		const mdmOrganizationData: ICounterparty[] = MdmPartnersMapper(organization)

		return await this.counterpartyServiceDb.saveList(mdmOrganizationData)
	}

	/**
	 * Обработка аккаунтов для организации/КА
	 * @param organizations массив организаций (IDidadocOrganization[])
	 * @returns аккаунт (организация) для ведения документоборота, соответствующая критериям отбора
	 */
	getOrganizationAccount(
		organizations: IDidadocOrganization[]
	): IDidadocOrganization {
		if (organizations.length < 1) {
			this.logger.error("Не найдена учётная запись в Диадок")
			throw new BadRequestException("Не найдена учётная запись в Диадок")
		}

		if (organizations.length > 1) {
			this.logger.log(
				`Для организации найдено более 1 аккаунта (${organizations.length}), ищу IsRoaming=false`
			)
			const nonRoamingOrganization: IDidadocOrganization = organizations.find(
				(organization) => {
					return !organization.IsRoaming
				}
			)

			if (!nonRoamingOrganization) {
				this.logger.error(
					"У организации несколько аккаунтов, но нет аккаунта без роуминга, беру первый"
				)
				this.logger.log(`Взят аккаунт OrgId = ${organizations[0].OrgId}`)

				return organizations[0]
			}

			return nonRoamingOrganization
		}

		this.logger.log(
			`У организации найден 1 аккаунт OrgId=${organizations[0].OrgId}`
		)
		return organizations[0]
	}

	public async updateBoxIdData(inn: string): Promise<Organizations> {
		const organizationInstance: Organizations =
			await this.organizationServiceDb.getByInn(inn)
		const boxIdData: IBoxIdResult = await this.checkByInn(
			inn,
			organizationInstance
		)

		return await this.organizationServiceDb.setBoxIdAndOrgId(
			organizationInstance,
			boxIdData?.boxId ?? null,
			boxIdData?.boxIdGuid ?? null,
			boxIdData?.orgIdDiadoc ?? null
		)
	}
}
