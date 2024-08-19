import { MigrationInterface, QueryRunner } from "typeorm"

export class SetNullableToIsTemplateField1714211906182
	implements MigrationInterface
{
	name = "SetNullableToIsTemplateField1714211906182"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "is_template" DROP NOT NULL`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "is_template" SET NOT NULL`
		)
	}
}
