import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedNullableToAllFieldsOfOrganizations1708066721455
	implements MigrationInterface
{
	name = "AddedNullableToAllFieldsOfOrganizations1708066721455"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "name" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "full_name" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "inn" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "kpp" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "type" DROP NOT NULL`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "organizations" SET "type" = 'ЮЛ' WHERE "type" IS NULL`
		)
		await queryRunner.query(
			`UPDATE "organizations" SET "kpp" = '' WHERE "kpp" IS NULL`
		)
		await queryRunner.query(
			`UPDATE "organizations" SET "inn" = '' WHERE "inn" IS NULL`
		)
		await queryRunner.query(
			`UPDATE "organizations" SET "full_name" = '' WHERE "full_name" IS NULL`
		)
		await queryRunner.query(
			`UPDATE "organizations" SET "name" = '' WHERE "name" IS NULL`
		)

		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "type" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "kpp" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "inn" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "full_name" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "name" SET NOT NULL`
		)
	}
}
