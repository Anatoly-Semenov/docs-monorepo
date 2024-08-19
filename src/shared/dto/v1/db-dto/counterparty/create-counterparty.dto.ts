import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator"

import { OrganizationType } from "@docs/shared/enums/organization.enum"

export class CreateCounterpartyDto {
	@IsString()
	full_name: string

	@IsBoolean()
	is_cancel: boolean

	@IsString()
	name: string

	@IsEnum(OrganizationType)
	@IsOptional()
	type: OrganizationType

	@IsString()
	inn: string

	@IsString()
	kpp: string

	constructor(fields?: Partial<CreateCounterpartyDto>) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
