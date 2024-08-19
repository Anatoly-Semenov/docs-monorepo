import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedReceivedFieldToFiles1712297496418
	implements MigrationInterface
{
	name = "AddedReceivedFieldToFiles1712297496418"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "files" ADD "received_date" TIMESTAMP`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "received_date"`)
	}
}
