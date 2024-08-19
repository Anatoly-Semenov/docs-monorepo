import { MigrationInterface, QueryRunner } from "typeorm"

export class ImproveDocMetaFields1713881010921 implements MigrationInterface {
	name = "ImproveDocMetaFields1713881010921"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "is_cancelled" boolean NOT NULL DEFAULT false`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "is_template" boolean NOT NULL DEFAULT false`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "is_internal" SET DEFAULT false`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "is_internal" DROP DEFAULT`
		)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "is_template"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "is_cancelled"`)
	}
}
