import {
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min
} from "class-validator"

import { LoadListDto } from "./load-list.dto"

import {
	LoadMode,
	OrganizationType
} from "@docs/shared/enums/organization.enum"

export class OrganizationsDto {
	@IsOptional()
	org_id?: string

	@IsString()
	name: string

	@IsString()
	full_name: string

	@IsString()
	inn: string

	@IsString()
	kpp: string

	@IsOptional()
	box_id?: string

	@IsOptional()
	type: OrganizationType

	@IsOptional()
	fns_participant_id?: string
}

export class OrganizationLoadDto extends LoadListDto {
	@IsOptional()
	@IsEnum(LoadMode)
	mode?: LoadMode

	@IsOptional()
	@Min(1)
	@Max(30)
	@IsNumber()
	pagesize?: number
}

export class OrganizationUpdateDto extends LoadListDto {
	@IsString()
	@IsUUID()
	organizationId: string
}
