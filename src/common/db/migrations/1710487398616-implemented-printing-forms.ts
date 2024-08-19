import { MigrationInterface, QueryRunner } from "typeorm"

export class ImplementedPrintingForms1710487398616
	implements MigrationInterface
{
	name = "ImplementedPrintingForms1710487398616"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "files" ADD "is_print_form" boolean`)
		await queryRunner.query(`ALTER TABLE "files" ADD "is_archive" boolean`)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "created_by" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "updated_by" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "deleted_by" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "files" DROP CONSTRAINT "FK_2bba1dbc2275185e5c96dece0ee"`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "document_kind" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" DROP CONSTRAINT "UQ_809e149ef37f4443b54a156b05c"`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "docs_id" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "document_kind" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "status_id" DROP NOT NULL`
		)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "org_id"`)
		await queryRunner.query(`ALTER TABLE "docs" ADD "org_id" uuid`)
		await queryRunner.query(
			`ALTER TABLE "files" ADD CONSTRAINT "FK_2bba1dbc2275185e5c96dece0ee" FOREIGN KEY ("docs_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_2545f1bd5b39ac7fc1f09e58573" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_2545f1bd5b39ac7fc1f09e58573"`
		)
		await queryRunner.query(
			`ALTER TABLE "files" DROP CONSTRAINT "FK_2bba1dbc2275185e5c96dece0ee"`
		)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "org_id"`)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "org_id" character varying NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "status_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "document_kind" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "docs_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD CONSTRAINT "UQ_809e149ef37f4443b54a156b05c" UNIQUE ("diadoc_id")`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "document_kind" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD CONSTRAINT "FK_2bba1dbc2275185e5c96dece0ee" FOREIGN KEY ("docs_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "deleted_by"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "updated_by"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "created_by"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "is_archive"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "is_print_form"`)
	}
}
