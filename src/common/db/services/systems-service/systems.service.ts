import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { IsNull, Repository } from "typeorm"

import { ISystemsServiceDb } from "@docs/shared/interfaces/services/db/systems-service.interfaces"

import { Systems } from "@docs/common/db/entities/systems.entity"

import { SystemsDto } from "@docs/shared/dto/v1/db-dto/systems.dto"

@Injectable()
export class SystemsServiceDb implements ISystemsServiceDb {
	constructor(
		@InjectRepository(Systems)
		private readonly systemsRepository: Repository<Systems>
	) {}

	private readonly logger = new Logger(SystemsServiceDb.name)

	create(systemsDto: SystemsDto): Promise<Systems> {
		this.logger.log(`Создаю запись о системе`)
		return this.systemsRepository.save(systemsDto)
	}

	async update(id: string, systemsDto: SystemsDto): Promise<Systems> {
		const systemInstance = await this.getById(id)

		this.logger.log(`Обновляю запись о системе по ID: ${id}`)
		return this.systemsRepository.save({
			...systemInstance,
			...systemsDto
		})
	}

	async getById(id: string): Promise<Systems> {
		this.logger.log(`Ищу запись о системе по ID: ${id}`)
		const systemInstance = await this.systemsRepository.findOne({
			where: {
				id,
				deleted_at: IsNull()
			}
		})

		if (!systemInstance) {
			this.logger.log(`Не найдена система по ID: ${id}`)
			throw new NotFoundException(
				"Система-источник документа не зарегистрирована"
			)
		}

		return systemInstance
	}

	async getByLink(link: string): Promise<Systems> {
		this.logger.log(`Ищу запись о системе по ссылке: ${link}`)
		return this.systemsRepository.findOneBy({
			link
		})
	}

	async getByName(name: string): Promise<Systems> {
		this.logger.log(`Ищу запись о системе по названию: ${name}`)
		return this.systemsRepository.findOneBy({
			name
		})
	}

	async delete(id: string): Promise<Systems> {
		const systemInstance = await this.getById(id)

		this.logger.log(`Удаляю запись о системе по ID: ${id}`)
		return this.systemsRepository.softRemove(systemInstance)
	}
}
