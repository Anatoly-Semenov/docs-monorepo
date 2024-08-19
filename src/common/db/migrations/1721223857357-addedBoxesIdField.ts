import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedBoxesIdField1721223857357 implements MigrationInterface {
	name = "AddedBoxesIdField1721223857357"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "boxes_id" character varying`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "boxes_id"`)
	}
}
