export enum FileType {
	DOCUMENT,
	PRINTING_FORM,
	ARCHIVE
}

export enum FileTypeForDownloadPath {
	PRINT_FORM = "print_form",
	ARCHIVE = "archive"
}

export enum KindFiles {
	StorageInventoryAcceptanceCertificate = "StorageInventoryAcceptanceCertificate",
	ReturnInventoryAcceptanceCertificate = "ReturnInventoryAcceptanceCertificate",
	UniversalCorrectionDocumentRevision = "UniversalCorrectionDocumentRevision",
	PerformedWorkAcceptanceCertificate = "PerformedWorkAcceptanceCertificate",
	UniversalTransferDocumentRevision = "UniversalTransferDocumentRevision",
	LogisticsContainerCertificate = "LogisticsContainerCertificate",
	UniversalCorrectionDocument = "UniversalCorrectionDocument",
	LogisticsWaybillForwarding = "LogisticsWaybillForwarding",
	UniversalTransferDocument = "UniversalTransferDocument",
	InvoiceCorrectionRevision = "InvoiceCorrectionRevision",
	LogisticsCharterAgreement = "LogisticsCharterAgreement",
	LogisticsWaybillReception = "LogisticsWaybillReception",
	XmlAcceptanceCertificate = "XmlAcceptanceCertificate",
	LogisticsWaybillDelivery = "LogisticsWaybillDelivery",
	SupplementaryAgreement = "SupplementaryAgreement",
	TrustConnectionRequest = "TrustConnectionRequest",
	AcceptanceCertificate = "AcceptanceCertificate",
	LogisticsOrderRequest = "LogisticsOrderRequest",
	CertificateRegistry = "CertificateRegistry",
	PriceListAgreement = "PriceListAgreement",
	LogisticsWorkOrder = "LogisticsWorkOrder",
	InvoiceCorrection = "InvoiceCorrection",
	ReconciliationAct = "ReconciliationAct",
	LogisticsWaybill = "LogisticsWaybill",
	InvoiceRevision = "InvoiceRevision",
	ProformaInvoice = "ProformaInvoice",
	PowerOfAttorney = "PowerOfAttorney",
	ServiceDetails = "ServiceDetails",
	Nonformalized = "Nonformalized",
	LogisticsEpl = "LogisticsEpl",
	XmlTorg12 = "XmlTorg12",
	PriceList = "PriceList",
	Contract = "Contract",
	Invoice = "Invoice",
	Waybill = "Waybill",
	Letter = "Letter",
	Torg12 = "Torg12",
	Torg13 = "Torg13",
	Torg2 = "Torg2"
}

export enum KindFilesGrpc {
	STORAGE_INVENTORY_ACCEPTANCE_CERTIFICATE = "STORAGE_INVENTORY_ACCEPTANCE_CERTIFICATE",
	RETURN_INVENTORY_ACCEPTANCE_CERTIFICATE = "RETURN_INVENTORY_ACCEPTANCE_CERTIFICATE",
	UNIVERSAL_CORRECTION_DOCUMENT_REVISION = "UNIVERSAL_CORRECTION_DOCUMENT_REVISION",
	PERFORMED_WORK_ACCEPTANCE_CERTIFICATE = "PERFORMED_WORK_ACCEPTANCE_CERTIFICATE",
	UNIVERSAL_TRANSFER_DOCUMENT_REVISION = "UNIVERSAL_TRANSFER_DOCUMENT_REVISION",
	LOGISTICS_CONTAINER_CERTIFICATE = "LOGISTICS_CONTAINER_CERTIFICATE",
	UNIVERSAL_CORRECTION_DOCUMENT = "UNIVERSAL_CORRECTION_DOCUMENT",
	LOGISTICS_WAYBILL_FORWARDING = "LOGISTICS_WAYBILL_FORWARDING",
	UNIVERSAL_TRANSFER_DOCUMENT = "UNIVERSAL_TRANSFER_DOCUMENT",
	INVOICE_CORRECTION_REVISION = "INVOICE_CORRECTION_REVISION",
	LOGISTICS_CHARTER_AGREEMENT = "LOGISTICS_CHARTER_AGREEMENT",
	LOGISTICS_WAYBILL_RECEPTION = "LOGISTICS_WAYBILL_RECEPTION",
	XML_ACCEPTANCE_CERTIFICATE = "XML_ACCEPTANCE_CERTIFICATE",
	LOGISTICS_WAYBILL_DELIVERY = "LOGISTICS_WAYBILL_DELIVERY",
	TRUST_CONNECTION_REQUEST = "TRUST_CONNECTION_REQUEST",
	SUPPLEMENTARY_AGREEMENT = "SUPPLEMENTARY_AGREEMENT",
	LOGISTICS_ORDER_REQUEST = "LOGISTICS_ORDER_REQUEST",
	ACCEPTANCE_CERTIFICATE = "ACCEPTANCE_CERTIFICATE",
	PRICE_LIST_AGREEMENT = "PRICE_LIST_AGREEMENT",
	CERTIFICATE_REGISTRY = "CERTIFICATE_REGISTRY",
	LOGISTICS_WORK_ORDER = "LOGISTICS_WORK_ORDER",
	INVOICE_CORRECTION = "INVOICE_CORRECTION",
	RECONCILIATION_ACT = "RECONCILIATION_ACT",
	POWER_OF_ATTORNEY = "POWER_OF_ATTORNEY",
	LOGISTICS_WAYBILL = "LOGISTICS_WAYBILL",
	INVOICE_REVISION = "INVOICE_REVISION",
	PROFORMA_INVOICE = "PROFORMA_INVOICE",
	SERVICE_DETAILS = "SERVICE_DETAILS",
	NONFORMALIZED = "NONFORMALIZED",
	LOGISTICS_EPL = "LOGISTICS_EPL",
	XML_TORG_12 = "XML_TORG_12",
	PRICE_LIST = "PRICE_LIST",
	CONTRACT = "CONTRACT",
	INVOICE = "INVOICE",
	TORG_12 = "TORG_12",
	TORG_13 = "TORG_13",
	WAYBILL = "WAYBILL",
	LETTER = "LETTER",
	TORG_2 = "TORG_2"
}

export enum StatusSeverity {
	SUCCESS = "Success",
	INFO = "Info",
	ERROR = "Error"
}

export enum StatusName {
	DOCFLOW_COMPLETE = "Документооборот завершен"
}
