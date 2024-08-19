import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedDocumentFlowFlagToOrganizations1710842865709
	implements MigrationInterface
{
	name = "AddedDocumentFlowFlagToOrganizations1710842865709"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "is_document_flow" boolean DEFAULT false`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "is_document_flow"`
		)
	}
}
