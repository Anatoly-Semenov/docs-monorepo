import { MigrationInterface, QueryRunner } from "typeorm"

export class ChangedSummFieldsTypeToFloat1721302665398
	implements MigrationInterface
{
	name = "ChangedSummFieldsTypeToFloat1721302665398"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "total_sum"`)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "total_sum" double precision`
		)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "total_vat"`)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "total_vat" double precision`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "total_vat"`)
		await queryRunner.query(`ALTER TABLE "files" ADD "total_vat" integer`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "total_sum"`)
		await queryRunner.query(`ALTER TABLE "files" ADD "total_sum" integer`)
	}
}
