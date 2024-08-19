import { IsBoolean, IsOptional, IsString } from "class-validator"

import { SendBaseDocumentToDiadocDto } from "@docs/shared/dto/v1"

export class SendTemplateToDiadocDto extends SendBaseDocumentToDiadocDto {
	@IsBoolean()
	NeedRecipientSignature: boolean

	@IsString()
	@IsOptional()
	MessageProxyBoxId?: string

	@IsString()
	MessageFromBoxId: string

	@IsString()
	MessageToBoxId: string

	constructor(fields: SendTemplateToDiadocDto) {
		if (fields) {
			super(fields)
			Object.assign(this, fields)
		}
	}
}
