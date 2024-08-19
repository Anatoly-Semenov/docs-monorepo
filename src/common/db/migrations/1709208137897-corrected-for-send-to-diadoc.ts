import { MigrationInterface, QueryRunner } from "typeorm"

export class CorrectedForSendToDiadoc1709208137897
	implements MigrationInterface
{
	name = "CorrectedForSendToDiadoc1709208137897"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" ADD "file_id" character varying NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "diadoc_id" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD CONSTRAINT "UQ_809e149ef37f4443b54a156b05c" UNIQUE ("diadoc_id")`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "is_main" boolean NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "isPublish" boolean NOT NULL DEFAULT false`
		)
		await queryRunner.query(
			`ALTER TABLE "packets" ADD "packetId" character varying NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "is_send" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "s3_links" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "file_signing_results" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "messages_id" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "link_diadoc" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "status_id" DROP NOT NULL`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "status_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "link_diadoc" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "messages_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "file_signing_results" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "s3_links" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "is_send" SET NOT NULL`
		)
		await queryRunner.query(`ALTER TABLE "packets" DROP COLUMN "packetId"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "isPublish"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "is_main"`)
		await queryRunner.query(
			`ALTER TABLE "files" DROP CONSTRAINT "UQ_809e149ef37f4443b54a156b05c"`
		)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "diadoc_id"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "file_id"`)
	}
}
