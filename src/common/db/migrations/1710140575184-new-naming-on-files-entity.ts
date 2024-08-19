import { MigrationInterface, QueryRunner } from "typeorm"

export class NewNamingOnFilesEntity1710140575184 implements MigrationInterface {
	name = "NewNamingOnFilesEntity1710140575184"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" RENAME COLUMN "file_id" TO "source_id"`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" RENAME COLUMN "source_id" TO "file_id"`
		)
	}
}
