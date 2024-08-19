import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { IsNull, Not, Repository } from "typeorm"

import { IOrganizationServiceDb } from "@docs/shared/interfaces/services/organization-service.interfaces"

import { Organizations } from "@docs/common/db/entities/organizations.entity"

import { OrganizationsDto } from "@docs/shared/dto/v1/db-dto/organizations.dto"

import { OrganizationFeature } from "@docs/shared/enums/organization.enum"

@Injectable()
export class OrganizationServiceDb implements IOrganizationServiceDb {
	constructor(
		@InjectRepository(Organizations)
		private readonly organizationsRepository: Repository<Organizations>
	) {}

	private readonly logger = new Logger(OrganizationServiceDb.name)

	private setError(message: string): void {
		this.logger.error(message)
		throw new InternalServerErrorException(message)
	}

	create(organizationsDto: OrganizationsDto): Promise<Organizations> {
		this.logger.log(`Создаю запись об организации`)
		return this.organizationsRepository.save(organizationsDto)
	}

	public async getAll(): Promise<Organizations[]> {
		try {
			return await this.organizationsRepository.find()
		} catch (e) {
			const errorMessage: string = `Ошибка получения всех организаций из БД: ${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	public async *getAllPaginated(
		pageSize = 10
	): AsyncGenerator<Organizations[]> {
		this.logger.log(
			`Пагинированное получение всех организаций, pageSize: ${pageSize}`
		)

		const count: number = await this.organizationsRepository.count()
		const parts: number = Math.ceil(count / pageSize)

		for (let page = 0; page < parts; page++) {
			const organizations: Organizations[] =
				await this.organizationsRepository.find({
					take: pageSize,
					skip: pageSize * page
				})

			yield organizations
		}
	}

	async bulkCreate(
		organizationsDtoArray: OrganizationsDto[]
	): Promise<Organizations[]> {
		this.logger.log(
			`Пакетное сохранение организаций (${organizationsDtoArray.length}шт)`
		)

		try {
			return await this.organizationsRepository.save(organizationsDtoArray)
		} catch (error) {
			this.setError("Ошибка пакетного сохранения организаций")
		}
	}

	async update(
		id: string,
		organizationsDto: OrganizationsDto
	): Promise<Organizations> {
		const organizationInstance: Organizations = await this.getById(id)

		this.logger.log(`Обновляю данные организации по ID: ${id}`)

		try {
			return await this.organizationsRepository.save({
				...organizationInstance,
				...organizationsDto
			})
		} catch (error) {
			this.setError(`Ошибка Обновляю данные организации по ID: ${id}`)
		}
	}

	async setBoxIdAndOrgId(
		entity: Organizations,
		newBoxId: string,
		newBoxIdGuid: string,
		newOrgIdDiadoc: string
	): Promise<Organizations> {
		this.logger.log("Обновляю boxId")

		try {
			return await this.organizationsRepository.save({
				...entity,
				box_id: newBoxId,
				box_id_guid: newBoxIdGuid,
				org_id_diadoc: newOrgIdDiadoc
			})
		} catch (error) {
			this.setError(
				`Ошибка обновления organization_id=${entity.id}, newBoxId=${newBoxId}, newBoxIdGuid=${newBoxIdGuid}, newOrgIdDiadoc=${newOrgIdDiadoc}`
			)
		}
	}

	async getById(id: string): Promise<Organizations> {
		this.logger.log(`Ищу запись об организации по ID: ${id}`)

		let organizationInstance: Organizations

		try {
			organizationInstance = await this.organizationsRepository.findOne({
				where: {
					id,
					deleted_at: IsNull()
				}
			})
		} catch (error) {
			this.setError(`Ошибка поиска организации по id=${id}`)
		}

		console.log("organizationInstance:: ", organizationInstance)

		if (!organizationInstance) {
			this.logger.log(`Не найдена организация по ID: ${id}`)
			throw new NotFoundException("Организация не найдена")
		}

		return organizationInstance
	}

	async getByInn(inn: string): Promise<Organizations> {
		this.logger.log(`Ищу запись об организации по ИНН: ${inn}`)

		let organizationInstance: Organizations

		try {
			organizationInstance = await this.organizationsRepository.findOne({
				where: {
					inn,
					deleted_at: IsNull()
				}
			})
		} catch (error) {
			this.setError(`Ошибка поиска записи об организации по ИНН: ${inn}`)
		}

		if (!organizationInstance) {
			this.logger.log(`Не найдена организация по ИНН: ${inn}`)
			throw new NotFoundException("Организация не найдена")
		}

		return organizationInstance
	}

	async getByKpp(kpp: string): Promise<Organizations> {
		this.logger.log(`Ищу запись об организации по КПП: ${kpp}`)

		let organizationInstance: Organizations

		try {
			organizationInstance = await this.organizationsRepository.findOne({
				where: {
					kpp,
					deleted_at: IsNull()
				}
			})
		} catch (error) {
			this.setError(`Ошибка поиска записи об организации по КПП: ${kpp}`)
		}

		if (!organizationInstance) {
			this.logger.log(`Не найдена организация по КПП: ${kpp}`)
			throw new NotFoundException("Организация не найдена")
		}

		return organizationInstance
	}

	async delete(id: string): Promise<Organizations> {
		try {
			const organizationInstance = await this.getById(id)

			this.logger.log(`Удаляю запись об организации с ID: ${id}`)
			return await this.organizationsRepository.softRemove(organizationInstance)
		} catch (error) {
			this.setError(`Ошибка удаления организации id=${id}`)
		}
	}

	/**
	 * Получение организаций, которые начали документооборот через сервис
	 * (имеют соответствующий признак в бд, который устанавливается при первой отправке документа)
	 * @returns Promise<Organizations[]>
	 */
	async getDocFlowOrganizations(): Promise<Organizations[]> {
		this.logger.log("Получаю организации, участвующие в документообороте")

		try {
			const organizations = await this.organizationsRepository.find({
				where: {
					box_id: Not(IsNull()),
					is_document_flow: true,
					deleted_at: IsNull()
				}
			})

			this.logger.log(`Получено ${organizations.length} организаций`)

			return organizations
		} catch (e) {
			const errorMessage: string = `Ошибка получения организаций: ${e.message}. Убедитесь что миграции БД выполнены`

			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	public async *getDocFlowPaginated(
		pageSize: number = 10
	): AsyncGenerator<Organizations[]> {
		this.logger.log(
			`Пагинированное получение организаций, участвующих в документообороте pageSize=${pageSize}`
		)

		try {
			const count: number = await this.organizationsRepository.count({
				where: {
					is_document_flow: true
				}
			})

			const parts: number = Math.ceil(count / pageSize)
			for (let page = 0; page < parts; page++) {
				const organization: Organizations[] =
					await this.organizationsRepository.find({
						where: {
							is_document_flow: true
						},
						take: pageSize,
						skip: pageSize * page
					})

				yield organization
			}
		} catch (e) {
			const errorMessage: string = `Получена ошибка при пагинированном обращении к организациям: ${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	/**
	 * Установка признака участия в документообороте
	 * @param orgId внутренний ID организации
	 * @param docFlowStatus новое значение признака (по умолчанию true)
	 * @returns Promise<Organizations>
	 */
	async setDocFlow(
		orgId: string,
		docFlowStatus = true
	): Promise<Organizations> {
		this.logger.log(`Устанавливаю doc flow флаг для организации ${orgId}`)
		const orgInstance: Organizations = await this.getById(orgId)

		orgInstance.is_document_flow = true

		try {
			return await orgInstance.save()
		} catch (error) {
			this.setError(`Ошибка установки doc flow флага для организации ${orgId}`)
		}
	}

	async getByOrgId(orgId: string): Promise<Organizations> {
		this.logger.log(`Ищу организацию по orgId: ${orgId}`)

		let orgInstance: Organizations

		try {
			orgInstance = await this.organizationsRepository.findOne({
				where: {
					org_id: orgId
				}
			})
		} catch (error) {
			this.setError(`Ошибка поиска организации по orgId: ${orgId}`)
		}

		if (!orgInstance) {
			this.logger.warn(`Не найдена организация по orgId: ${orgId}`)
			throw new NotFoundException("Не найдена организация")
		}

		return orgInstance
	}

	async count(): Promise<number> {
		this.logger.log(`Считаю количество организаций в БД`)

		try {
			const result: number = await this.organizationsRepository.count()

			this.logger.log(`Количество организаций в БД: ${result}`)

			return result
		} catch (error) {
			this.setError(`Ошибка счета количества организаций в БД`)
		}
	}

	public async setFeatures(
		organizationId: string,
		features: OrganizationFeature[]
	): Promise<Organizations> {
		this.logger.log(`Устанавливаю разрешения для организации ${organizationId}`)

		try {
			const organizationInstance: Organizations =
				await this.getById(organizationId)

			organizationInstance.is_approvement_signatures_allowed = false
			organizationInstance.is_lock_send_allowed = false
			organizationInstance.is_proxy_allowed = false

			for (const feature of features) {
				switch (feature) {
					case OrganizationFeature.ALLOW_PROXIFIED_DOCUMENTS:
						organizationInstance.is_proxy_allowed = true
						break
					case OrganizationFeature.ALLOW_APPROVEMENT_SIGNATURES:
						organizationInstance.is_approvement_signatures_allowed = true
						break
					case OrganizationFeature.ALLOW_SEND_LOCKED_PACKETS:
						organizationInstance.is_lock_send_allowed = true
						break
				}
			}

			const savedOrganization: Organizations =
				await this.organizationsRepository.save(organizationInstance)

			this.logger.log(
				`Разрешения для организации ${organizationId} успешно установлены`
			)

			return savedOrganization
		} catch (e) {
			this.setError(
				`Возникла ошибка при установке разрешений для организации ${organizationId}: ${e.message}`
			)
		}
	}
}
