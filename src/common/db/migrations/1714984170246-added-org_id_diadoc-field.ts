import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedOrgIdDiadocField1714984170246 implements MigrationInterface {
	name = "AddedOrgIdDiadocField1714984170246"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "org_id_diadoc" character varying`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "org_id_diadoc"`
		)
	}
}
