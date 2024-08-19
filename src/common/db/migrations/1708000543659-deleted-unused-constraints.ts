import { MigrationInterface, QueryRunner } from "typeorm"

export class DeletedUnusedConstraints1708000543659
	implements MigrationInterface
{
	name = "DeletedUnusedConstraints1708000543659"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "org_id" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "box_id" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "fns_participant_id" DROP NOT NULL`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "organizations" SET "fns_participant_id" = '' WHERE "fns_participant_id" IS NULL`
		)
		await queryRunner.query(
			`UPDATE "organizations" SET "box_id" = '' WHERE "box_id" IS NULL`
		)
		await queryRunner.query(
			`UPDATE "organizations" SET "org_id" = '' WHERE "org_id" IS NULL`
		)

		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "fns_participant_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "box_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ALTER COLUMN "org_id" SET NOT NULL`
		)
	}
}
