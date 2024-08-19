import { MigrationInterface, QueryRunner } from "typeorm"

export class SetLinkContrSystemNullable1713523975080
	implements MigrationInterface
{
	name = "SetLinkContrSystemNullable1713523975080"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "link_contr_system" DROP NOT NULL`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "link_contr_system" SET NOT NULL`
		)
	}
}
