import { IsString } from "class-validator"

export class SystemsDto {
	@IsString()
	name: string

	@IsString()
	link: string
}
