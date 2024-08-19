import { MigrationInterface, QueryRunner } from "typeorm"

export class AddLinkDiadocTemplateColumnToDocsAndFiles1719405847917
	implements MigrationInterface
{
	name = "AddLinkDiadocTemplateColumnToDocsAndFiles1719405847917"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "files" ADD "link_diadoc_template" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "link_diadoc_template" character varying`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" DROP COLUMN "link_diadoc_template"`
		)
		await queryRunner.query(
			`ALTER TABLE "files" DROP COLUMN "link_diadoc_template"`
		)
	}
}
