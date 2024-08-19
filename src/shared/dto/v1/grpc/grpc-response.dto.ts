import { IsNumber, IsString } from "class-validator"

export class GrpcResponseDto {
	@IsString()
	message: string

	@IsString()
	signId: string

	@IsNumber()
	code: number

	constructor(fields: GrpcResponseDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
