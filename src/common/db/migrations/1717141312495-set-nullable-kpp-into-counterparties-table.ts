import { MigrationInterface, QueryRunner } from "typeorm"

export class SetNullableKppIntoCounterpartiesTable1717141312495
	implements MigrationInterface
{
	name = "SetNullableKppIntoCounterpartiesTable1717141312495"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "counterparties" ALTER COLUMN "kpp" DROP NOT NULL`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "counterparties" ALTER COLUMN "kpp" SET NOT NULL`
		)
	}
}
