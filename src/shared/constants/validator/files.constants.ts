export namespace FileConstants {
	/** Метатеги для Диадок и их связь с типом файла */
	export const diadocMetaTags = {
		endDate: [],
		beginDate: [],
		currencyCode: ["Torg13"],
		totalVat: ["AcceptanceCertificate"],
		priceListEffectiveDate: ["PriceList"],
		totalSum: ["Torg12", "AcceptanceCertificate", "Torg13", "ProformaInvoice"]
	}

	/** Список типов файлов, к которым применимы метатеги DocumentNumber, DocumentDate */
	export const documentNumberTypes: string[] = [
		"Torg12",
		"Torg13",
		"Letter",
		"Contract",
		"PriceList",
		"ProformaInvoice",
		"ReconciliationAct",
		"SupplementaryAgreement"
	]
	export const documentDateTypes: string[] = [
		...documentNumberTypes,
		"AcceptanceCertificate",
		"PowerOfAttorney"
	]

	/** Список типов файлов, к которым применимы метатеги связанных документов */
	export const linkedContractMetaDataTypes: string[] = [
		"PriceList",
		"SupplementaryAgreement"
	]

	/** Список типов файлов, к которым применимы метатеги Grounds */
	export const groundsMetaDataTypes: string[] = ["Torg13"]

	/** Сопоставление типа файла и обязательных метатегов */
	export const nonStructuredKeys: Record<string, string[]> = {
		StorageInventoryAcceptanceCertificate: [],
		PriceList: ["price_list_effective_date"],
		ReturnInventoryAcceptanceCertificate: [],
		UniversalCorrectionDocumentRevision: [],
		PerformedWorkAcceptanceCertificate: [],
		UniversalTransferDocumentRevision: [],
		AcceptanceCertificate: ["total_sum"],
		LogisticsContainerCertificate: [],
		UniversalCorrectionDocument: [],
		ProformaInvoice: ["total_sum"],
		LogisticsWaybillForwarding: [],
		UniversalTransferDocument: [],
		InvoiceCorrectionRevision: [],
		LogisticsCharterAgreement: [],
		LogisticsWaybillReception: [],
		XmlAcceptanceCertificate: [],
		LogisticsWaybillDelivery: [],
		TrustConnectionRequest: [],
		SupplementaryAgreement: [],
		LogisticsOrderRequest: [],
		CertificateRegistry: [],
		PriceListAgreement: [],
		common: ["name_files"],
		LogisticsWorkOrder: [],
		Torg13: ["total_sum"],
		Torg12: ["total_sum"],
		ReconciliationAct: [],
		InvoiceCorrection: [],
		LogisticsWaybill: [],
		PowerOfAttorney: [],
		InvoiceRevision: [],
		ServiceDetails: [],
		Nonformalized: [],
		LogisticsEpl: [],
		XmlTorg12: [],
		Contract: [],
		Invoice: [],
		Waybill: [],
		Letter: [],
		Torg2: []
	}

	/** Типы файлов, для которых запрещён внутренний документооборот (is_internal) */
	export const deniedInternalFlagKeys: string[] = [
		"Letter",
		"PowerOfAttorney",
		"TrustConnectionRequest"
	]

	/** Служебные поля таблицы файлов */
	const systemFields: string[] = [
		"file_type",
		"created_by",
		"updated_by",
		"deleted_by"
	]

	/** Общий список допустимых полей */
	export const acceptableFields: string[] = [
		...Object.values(nonStructuredKeys).flat(),
		...systemFields,

		"need_recipient_signature",
		"kind_files",
		"type_files",
		"begin_date",
		"end_date",
		"file_id",
		"file"
	]
}
