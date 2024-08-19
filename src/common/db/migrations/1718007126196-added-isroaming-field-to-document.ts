import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedIsroamingFieldToDocument1718007126196
	implements MigrationInterface
{
	name = "AddedIsroamingFieldToDocument1718007126196"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "docs" ADD "isRoaming" boolean`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "isRoaming"`)
	}
}
