import { Systems } from "@docs/common/db/entities/systems.entity"

import { SystemsDto } from "@docs/shared/dto/v1/db-dto/systems.dto"

export interface ISystemsServiceDb {
	create(systemsDto: SystemsDto): Promise<Systems>

	update(id: string, systemsDto: SystemsDto): Promise<Systems>

	getById(id: string): Promise<Systems>

	getByLink(link: string): Promise<Systems>

	getByName(name: string): Promise<Systems>

	delete(id: string): Promise<Systems>
}
