import { IsUUID } from "class-validator"

export class OperatorsQueryDto {
	@IsUUID("all", {
		each: true
	})
	counterpartyIds: string[]
}
