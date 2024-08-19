import { DiadocGuidBuilder } from "@docs/shared/builders/diadoc-guid.builder"
import { StringBuilder } from "@docs/shared/builders/string.builder"

import { BadRequestException, Logger } from "@nestjs/common"

import { ICounterpartyData } from "@docs/shared/interfaces/services/docs-service.interfaces"

import { DocsConstants } from "@docs/shared/constants/validator/docs.constants"

import { ValidatorInstance } from "@docs/shared/types/validator.types"
import { isEnum, isUUID } from "class-validator"

import { Organizations } from "@docs/common/db/entities/organizations.entity"

import { CreateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/create-docs.dto"

import { Vgo } from "@docs/shared/enums/docs.enum"
import { PacketLockmode } from "@docs/shared/enums/packet.enum"

export class DocsValidator implements ValidatorInstance<void> {
	constructor(
		private readonly createDocumentDto: CreateDocsDto,
		private readonly counterpartyInn: string[],
		private readonly orgInstance: Organizations,
		private readonly counterpartyData: ICounterpartyData
	) {}

	private readonly logger: Logger = new Logger(DocsValidator.name)
	private readonly stringBuilder = new StringBuilder()

	public validate(): void {
		this.checkNullValues()

		this.checkDocId()

		this.checkByNeededFields()

		// Отключена проверка непредвиденных полей
		// this.checkByUnforeseenFields()

		this.checkBySum()

		this.checkByInn()

		this.checkByLink()

		this.checkBoxesId()

		this.checkByCounterparties()

		this.checkByMultilateralSigning()

		this.checkCoincidenceByBoxesId()

		this.checkVgo()

		this.checkLockMode()

		// Todo: temporary hide
		// this.oldChecks()
	}

	private checkByNeededFields(): void {
		if (!this.createDocumentDto.doc_id) {
			throw new BadRequestException("Не указано обязательное поле doc_id")
		}
	}

	private checkByMultilateralSigning(): void {
		// Todo: check organization by GetOrganizationFeatures from diadoc
	}

	private checkByUnforeseenFields(): void {
		const errorKeys: string[] = []

		for (const key in this.createDocumentDto) {
			if (!DocsConstants.acceptableDocFields.includes(key)) {
				errorKeys.push(key)
			}
		}

		if (errorKeys.length) {
			throw new BadRequestException(
				`Получены непредусмотренные поля: ${errorKeys.join(", ")}`
			)
		}
	}

	private checkDocId(): void {
		if (!isUUID(this.createDocumentDto?.doc_id)) {
			throw new BadRequestException(
				"Поле doc_id должно иметь валидный UUID формат"
			)
		}
	}

	private checkBySum(): void {
		if (this.createDocumentDto.sum < 0) {
			throw new BadRequestException("Сумма должна быть больше или равна 0")
		}
	}

	private checkByInn(): void {
		if (
			this.counterpartyData?.ids?.length !== this.counterpartyInn?.length &&
			this.counterpartyData?.inn?.length !== this.counterpartyInn?.length
		) {
			throw new BadRequestException(
				"Обнаружены неуникальные значения контрагентов"
			)
		}

		if (this.counterpartyInn?.includes(this.orgInstance?.inn)) {
			throw new BadRequestException(
				"ИНН Организации и Контрагента не должны совпадать"
			)
		}
	}

	private checkByLink(): void {
		const link: string = this.createDocumentDto?.link_contr_system || ""

		if (
			!link ||
			!link.length ||
			!["http", "https"].includes(link.split(":")[0])
		) {
			throw new BadRequestException(
				"Некорректная ссылка на систему (link_contr_system)"
			)
		}
	}

	private checkByCounterparties(): void {
		const counterpartiesInnList: string[] =
			this.createDocumentDto?.kontragent || []

		const counterpartiesIdList: string[] =
			this.createDocumentDto?.kontragent_id ||
			this.createDocumentDto?.counterparty_id ||
			this.createDocumentDto?.counterparties_id ||
			[]

		if (
			// Check by available counterparties
			!(
				this.createDocumentDto.boxes_id?.length ||
				counterpartiesInnList.length ||
				counterpartiesIdList.length
			)
		) {
			throw new BadRequestException(
				"Не указан получатель (kontragent/kontragent_id/counterparty_id/counterparties_id/boxes_id)"
			)
		}

		if (counterpartiesInnList.length) {
			this.checkByStringDuplicates(
				counterpartiesInnList,
				"ИНН Контрагентов не должны совпадать inn="
			)
		} else if (counterpartiesIdList.length) {
			this.checkByStringDuplicates(
				counterpartiesIdList,
				"ID Контрагентов не должны совпадать id="
			)
		}
	}

	private checkBoxesId(): void {
		if (this.createDocumentDto?.boxes_id?.length)
			for (const boxId of this.createDocumentDto.boxes_id) {
				const parts: string[] = boxId.split("@")
				const diadocGuidBuilder = new DiadocGuidBuilder()

				const boxIdUuid: string = diadocGuidBuilder.convertSquashedUuidToUuid(
					parts[0]
				)

				if (!isUUID(boxIdUuid) || parts[1] !== "diadoc.ru") {
					throw new BadRequestException("Значение box_id имеет неверный формат")
				}
			}
	}

	private checkCoincidenceByBoxesId(): void {
		if (this.createDocumentDto.boxes_id?.length) {
			if (!this.orgInstance?.box_id) {
				this.logger.warn(
					`Данных о box_id организации ${this.orgInstance.id} нет, проверка совпадения box_id отправителя и получателя пропущена`
				)
				return
			}

			for (const boxId of this.createDocumentDto.boxes_id) {
				if (this.orgInstance.box_id === boxId) {
					throw new BadRequestException(
						`В качестве получателя и отправителя выбран один box_id: ${boxId}`
					)
				}
			}
		}
	}

	private checkByStringDuplicates(list: string[], errorText: string): void {
		const uniqList: string[] = []
		const duplicatesList: string[] = []

		for (const string of list) {
			if (uniqList.includes(string) && !duplicatesList.includes(string)) {
				duplicatesList.push(string)
			}

			uniqList.push(string)
		}

		if (duplicatesList.length) {
			throw new BadRequestException(
				`${errorText}${this.stringBuilder.stringify(duplicatesList)}`
			)
		}
	}

	private checkVgo(): void {
		if (
			this.createDocumentDto?.vgo &&
			!isEnum(this.createDocumentDto.vgo, Vgo)
		) {
			throw new BadRequestException(
				`Поле vgo должно содержать одно из значений: None,One,Two. Получено ${this.createDocumentDto?.vgo}`
			)
		}
	}

	private checkLockMode(): void {
		if (
			this.createDocumentDto?.lock_mode &&
			!isEnum(this.createDocumentDto.lock_mode, PacketLockmode)
		) {
			throw new BadRequestException(
				`Поле lock_mode должно содержать одно из значений: None,Send,Full. Получено ${this.createDocumentDto?.lock_mode}`
			)
		}
	}

	private checkNullValues(): void {
		if (Object.values(this.createDocumentDto).includes(null)) {
			throw new BadRequestException("Не должно быть полей со значением null")
		}
	}

	private oldChecks(): void {
		if (this.createDocumentDto.is_internal) {
			throw new BadRequestException(
				`Поле is_internal должно иметь значение false. Получено ${this.createDocumentDto.is_internal}`
			)
		}

		if (this.createDocumentDto.is_cancelled) {
			throw new BadRequestException(
				`Поле is_cancelled должно иметь значение false. Получено ${this.createDocumentDto.is_cancelled}`
			)
		}

		if (this.createDocumentDto.is_internal) {
			throw new BadRequestException(
				`Поле is_internal должно иметь значение false. Получено ${this.createDocumentDto.is_internal}`
			)
		}

		if (this.createDocumentDto.is_cancelled) {
			throw new BadRequestException(
				`Поле is_cancelled должно иметь значение false. Получено ${this.createDocumentDto.is_cancelled}`
			)
		}
	}
}
