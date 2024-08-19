import { MigrationInterface, QueryRunner } from "typeorm"

export class ImproveDocLinkEntity1713949831413 implements MigrationInterface {
	name = "ImproveDocLinkEntity1713949831413"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs_links" ADD "remote_linked_doc_id" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_links" DROP CONSTRAINT "FK_8274349b2610cdc412868ee6dd7"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_links" ALTER COLUMN "linked_doc_id" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_links" ADD CONSTRAINT "FK_8274349b2610cdc412868ee6dd7" FOREIGN KEY ("linked_doc_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs_links" DROP CONSTRAINT "FK_8274349b2610cdc412868ee6dd7"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_links" ALTER COLUMN "linked_doc_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_links" ADD CONSTRAINT "FK_8274349b2610cdc412868ee6dd7" FOREIGN KEY ("linked_doc_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_links" DROP COLUMN "remote_linked_doc_id"`
		)
	}
}
