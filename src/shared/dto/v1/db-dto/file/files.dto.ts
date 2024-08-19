import { ApiProperty } from "@nestjs/swagger"

import {
	IsBooleanOrStringBoolean,
	IsNumberOrString
} from "@docs/shared/validators"
import {
	IsBoolean,
	IsDefined,
	IsEnum,
	IsOptional,
	IsString,
	Validate
} from "class-validator"

import { KindFiles } from "@docs/shared/enums/files.enum"

export class FileDto {
	/**
	 * Валидация входящих по rest-api данных была перенесена в сервис
	 * для выполнения дополнительной логики
	 */
	@ApiProperty()
	file_id: string

	// Используется для передачи расширений файлов
	@ApiProperty()
	file_type: string

	@ApiProperty()
	end_date?: string

	@ApiProperty()
	name_files: string

	@ApiProperty()
	total_sum?: number

	@ApiProperty()
	begin_date?: string

	/** Переносим валидацию в сервис, т.к.
	 * смежным системам нужно аккумулировать ошибку,
	 * а ДТО валидируется до кода сервиса
	 */
	@ApiProperty({ enum: KindFiles })
	kind_files?: KindFiles

	@ApiProperty()
	currency_code?: number

	@ApiProperty()
	price_list_effective_date?: string

	/** Используем string чтоб передать boolean через formdata */
	@ApiProperty()
	type_files: string

	@IsOptional()
	@IsBoolean()
	@ApiProperty()
	is_print_form?: boolean

	@IsOptional()
	@IsBoolean()
	@ApiProperty()
	is_archive?: boolean

	@IsOptional()
	@IsString()
	@ApiProperty()
	diadoc_id?: string

	@ApiProperty()
	@IsDefined()
	@Validate(IsBooleanOrStringBoolean)
	@IsOptional()
	need_recipient_signature: boolean | "true" | "false"

	@IsOptional()
	@IsString()
	@ApiProperty()
	created_by?: string

	@IsOptional()
	@IsString()
	@ApiProperty()
	updated_by?: string

	@IsOptional()
	@IsString()
	@ApiProperty()
	deleted_by?: string

	constructor(fields: FileDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}

export class FileResponseDto {
	constructor(id: string, name: string, code: number) {
		this.id = id
		this.name = name
		this.code = code
	}

	@ApiProperty()
	id: string

	@ApiProperty()
	name: string

	@ApiProperty()
	code: number
}
