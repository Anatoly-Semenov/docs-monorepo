import { BadRequestException } from "@nestjs/common"

import { Express } from "express"

import { DocsConstants } from "@docs/shared/constants/validator/docs.constants"
import { FileConstants } from "@docs/shared/constants/validator/files.constants"

import { ValidatorInstance } from "@docs/shared/types/validator.types"
import { isEnum, isUUID } from "class-validator"

import { Docs } from "@docs/common/db/entities/docs.entity"

import { FileDto } from "@docs/shared/dto/v1/db-dto/file/files.dto"

import { KindFiles } from "@docs/shared/enums/files.enum"
import { BytesIn } from "@docs/shared/types/bytes.enum"

export class FileValidator implements ValidatorInstance<string[]> {
	private errors: string[] = []
	private readonly excludeSymbols: string[] = [
		"<",
		">",
		":",
		"/",
		"\\",
		"|",
		"?",
		"*"
	]

	constructor(
		private readonly fileDto: FileDto,
		private readonly file: Express.Multer.File,
		private readonly docInstance: Docs,
		private readonly isMultilateralSigning: boolean,
		private readonly originalNameFile: string
	) {}

	public validate(): typeof this.errors {
		if (!this.file) {
			this.errors.push("Не получен файл")
		}

		// Отключена проверка лишних полей
		// this.checkByAcceptableFields()
		this.checkByFileId()
		this.checkByFileName()
		this.checkByFileType()
		this.checkBySignature()
		this.checkByFileSize()
		this.checkByFileKindFiles()
		this.checkByIsInternalAllow()
		this.checkByFieldsStructure()
		this.checkByMultilateralSigning()
		this.checkByNumberFields()

		return this.errors
	}

	private checkByMultilateralSigning(): void {
		if (!this.isMultilateralSigning) {
			return
		}

		if (
			[
				KindFiles.Letter,
				KindFiles.Invoice,
				KindFiles.InvoiceRevision,
				KindFiles.InvoiceCorrection,
				KindFiles.UniversalTransferDocument,
				KindFiles.InvoiceCorrectionRevision,
				KindFiles.UniversalTransferDocumentRevision
			].includes(this.fileDto.kind_files)
		) {
			throw new BadRequestException(
				`Файл с kind_files=${this.fileDto.kind_files} нельзя отправить для многостороннего подписания`
			)
		}
	}

	private checkByAcceptableFields(): void {
		const errorFields: string[] = []
		for (const key in this.fileDto) {
			if (!FileConstants.acceptableFields.includes(key)) {
				errorFields.push(key)
			}
		}

		if (errorFields.length) {
			throw new BadRequestException(
				`Получены недопустимые поля: ${errorFields.join(", ")}`
			)
		}
	}

	private checkByFileId(): void {
		if (!this.fileDto?.file_id) {
			this.errors.push("Не указано обязательное поле file_id")
			return
		}

		if (
			typeof this.fileDto?.file_id !== "string" ||
			!isUUID(this.fileDto?.file_id)
		) {
			this.errors.push(`Ошибка валидации file_id = ${this.fileDto?.file_id}`)
		}
	}

	private checkByFileName(): void {
		if (!this.fileDto?.name_files) {
			/** Дополнительная проверка на то, что в имени файла были только
			 * запрещённые символы, и после их удаления строки не осталось
			 */
			if (this.originalNameFile?.length) {
				this.errors.push(
					"В поле name_files содержатся только запрещённые символы"
				)
				return
			}
			this.errors.push("Не указано обязательное поле name_files")
			return
		}

		if (
			!this.fileDto.name_files ||
			typeof this.fileDto?.name_files !== "string"
		) {
			this.errors.push(
				`Ошибка валидации name_files = ${this.fileDto?.name_files}`
			)
		}

		if (!this.isValidFileName(this.fileDto?.name_files)) {
			this.errors.push(
				`В имени файла ${this.fileDto?.name_files} содержатся запрещённые символы: ${this.excludeSymbols.join(", ")}`
			)
		}
	}

	private checkByBoolean(
		value: boolean | string | undefined,
		fieldName: string
	): void {
		if (typeof value === "boolean") {
			return
		} else if (!value) {
			this.errors.push(`Не указано обязательное поле ${fieldName}`)
		} else if (!["true", "false"].includes(value)) {
			this.errors.push(
				`${fieldName} = ${value}  не является валидной boolean-строкой`
			)
		}
	}

	private checkByFileType(): void {
		this.checkByBoolean(this.fileDto?.type_files, "type_files")
	}

	private checkBySignature(): void {
		this.checkByBoolean(
			this.fileDto?.need_recipient_signature,
			"need_recipient_signature"
		)
	}

	private checkByFileSize(): void {
		if (!this.file?.buffer) {
			return
		}

		// todo: add real isRoaming value
		const isRoaming: boolean = false

		const currentFileSize: number = this.file.buffer.byteLength
		const maxFileBytes: number = (isRoaming ? 20 : 28) * BytesIn.MEGABYTE
		const maxFileSize: number = maxFileBytes - (maxFileBytes * 30) / 100 // - 30% convert to Base64

		if (currentFileSize > maxFileSize) {
			this.errors.push(
				`Размер файла ${currentFileSize} byte, превышает допустимый ${maxFileSize} byte`
			)
		}
	}

	private checkByFileKindFiles(): void {
		if (!this.fileDto?.kind_files) {
			this.errors.push("Не получено обязательное поле kind_files")
			return
		}

		if (!isEnum(this.fileDto.kind_files, KindFiles)) {
			this.errors.push(
				`kind_files = ${this.fileDto?.kind_files} не входит в допустимый перечень значений`
			)
		}

		if (this.fileDto.kind_files === KindFiles.SupplementaryAgreement) {
			/** если файл - доп.соглашение, то проверяем что его документ имеет связь
			 *  с другим документом
			 */
			if (!this.docInstance.DocsLinkAsParent.length) {
				this.errors.push(
					"Доп. соглашение должно быть связано с основным документом"
				)
			}
		}

		if (this.fileDto.kind_files === KindFiles.Torg13) {
			/** если файл - Torg13, то проверяем что его документ имеет связь
			 *  с другим документом
			 */
			if (!this.docInstance.DocsLinkAsParent.length) {
				this.errors.push(
					"Документ типа Torg13 должен быть связано с основным документом"
				)
			}
		}
	}

	/** Валидация разрешения флага is_internal (Внутренний документооборот) */
	private checkByIsInternalAllow(): void {
		if (
			this.docInstance.is_internal &&
			FileConstants.deniedInternalFlagKeys.includes(this.fileDto.kind_files)
		) {
			this.errors.push(
				`Флаг is_internal запрещён для типа ${this.fileDto.kind_files}`
			)
		}
	}

	private checkByNumberFields(): void {
		function commonCheck(field: any, fieldName: string) {
			checkByNumber(field, "total_sum")
			checkByPositive(field, "total_sum")
		}

		function checkByNumber(field: any, fieldName: string) {
			if (isNaN(+field)) {
				this.errors.push(`Поле ${fieldName} должно содержать валидное число`)
			}
		}

		function checkByPositive(field: any, fieldName: string) {
			if (field < 0) {
				this.errors.push(`Поле ${fieldName} не должно быть отрицательным`)
			}
		}

		if (this.fileDto?.total_sum) {
			commonCheck(this.fileDto.total_sum, "total_sum")
		}

		if (this.fileDto?.total_vat) {
			commonCheck(this.fileDto.total_vat, "total_vat")
		}
	}

	/** Проверка обязательных полей в зависимости от типа файла
	 * Следующие поля исключены из проверки в виду их специфичной обработки:
	 * 1. DocumentNumber
	 * 2. DocumentDate
	 * 3. ContractDocumentNumber
	 * 4. ContractDocumentDate
	 * 5. Grounds
	 */
	private checkByFieldsStructure(): void {
		if (!isEnum(this.fileDto.kind_files, KindFiles)) {
			/** Невозможно проверить поля по типу файла
			 *  т.к. тип файла некорректен, проверка типа осуществлена выше
			 */
			return
		}

		for (const key of ["docsKeys", "fileKeys"]) {
			let checkingByKeys: string[]
			let checkingKeys: string[]
			let resourceName: string

			switch (key) {
				case "docsKeys":
					checkingByKeys = [
						...DocsConstants.nonStructuredKeys.common,
						...DocsConstants.nonStructuredKeys[
							KindFiles[this.fileDto.kind_files]
						]
					]
					checkingKeys = Object.keys(this.docInstance)
					resourceName = "документа"
					break
				case "fileKeys":
					checkingByKeys = [
						...FileConstants.nonStructuredKeys.common,
						...FileConstants.nonStructuredKeys[
							KindFiles[this.fileDto.kind_files]
						]
					]
					checkingKeys = Object.keys(this.fileDto)
					resourceName = "файла"
					break
				default:
					break
			}

			for (const key of checkingByKeys) {
				if (!checkingKeys.includes(key)) {
					this.errors.push(
						`Отсутствует обязательное поле ${key} (у ${resourceName}) для типа ${this.fileDto.kind_files} для файла ${this.fileDto.file_id}`
					)
				}
			}
		}
	}

	private isValidFileName(name: string): boolean {
		for (const symbol of this.excludeSymbols) {
			if (name.includes(symbol)) {
				return false
			}
		}

		return ![" ", "."].includes(name[name.length - 1])
	}
}
