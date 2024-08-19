import {
	IMetadata,
	IMetaDataKeys
} from "../interfaces/services/docs-service.interfaces"

import { FileConstants } from "../constants/validator/files.constants"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"

/**
 * Подготовка метаданных (структура metadata в диадок)
 * @param file инстанс файла
 * @param docInstance инстанс документа
 * @param metadataForLinkedDoc метаданные, вычисляемые из связанных документов
 * @returns метаданные IMetadata[]
 */
export class MetaDataBuilder {
	constructor(
		file: Files,
		document: Docs,
		metadataForLinkedDoc: IMetaDataKeys
	) {
		this.file = file
		this.document = document
		this.metadataForLinkedDoc = metadataForLinkedDoc
	}

	private file: Files
	private document: Docs
	private metadataForLinkedDoc: IMetaDataKeys
	private metadata: IMetadata[] = []

	public generateMetaData(): IMetadata[] {
		/** Установка имени файла */
		this.metadata.push({
			Key: "FileName",
			Value: this.file.name
		})

		/** Проверка и установка специфичных полей для неструктурированных файлов */
		this.addCurrencyCode()
		this.addTotalSum()
		this.addTotalVat()
		this.addPriceListEffectiveDate()
		this.addBeginDate()
		this.addEndDate()

		/** Проверка и заполнение полей  DocumentNumber, DocumentDate */
		this.addDocumentNumber()
		this.addDocumentDate()

		/** Проверка и заполнение полей ContractDocumentNumber, ContractDocumentDate */
		this.addContractDocumentInfo()

		/** Проверка и заполнение поля Grounds */
		this.addGrounds()

		return this.metadata
	}

	private addCurrencyCode(): void {
		if (
			this.document.currency_code &&
			FileConstants.diadocMetaTags.currencyCode.includes(
				this.file.document_kind
			)
		) {
			this.metadata.push({
				Key: "CurrencyCode",
				Value: this.document.currency_code.toString()
			})
		}
	}

	private addTotalSum(): void {
		if (
			this.file.total_sum &&
			FileConstants.diadocMetaTags.totalSum.includes(this.file.document_kind)
		) {
			this.metadata.push({
				Key: "TotalSum",
				Value: this.file.total_sum.toString()
			})
		}
	}

	private addTotalVat(): void {
		if (
			this.document.total_vat &&
			FileConstants.diadocMetaTags.totalVat.includes(this.file.document_kind)
		) {
			this.metadata.push({
				Key: "TotalVat",
				Value: this.document.total_vat.toString()
			})
		}
	}

	private addPriceListEffectiveDate(): void {
		if (
			this.file.price_list_effective_date &&
			FileConstants.diadocMetaTags.priceListEffectiveDate.includes(
				this.file.document_kind
			)
		) {
			this.metadata.push({
				Key: "PriceListEffectiveDate",
				Value: this.file.price_list_effective_date.toString()
			})
		}
	}

	private addBeginDate(): void {
		if (
			this.file.begin_date &&
			FileConstants.diadocMetaTags.beginDate.includes(this.file.document_kind)
		) {
			this.metadata.push({
				Key: "BeginDate",
				Value: this.file.begin_date.toLocaleString("ru", {
					dateStyle: "short"
				})
			})
		}
	}

	private addEndDate(): void {
		if (
			this.file.end_date &&
			FileConstants.diadocMetaTags.endDate.includes(this.file.document_kind)
		) {
			this.metadata.push({
				Key: "EndDate",
				Value: this.file.end_date.toLocaleDateString("ru", {
					dateStyle: "short"
				})
			})
		}
	}

	private addDocumentNumber(): void {
		if (FileConstants.documentNumberTypes.includes(this.file.document_kind)) {
			this.metadata.push({
				Key: "DocumentNumber",
				Value: this.document.reg_number
			})
		}
	}

	private addDocumentDate(): void {
		if (FileConstants.documentDateTypes.includes(this.file.document_kind)) {
			this.metadata.push({
				Key: "DocumentDate",
				Value: this.document.reg_date.toLocaleString("ru", {
					dateStyle: "short"
				})
			})
		}
	}

	private addContractDocumentInfo(): void {
		if (
			FileConstants.linkedContractMetaDataTypes.includes(
				this.file.document_kind
			)
		) {
			this.metadata.push(this.metadataForLinkedDoc.ContractDocumentDate)
			this.metadata.push(this.metadataForLinkedDoc.ContractDocumentNumber)
		}
	}

	private addGrounds(): void {
		if (FileConstants.groundsMetaDataTypes.includes(this.file.document_kind)) {
			this.metadata.push(this.metadataForLinkedDoc.Grounds)
		}
	}
}
