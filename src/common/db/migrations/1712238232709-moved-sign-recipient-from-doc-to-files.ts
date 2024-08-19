import { MigrationInterface, QueryRunner } from "typeorm"

export class MovedSignRecipientFromDocToFiles1712238232709
	implements MigrationInterface
{
	name = "MovedSignRecipientFromDocToFiles1712238232709"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" DROP COLUMN "need_recipient_signature"`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "need_recipient_signature" boolean NOT NULL DEFAULT false`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "source_id" DROP NOT NULL`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "source_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "files" DROP COLUMN "need_recipient_signature"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "need_recipient_signature" boolean NOT NULL DEFAULT false`
		)
	}
}
