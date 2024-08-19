import { ApiProperty } from "@nestjs/swagger"

export class JwtResponseDto {
	@ApiProperty()
	accessToken: string

	constructor(accessToken: string) {
		this.accessToken = accessToken
	}
}
