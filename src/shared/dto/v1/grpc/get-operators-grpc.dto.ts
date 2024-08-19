import { IsString } from "class-validator"

export class GetOperatorsGrpcDto {
	@IsString({
		each: true
	})
	counterparties_id: string[]

	@IsString()
	org_id: string
}
