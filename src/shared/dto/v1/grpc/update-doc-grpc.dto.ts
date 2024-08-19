import { IsUUID } from "class-validator"

export class UpdateDocGrpcDto {
	@IsUUID()
	docId: string

	constructor(fields: UpdateDocGrpcDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
