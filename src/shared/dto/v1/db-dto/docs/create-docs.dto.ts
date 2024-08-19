import { ApiProperty } from "@nestjs/swagger"

import {
	IsBoolean,
	IsDateString,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID
} from "class-validator"

import { Organizations } from "@docs/common/db/entities/organizations.entity"
import { Systems } from "@docs/common/db/entities/systems.entity"

import { Vgo } from "@docs/shared/enums/docs.enum"
import { PacketLockmode } from "@docs/shared/enums/packet.enum"

export class CreateDocsDto {
	@IsOptional()
	@IsBoolean()
	@ApiProperty()
	need_recipient_signature?: boolean

	@IsOptional()
	@IsString()
	@ApiProperty()
	link_diadoc_template?: string

	@IsOptional()
	@IsEnum(PacketLockmode)
	@ApiProperty({
		enum: PacketLockmode,
		default: PacketLockmode.None
	})
	lock_mode: PacketLockmode

	@IsOptional()
	@ApiProperty()
	organization: Organizations

	@IsOptional()
	@IsEnum(PacketLockmode)
	@ApiProperty({
		enum: PacketLockmode
	})
	lockMode: PacketLockmode

	/** TODO: Deprecated */
	@IsOptional()
	@IsString({
		each: true
	})
	@ApiProperty({
		required: false
	})
	kontragent?: string[]

	/** TODO: Deprecated */
	@IsOptional()
	@ApiProperty()
	@IsString({
		each: true
	})
	@ApiProperty({
		required: false
	})
	kontragent_id?: string[]

	@IsOptional()
	@IsString({
		each: true
	})
	@ApiProperty({
		required: false
	})
	counterparty_id?: string[]

	@IsOptional()
	@IsString({
		each: true
	})
	@ApiProperty({
		required: false
	})
	counterparties_id?: string[]

	@IsString()
	@ApiProperty()
	link_contr_system: string

	@IsString()
	@ApiProperty()
	document_kind: string

	@IsOptional()
	@IsBoolean()
	@ApiProperty({
		required: false
	})
	is_roaming?: boolean

	@IsBoolean()
	@ApiProperty()
	is_internal: boolean

	@IsBoolean()
	@ApiProperty()
	is_cancelled: boolean

	@IsBoolean()
	@ApiProperty()
	is_template: boolean

	@IsUUID("4")
	@ApiProperty()
	doc_id: string

	@IsString()
	@ApiProperty()
	reg_number: string

	@IsOptional()
	@IsBoolean()
	@ApiProperty()
	isRoaming: boolean

	@IsBoolean()
	@IsOptional()
	@ApiProperty({
		required: false
	})
	is_test?: boolean

	@IsDateString()
	@ApiProperty()
	reg_date: string

	@IsString()
	@ApiProperty()
	comment: string

	@IsOptional()
	@ApiProperty()
	system: Systems

	@IsUUID()
	@ApiProperty()
	org_id: string

	@IsString()
	@ApiProperty()
	name: string

	@IsNumber()
	@ApiProperty()
	sum: number

	@IsOptional()
	@IsEnum(Vgo)
	@ApiProperty({ enum: Vgo })
	vgo: Vgo

	@IsUUID("all", {
		each: true
	})
	@ApiProperty()
	docs_id: string[]

	@IsString()
	@IsOptional()
	@ApiProperty()
	link_files: string[]

	/** Временно оставлено до доработок смежных систем */
	@IsOptional()
	@IsString()
	@ApiProperty({
		required: false
	})
	system_id: string

	@IsOptional()
	@IsString()
	@ApiProperty()
	created_by: string

	@IsOptional()
	@IsString({
		each: true
	})
	@ApiProperty()
	boxes_id: string[]

	@IsOptional()
	@IsNumber()
	@ApiProperty()
	total_vat: number

	@IsOptional()
	@IsNumber()
	@ApiProperty()
	currency_code: number

	constructor(fields?: Partial<CreateDocsDto>) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
