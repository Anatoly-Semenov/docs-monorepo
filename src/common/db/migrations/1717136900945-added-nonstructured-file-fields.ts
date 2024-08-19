import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedNonstructuredFileFields1717136900945
	implements MigrationInterface
{
	name = "AddedNonstructuredFileFields1717136900945"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "files" ADD "currency_code" integer`)
		await queryRunner.query(`ALTER TABLE "files" ADD "total_sum" integer`)
		await queryRunner.query(`ALTER TABLE "files" ADD "total_vat" integer`)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "price_list_effective_date" TIMESTAMP`
		)
		await queryRunner.query(`ALTER TABLE "files" ADD "begin_date" TIMESTAMP`)
		await queryRunner.query(`ALTER TABLE "files" ADD "end_date" TIMESTAMP`)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "is_template" DROP DEFAULT`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "is_template" SET DEFAULT false`
		)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "end_date"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "begin_date"`)
		await queryRunner.query(
			`ALTER TABLE "files" DROP COLUMN "price_list_effective_date"`
		)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "total_vat"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "total_sum"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "currency_code"`)
	}
}
