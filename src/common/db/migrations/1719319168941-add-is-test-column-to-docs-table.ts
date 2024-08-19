import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIsTestColumnToDocsTable1719319168941
	implements MigrationInterface
{
	name = "AddIsTestColumnToDocsTable1719319168941"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "is_test" boolean NOT NULL DEFAULT false`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "is_test"`)
	}
}
