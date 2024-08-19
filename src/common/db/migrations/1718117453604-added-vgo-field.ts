import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedVgoField1718117453604 implements MigrationInterface {
	name = "AddedVgoField1718117453604"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."docs_vgo_enum" AS ENUM('0', '1', '2')`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "vgo" "public"."docs_vgo_enum" DEFAULT '0'`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "vgo"`)
		await queryRunner.query(`DROP TYPE "public"."docs_vgo_enum"`)
	}
}
