import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { Repository } from "typeorm"

import { Packets } from "@docs/common/db/entities/packets.entity"

import { PacketsDto } from "@docs/shared/dto/v1/db-dto/packets.dto"

@Injectable()
export class PacketsServiceDb {
	constructor(
		@InjectRepository(Packets)
		private readonly packetsRepository: Repository<Packets>
	) {}

	private readonly logger = new Logger(PacketsServiceDb.name)

	create(packetsDto: PacketsDto): Promise<Packets> {
		this.logger.log("Создание нового пакета")
		return this.packetsRepository.save(packetsDto)
	}

	async getById(id: string): Promise<Packets> {
		this.logger.log(`Ищу запись о пакете по ID: ${id}`)

		const packetInstance = await this.packetsRepository.findOneBy({ id })

		if (!packetInstance) {
			this.logger.log(`Не найден пакет по ID: ${id}`)
			throw new NotFoundException("Не удалось найти пакет")
		}

		return packetInstance
	}

	async getByDiadocId(diadocId: string): Promise<Packets> {
		this.logger.log(`Ищу запись о пакете по DiadocId: ${diadocId}`)

		const packetInstance = await this.packetsRepository.findOneBy({
			packetId: diadocId
		})

		if (!packetInstance) {
			this.logger.log(`Не найден пакет по DiadocId: ${diadocId}`)
			throw new NotFoundException("Не удалось найти пакет")
		}

		return packetInstance
	}
}
