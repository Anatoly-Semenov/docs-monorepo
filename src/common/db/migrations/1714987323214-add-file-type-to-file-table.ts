import { MigrationInterface, QueryRunner } from "typeorm"

export class AddFileTypeToFileTable1714987323214 implements MigrationInterface {
	name = "AddFileTypeToFileTable1714987323214"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" ADD "file_type" character varying`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "file_type"`)
	}
}
