import { ApiProperty } from "@nestjs/swagger"

import { IsNumber, IsString } from "class-validator"

export class DocResponseDto {
	constructor(message: string, sign_id: string, code: number) {
		this.message = message
		this.sign_id = sign_id
		this.code = code
	}

	@IsString()
	@ApiProperty()
	message: string

	@IsString()
	@ApiProperty()
	sign_id: string

	@IsNumber()
	@ApiProperty()
	code: number
}

export class DocPublishResponseDto {
	constructor(message: string, code: number) {
		this.message = message
		this.code = code
	}

	@ApiProperty()
	@IsString()
	message: string

	@ApiProperty()
	@IsNumber()
	code: number
}
