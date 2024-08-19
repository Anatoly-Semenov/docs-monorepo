import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedLockmodeFieldToDoc1717674820404
	implements MigrationInterface
{
	name = "AddedLockmodeFieldToDoc1717674820404"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."docs_lockmode_enum" AS ENUM('None', 'Send', 'Full')`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "lockMode" "public"."docs_lockmode_enum" DEFAULT 'None'`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "lockMode"`)
		await queryRunner.query(`DROP TYPE "public"."docs_lockmode_enum"`)
	}
}
