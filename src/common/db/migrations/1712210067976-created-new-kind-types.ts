import { MigrationInterface, QueryRunner } from "typeorm"

export class CreatedNewKindTypes1712210067976 implements MigrationInterface {
	name = "CreatedNewKindTypes1712210067976"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."files_document_kind_enum" AS ENUM('Nonformalized', 'Invoice', 'Contract', 'PerformedWorkAcceptanceCertificate', 'UniversalTransferDocument', 'UniversalTransferDocumentRevision', 'UniversalCorrectionDocument', 'UniversalCorrectionDocumentRevision', 'InvoiceRevision', 'InvoiceCorrection', 'InvoiceCorrectionRevision', 'Letter', 'SupplementaryAgreement', 'AcceptanceCertificate', 'TrustConnectionRequest', 'Torg12', 'ProformaInvoice', 'XmlTorg12', 'XmlAcceptanceCertificate', 'PriceList', 'PriceListAgreement', 'CertificateRegistry', 'ReconciliationAct', 'Torg13', 'ServiceDetails', 'StorageInventoryAcceptanceCertificate', 'ReturnInventoryAcceptanceCertificate', 'LogisticsWorkOrder', 'LogisticsContainerCertificate', 'LogisticsCharterAgreement', 'LogisticsOrderRequest', 'Torg2', 'Waybill', 'PowerOfAttorney', 'LogisticsWaybillReception', 'LogisticsWaybillDelivery', 'LogisticsWaybillForwarding', 'LogisticsEpl', 'LogisticsWaybill')`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "document_kind" "public"."files_document_kind_enum"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "document_kind" character varying`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "document_kind"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "document_kind"`)
		await queryRunner.query(`DROP TYPE "public"."files_document_kind_enum"`)
	}
}
