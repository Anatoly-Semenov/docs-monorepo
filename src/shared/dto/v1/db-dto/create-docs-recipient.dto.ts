import { IsNumber } from "class-validator"

import { Counterparty } from "@docs/common/db/entities/counterparty.entity"
import { Docs } from "@docs/common/db/entities/docs.entity"

export class CreateDocsRecipientDto {
	constructor(docs: Docs, counerparties: Counterparty, order: number) {
		this.counterparties = counerparties
		this.docs = docs
		this.order = order
	}

	docs: Docs
	counterparties: Counterparty

	@IsNumber()
	order: number
}
