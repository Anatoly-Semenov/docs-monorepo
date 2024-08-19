import { IsUUID } from "class-validator"

import { CreateCounterpartyDto } from "@docs/shared/dto/v1/db-dto/counterparty/create-counterparty.dto"

export class CreateCounterpartyFromMdmDto extends CreateCounterpartyDto {
	@IsUUID()
	id: string

	constructor(fields?: Partial<CreateCounterpartyFromMdmDto>) {
		super()

		if (fields) {
			Object.assign(this, fields)
		}
	}
}
