import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedKppToDoc1711985496929 implements MigrationInterface {
	name = "AddedKppToDoc1711985496929"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "docs" ADD "kpp" character varying`)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "inn" DROP NOT NULL`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "inn" SET NOT NULL`
		)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "kpp"`)
	}
}
