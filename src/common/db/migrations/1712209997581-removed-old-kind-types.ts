import { MigrationInterface, QueryRunner } from "typeorm"

export class RemovedOldKindTypes1712209997581 implements MigrationInterface {
	name = "RemovedOldKindTypes1712209997581"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "document_kind"`)
		await queryRunner.query(`DROP TYPE "public"."files_document_kind_enum"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "document_kind"`)
		await queryRunner.query(`DROP TYPE "public"."docs_document_kind_enum"`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."docs_document_kind_enum" AS ENUM('Неформализованный документ', 'Счет-фактура', 'Договор', 'КС2', 'УПД', 'Исправление УПД', 'Корректировочный счет-фактура', 'Исправление корректировочного СФ', 'УКД', 'Исправление УКД')`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "document_kind" "public"."docs_document_kind_enum"`
		)
		await queryRunner.query(
			`CREATE TYPE "public"."files_document_kind_enum" AS ENUM('Неформализованный документ', 'Счет-фактура', 'Договор', 'КС2', 'УПД', 'Исправление УПД', 'Корректировочный счет-фактура', 'Исправление корректировочного СФ', 'УКД', 'Исправление УКД')`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "document_kind" "public"."files_document_kind_enum"`
		)
	}
}
