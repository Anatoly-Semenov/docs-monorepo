import { Type } from "class-transformer"

import { IsEnum, IsObject } from "class-validator"

import { OrganizationFeature } from "@docs/shared/enums/organization.enum"

export class OrganizationFeatureDataDto {
	@IsEnum(OrganizationFeature, {
		each: true
	})
	Features: OrganizationFeature[]
}

export class OrganizationFeatureResponseDto {
	constructor(fields: OrganizationFeatureResponseDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}

	@Type(() => OrganizationFeatureDataDto)
	data: OrganizationFeatureDataDto

	@IsObject()
	headers: object
}
