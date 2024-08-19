import { KindFiles, KindFilesGrpc } from "@docs/shared/enums/files.enum"

export function kindFilesGrpcMapper(
	value: KindFilesGrpc | unknown
): KindFiles | undefined {
	switch (value) {
		case KindFilesGrpc.STORAGE_INVENTORY_ACCEPTANCE_CERTIFICATE:
			return KindFiles.StorageInventoryAcceptanceCertificate
		case KindFilesGrpc.RETURN_INVENTORY_ACCEPTANCE_CERTIFICATE:
			return KindFiles.ReturnInventoryAcceptanceCertificate
		case KindFilesGrpc.UNIVERSAL_CORRECTION_DOCUMENT_REVISION:
			return KindFiles.UniversalCorrectionDocumentRevision
		case KindFilesGrpc.PERFORMED_WORK_ACCEPTANCE_CERTIFICATE:
			return KindFiles.PerformedWorkAcceptanceCertificate
		case KindFilesGrpc.UNIVERSAL_TRANSFER_DOCUMENT_REVISION:
			return KindFiles.UniversalTransferDocumentRevision
		case KindFilesGrpc.LOGISTICS_CONTAINER_CERTIFICATE:
			return KindFiles.LogisticsContainerCertificate
		case KindFilesGrpc.UNIVERSAL_CORRECTION_DOCUMENT:
			return KindFiles.UniversalCorrectionDocument
		case KindFilesGrpc.LOGISTICS_WAYBILL_FORWARDING:
			return KindFiles.LogisticsWaybillForwarding
		case KindFilesGrpc.UNIVERSAL_TRANSFER_DOCUMENT:
			return KindFiles.UniversalTransferDocument
		case KindFilesGrpc.INVOICE_CORRECTION_REVISION:
			return KindFiles.InvoiceCorrectionRevision
		case KindFilesGrpc.LOGISTICS_CHARTER_AGREEMENT:
			return KindFiles.LogisticsCharterAgreement
		case KindFilesGrpc.LOGISTICS_WAYBILL_RECEPTION:
			return KindFiles.LogisticsWaybillReception
		case KindFilesGrpc.XML_ACCEPTANCE_CERTIFICATE:
			return KindFiles.XmlAcceptanceCertificate
		case KindFilesGrpc.LOGISTICS_WAYBILL_DELIVERY:
			return KindFiles.LogisticsWaybillDelivery
		case KindFilesGrpc.TRUST_CONNECTION_REQUEST:
			return KindFiles.SupplementaryAgreement
		case KindFilesGrpc.SUPPLEMENTARY_AGREEMENT:
			return KindFiles.TrustConnectionRequest
		case KindFilesGrpc.LOGISTICS_ORDER_REQUEST:
			return KindFiles.AcceptanceCertificate
		case KindFilesGrpc.ACCEPTANCE_CERTIFICATE:
			return KindFiles.LogisticsOrderRequest
		case KindFilesGrpc.PRICE_LIST_AGREEMENT:
			return KindFiles.CertificateRegistry
		case KindFilesGrpc.CERTIFICATE_REGISTRY:
			return KindFiles.PriceListAgreement
		case KindFilesGrpc.LOGISTICS_WORK_ORDER:
			return KindFiles.LogisticsWorkOrder
		case KindFilesGrpc.INVOICE_CORRECTION:
			return KindFiles.InvoiceCorrection
		case KindFilesGrpc.RECONCILIATION_ACT:
			return KindFiles.ReconciliationAct
		case KindFilesGrpc.POWER_OF_ATTORNEY:
			return KindFiles.LogisticsWaybill
		case KindFilesGrpc.LOGISTICS_WAYBILL:
			return KindFiles.InvoiceRevision
		case KindFilesGrpc.INVOICE_REVISION:
			return KindFiles.ProformaInvoice
		case KindFilesGrpc.PROFORMA_INVOICE:
			return KindFiles.PowerOfAttorney
		case KindFilesGrpc.SERVICE_DETAILS:
			return KindFiles.ServiceDetails
		case KindFilesGrpc.NONFORMALIZED:
			return KindFiles.Nonformalized
		case KindFilesGrpc.LOGISTICS_EPL:
			return KindFiles.LogisticsEpl
		case KindFilesGrpc.XML_TORG_12:
			return KindFiles.XmlTorg12
		case KindFilesGrpc.PRICE_LIST:
			return KindFiles.PriceList
		case KindFilesGrpc.CONTRACT:
			return KindFiles.Contract
		case KindFilesGrpc.INVOICE:
			return KindFiles.Invoice
		case KindFilesGrpc.TORG_12:
			return KindFiles.Waybill
		case KindFilesGrpc.TORG_13:
			return KindFiles.Letter
		case KindFilesGrpc.WAYBILL:
			return KindFiles.Torg12
		case KindFilesGrpc.LETTER:
			return KindFiles.Torg13
		case KindFilesGrpc.TORG_2:
			return KindFiles.Torg2
		default:
			return undefined
	}
}
