import { IDocumentAttachments } from "@docs/shared/interfaces/services/docs-service.interfaces"

import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator"

export class SendBaseDocumentToDiadocDto {
	@IsArray()
	DocumentAttachments: IDocumentAttachments[]

	@IsString()
	ToDepartmentId: string

	@IsString()
	@IsOptional()
	ProxyBoxId?: string // Для трехстороннего подписания

	@IsString()
	FromBoxId: string

	@IsString()
	Lockmode: string

	@IsString()
	ToBoxId: string

	constructor(fields: SendBaseDocumentToDiadocDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}

export class SendDocumentToDiadocDto extends SendBaseDocumentToDiadocDto {
	@IsOptional()
	@IsBoolean()
	IsTest?: boolean

	constructor(fields: SendDocumentToDiadocDto) {
		if (fields) {
			super(fields)
			Object.assign(this, fields)
		}
	}
}
