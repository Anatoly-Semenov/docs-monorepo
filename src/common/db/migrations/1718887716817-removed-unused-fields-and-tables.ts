import { MigrationInterface, QueryRunner } from "typeorm"

export class RemovedUnusedFieldsAndTables1718887716817
	implements MigrationInterface
{
	name = "RemovedUnusedFieldsAndTables1718887716817"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "department" CASCADE`)
		await queryRunner.query(`DROP TABLE IF EXISTS "employee" CASCADE`)
		await queryRunner.query(`DROP TABLE IF EXISTS "exchange" CASCADE`)
		await queryRunner.query(
			`DROP TABLE IF EXISTS "exchange_departments_relations" CASCADE`
		)
		await queryRunner.query(`DROP TABLE IF EXISTS "inbox" CASCADE`)
		await queryRunner.query(`DROP TABLE IF EXISTS "outbox" CASCADE`)

		await queryRunner.query(`ALTER TABLE "status" DROP COLUMN "key_status"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "is_send"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "s3_links"`)
		await queryRunner.query(
			`ALTER TABLE "files" DROP COLUMN "file_signing_results"`
		)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "messages_id"`)
		await queryRunner.query(`ALTER TABLE "systems" DROP COLUMN "message"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "entity_id"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "is_send"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "status_id"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "kpp"`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "docs" ADD "kpp" character varying`)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "status_id" character varying`
		)
		await queryRunner.query(`ALTER TABLE "docs" ADD "is_send" TIMESTAMP`)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "entity_id" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "systems" ADD "message" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "messages_id" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "file_signing_results" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "s3_links" character varying`
		)
		await queryRunner.query(`ALTER TABLE "files" ADD "is_send" TIMESTAMP`)
		await queryRunner.query(
			`ALTER TABLE "status" ADD "key_status" character varying`
		)
	}
}
