import { StatusMapper } from "@docs/shared/mappers"

import {
	Injectable,
	InternalServerErrorException,
	Logger
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { Repository } from "typeorm"

import {
	IStatusForUpdating,
	IStatusForUpdatingEntity,
	IStatusServiceDb
} from "@docs/shared/interfaces/services/db/status-service.interfaces"
import { IDiadocStatus } from "@docs/shared/interfaces/services/docs-service.interfaces"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"
import { Status } from "@docs/common/db/entities/status.entity"

import { StatusDto } from "@docs/shared/dto/v1/db-dto/status.dto"

@Injectable()
export class StatusServiceDb implements IStatusServiceDb {
	constructor(
		@InjectRepository(Status)
		private readonly statusRepository: Repository<Status>
	) {}

	private readonly logger = new Logger(StatusServiceDb.name)

	async getBySeverity(severity: string): Promise<Status> {
		this.logger.log(`Поиск статуса по severity = ${severity}`)
		return this.statusRepository.findOneBy({
			severity
		})
	}

	create(statusDto: StatusDto): Promise<Status> {
		const status: IStatusForUpdatingEntity = {
			service_status: statusDto.service_status,
			primary_status: statusDto.primaryStatus,
			mapped_status: statusDto.mapped_status,
			severity: statusDto.severity,
			name: statusDto.name,
			is_active: true
		}

		if (statusDto.docInstance) {
			status.doc = statusDto.docInstance
		}

		if (statusDto.fileInstance) {
			status.files = statusDto.fileInstance
		}

		try {
			return this.statusRepository.save(status)
		} catch (error) {
			const message: string = `Ошибка создания записи о статусе, service_status=${statusDto.service_status}, docs_id=${statusDto?.docInstance?.doc_id}`

			this.logger.error(message)

			throw new InternalServerErrorException(message)
		}
	}

	saveInstance(statusInstance: Status): Promise<Status> {
		try {
			return this.statusRepository.save(statusInstance)
		} catch (error) {
			const message: string = `Ошибка сохранения статуса, id=${statusInstance?.id}, docs_id=${statusInstance?.docs_id}`

			this.logger.error(message)
			throw new InternalServerErrorException(message)
		}
	}

	bulkSaveInstance(statusInstances: Status[]): Promise<Status[]> {
		return this.statusRepository.save(statusInstances)
	}

	async processNewStatus(
		newPrimaryStatus: IDiadocStatus,
		instance: Docs | Files
	): Promise<Status> {
		this.logger.log(`Обработка статуса, id(doc/file)=${instance.id}`)

		this.logger.log(
			`Получаю последний активный статус, id(doc/file)=${instance.id}`
		)
		const activeStatus = instance.status.find((curr) => curr.is_active)

		if (activeStatus) {
			this.logger.log(
				`Найден статус(id doc/file)=${instance.id}): ${activeStatus.name}`
			)
			if (
				activeStatus.severity === newPrimaryStatus.Severity &&
				activeStatus.name === newPrimaryStatus.StatusText
			) {
				if (newPrimaryStatus.service_status) {
					if (
						newPrimaryStatus.service_status === activeStatus.service_status &&
						newPrimaryStatus.mapped_status === activeStatus.mapped_status
					) {
						this.logger.log(
							`Полученный статус (${activeStatus.name}) идентичен текущему, пропускаю обработку`
						)
						return activeStatus
					}
				} else {
					this.logger.log(
						`Полученный статус (${activeStatus.name}) идентичен текущему, пропускаю обработку`
					)
					return activeStatus
				}
			}

			this.logger.log(
				`Убираю флаг is_active для статуса id:${activeStatus.id} name:${activeStatus.name}`
			)
			activeStatus.is_active = false

			await this.saveInstance(activeStatus)
		}

		this.logger.log("Создаю новый статус")
		const entity: IStatusForUpdating = {
			name: newPrimaryStatus.StatusText,
			severity: newPrimaryStatus.Severity,
			primaryStatus: true
		}

		entity.mapped_status = StatusMapper(newPrimaryStatus.StatusText)

		if (instance instanceof Files) {
			entity.fileInstance = instance
		} else {
			entity.docInstance = instance
			entity.service_status = newPrimaryStatus.service_status
		}

		return this.create(entity)
	}
}
