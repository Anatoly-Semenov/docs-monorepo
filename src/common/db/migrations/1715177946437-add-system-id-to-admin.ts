import { MigrationInterface, QueryRunner } from "typeorm"

export class AddSystemIdToAdmin1715177946437 implements MigrationInterface {
	name = "AddSystemIdToAdmin1715177946437"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "admin_users" ADD "system_id" uuid`)
		await queryRunner.query(
			`ALTER TABLE "admin_users" ALTER COLUMN "rights" SET DEFAULT 'canRead'`
		)
		await queryRunner.query(
			`ALTER TABLE "admin_users" ADD CONSTRAINT "FK_8bdf2c5c8395ba5decb66da1715" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "admin_users" DROP CONSTRAINT "FK_8bdf2c5c8395ba5decb66da1715"`
		)
		await queryRunner.query(
			`ALTER TABLE "admin_users" ALTER COLUMN "rights" SET DEFAULT 'create, read'`
		)
		await queryRunner.query(`ALTER TABLE "admin_users" DROP COLUMN "system_id"`)
	}
}
