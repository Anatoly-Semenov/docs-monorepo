import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedUniqueConstraintToFileSourceid1712233478014
	implements MigrationInterface
{
	name = "AddedUniqueConstraintToFileSourceid1712233478014"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" ADD CONSTRAINT "UQ_d3b2315b39bba0c541261120bb4" UNIQUE ("source_id")`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" DROP CONSTRAINT "UQ_d3b2315b39bba0c541261120bb4"`
		)
	}
}
