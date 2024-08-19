import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedAdditionalStatusFields1712642118897
	implements MigrationInterface
{
	name = "AddedAdditionalStatusFields1712642118897"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "status" ADD "service_status" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ADD "mapped_status" character varying`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "status" DROP COLUMN "mapped_status"`)
		await queryRunner.query(`ALTER TABLE "status" DROP COLUMN "service_status"`)
	}
}
