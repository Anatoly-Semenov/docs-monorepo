import {
	IsBoolean,
	IsEnum,
	IsInstance,
	IsNumber,
	IsOptional,
	IsString
} from "class-validator"

import { GoogleTimestampDto } from "@docs/shared/dto/v1/google-timestamp.dto"

import { GrpcVgo } from "@docs/shared/enums/docs.enum"
import { GrpcPacketLockMode } from "@docs/shared/enums/packet.enum"

export class SendDocGrpcDto {
	@IsOptional()
	@IsBoolean()
	need_recipient_signature?: boolean

	@IsInstance(GoogleTimestampDto)
	regDate: GoogleTimestampDto

	@IsString({
		each: true
	})
	counterpartyId: string[]

	@IsString({
		each: true
	})
	boxesId: string[]

	@IsString({
		each: true
	})
	docsId: string[]

	@IsEnum(GrpcPacketLockMode)
	lockMode: GrpcPacketLockMode

	@IsString()
	linkContrSystem: string

	@IsString()
	documentKind: string

	@IsBoolean()
	isCancelled: boolean

	@IsNumber()
	currencycode: number

	@IsBoolean()
	isInternal: boolean

	@IsBoolean()
	isTemplate: boolean

	@IsBoolean()
	isRoaming: boolean

	@IsString()
	regNumber: string

	@IsNumber()
	totalvat: number

	@IsString()
	comment: string

	@IsString()
	docId: string

	@IsString()
	orgId: string

	@IsString()
	name: string

	@IsNumber()
	sum: number

	@IsEnum(GrpcVgo)
	vgo: GrpcVgo

	constructor(fields?: Partial<SendDocGrpcDto>) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
