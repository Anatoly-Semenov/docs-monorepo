import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException
} from "@nestjs/common"

import { DiadocClientService } from "@docs/common/clients/providers/diadoc/diadoc-client.service"

import { MdmService } from "../mdm-service/mdm.service"
import { OrganizationServiceDb } from "@docs/common/db/services/organizations/organization.service"
import { IDiadocService } from "@docs/shared/interfaces/services/diadoc-service.interfaces"

import {
	IOC__SERVICE__CLIENT_PROVIDER_DIADOC,
	IOC__SERVICE__MDM,
	IOC__SERVICE__ORGANIZATION_DB
} from "@docs/shared/constants/ioc.constants"

import { Organizations } from "@docs/common/db/entities/organizations.entity"

import {
	LoadMode,
	OrganizationFeature
} from "@docs/shared/enums/organization.enum"

@Injectable()
export class DiadocService implements IDiadocService {
	constructor(
		@Inject(IOC__SERVICE__ORGANIZATION_DB)
		private readonly organizationServiceDb: OrganizationServiceDb,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_DIADOC)
		private readonly diadocClientService: DiadocClientService,

		@Inject(IOC__SERVICE__MDM)
		private readonly mdmService: MdmService
	) {}

	private readonly logger: Logger = new Logger(DiadocService.name)

	public async getOrganizationFeatures(
		organizationId: string
	): Promise<OrganizationFeature[]> {
		this.logger.log(`Считываю разрешения организации ${organizationId}`)

		const organizationInstance: Organizations =
			await this.organizationServiceDb.getByOrgId(organizationId)

		if (!organizationInstance) {
			const errorMessage: string = `Организация ${organizationId} не найдена`
			this.logger.error(errorMessage)
			throw new NotFoundException(errorMessage)
		}

		const orgnizationFeatures: OrganizationFeature[] = []

		if (organizationInstance.is_approvement_signatures_allowed) {
			orgnizationFeatures.push(OrganizationFeature.ALLOW_APPROVEMENT_SIGNATURES)
		}

		if (organizationInstance.is_lock_send_allowed) {
			orgnizationFeatures.push(OrganizationFeature.ALLOW_SEND_LOCKED_PACKETS)
		}

		if (organizationInstance.is_proxy_allowed) {
			orgnizationFeatures.push(OrganizationFeature.ALLOW_PROXIFIED_DOCUMENTS)
		}

		this.logger.log(
			`Возвращены разрешения для ${organizationId}: ${JSON.stringify(orgnizationFeatures)}`
		)
		return orgnizationFeatures
	}

	public async updateOrganizationFeatures(
		organizationId: string
	): Promise<OrganizationFeature[]> {
		const organizationInstance: Organizations =
			await this.organizationServiceDb.getById(organizationId)

		let boxId: string

		if (organizationInstance?.box_id) {
			boxId = organizationInstance.box_id
		} else {
			const updatedOrganization: Organizations =
				await this.mdmService.updateBoxIdData(organizationInstance.inn)
			boxId = updatedOrganization.box_id
		}

		const features: OrganizationFeature[] =
			await this.diadocClientService.getOrganizationFeatures(boxId)

		await this.organizationServiceDb.setFeatures(organizationId, features)

		return features
	}

	/** Вместо этой функции используется пагинированная версия - loadOrganizationFeaturesPaginated
	 * эта функция оставлена на случай непредвиденных проблем с новой версией
	 * и может быть в последствии удалена
	 */
	public async loadOrganizationFeatures(
		mode: LoadMode = LoadMode.DOCFLOW,
		pagesize = 5
	): Promise<string> {
		this.logger.log(
			`Пакетное обновление данных об организациях: mode:${mode}, pagesize:${pagesize}`
		)
		let organizationInstances: Organizations[] = []

		switch (mode) {
			case LoadMode.ALL:
				organizationInstances = await this.organizationServiceDb.getAll()
				break
			case LoadMode.DOCFLOW:
				organizationInstances =
					await this.organizationServiceDb.getDocFlowOrganizations()
				break
			default:
				const errorMessage: string = `Непредвиденное значение LoadMode=${mode}`
				this.logger.error(errorMessage)
				throw new InternalServerErrorException(errorMessage)
		}

		const organizationsPaginated: Organizations[][] = []
		for (
			let i = 0;
			i < Math.ceil(organizationInstances.length / pagesize);
			i++
		) {
			organizationsPaginated[i] = organizationInstances.slice(
				i * pagesize,
				i * pagesize + pagesize
			)
		}

		for (const organizations of organizationsPaginated) {
			await Promise.all(
				organizations.map(async (organization) => {
					try {
						await this.updateOrganizationFeatures(organization.id)
					} catch (e) {
						/** Ошибка пакетного обновления, пропускаем без прерывания обновления */
						this.logger.warn(
							`Ошибка обновления разрешения организации ${organization.id}: ${e.message}`
						)
					}
				})
			)
		}

		return "Разрешения организаций обновлены"
	}

	public async loadOrganizationFeaturesPaginated(
		mode: LoadMode = LoadMode.DOCFLOW
	): Promise<string> {
		this.logger.log(`Пакетное обновление данных об организациях: mode ${mode}`)

		try {
			switch (mode) {
				case LoadMode.ALL:
					for await (const organizations of this.organizationServiceDb.getAllPaginated()) {
						await Promise.all(await this.organizationUpdater(organizations))
					}

					break
				case LoadMode.DOCFLOW:
					for await (const organizations of this.organizationServiceDb.getDocFlowPaginated()) {
						await Promise.all(await this.organizationUpdater(organizations))
					}

					break
				default:
					const errorMessage: string = `Непредвиденное значение LoadMode=${mode}`
					this.logger.error(errorMessage)
					throw new InternalServerErrorException(errorMessage)
			}
		} catch (e) {
			this.logger.warn(
				`Ошибка пагинированного обновления организаций: ${e.message}`
			)
		}
		return "Обновление данных организаций завершено"
	}

	private async organizationUpdater(
		organizations: Organizations[]
	): Promise<void[]> {
		return await Promise.all(
			organizations.map(async (organization) => {
				try {
					await this.updateOrganizationFeatures(organization.id)
				} catch (e) {
					/** Ошибка пакетного обновления, пропускаем без прерывания обновления */
					this.logger.warn(
						`Ошибка обновления разрешения организации ${organization.id}: ${e.message}`
					)
				}
			})
		)
	}
}
