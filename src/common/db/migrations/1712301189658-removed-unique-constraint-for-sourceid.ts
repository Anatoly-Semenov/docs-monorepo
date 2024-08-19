import { MigrationInterface, QueryRunner } from "typeorm"

export class RemovedUniqueConstraintForSourceid1712301189658
	implements MigrationInterface
{
	name = "RemovedUniqueConstraintForSourceid1712301189658"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" DROP CONSTRAINT "UQ_d3b2315b39bba0c541261120bb4"`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "need_recipient_signature" DROP NOT NULL`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "need_recipient_signature" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD CONSTRAINT "UQ_d3b2315b39bba0c541261120bb4" UNIQUE ("source_id")`
		)
	}
}
