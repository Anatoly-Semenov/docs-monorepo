import { IsString, IsUUID } from "class-validator"

export class CreateErrorLogDto {
	@IsUUID()
	doc_id: string

	@IsString()
	errors: string
}
