import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIsDeletedFromS3ColumnToFilesTable1716971087831
	implements MigrationInterface
{
	name = "AddIsDeletedFromS3ColumnToFilesTable1716971087831"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" ADD "is_deleted_from_s3" boolean NOT NULL DEFAULT false`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" DROP COLUMN "is_deleted_from_s3"`
		)
	}
}
