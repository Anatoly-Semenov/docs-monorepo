import { MigrationInterface, QueryRunner } from "typeorm"

export class ChangesForStatusProcessing1709807381797
	implements MigrationInterface
{
	name = "ChangesForStatusProcessing1709807381797"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "status_id"`)
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "box_id_guid" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "status" DROP CONSTRAINT "FK_30c1ab87085b2862537b6141ee2"`
		)
		await queryRunner.query(
			`ALTER TABLE "status" DROP CONSTRAINT "FK_3ef1d36b4f53f83d21b404747c7"`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ALTER COLUMN "docs_id" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ALTER COLUMN "files_id" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ALTER COLUMN "key_status" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ADD CONSTRAINT "FK_30c1ab87085b2862537b6141ee2" FOREIGN KEY ("docs_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ADD CONSTRAINT "FK_3ef1d36b4f53f83d21b404747c7" FOREIGN KEY ("files_id") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "status" DROP CONSTRAINT "FK_3ef1d36b4f53f83d21b404747c7"`
		)
		await queryRunner.query(
			`ALTER TABLE "status" DROP CONSTRAINT "FK_30c1ab87085b2862537b6141ee2"`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ALTER COLUMN "key_status" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ALTER COLUMN "files_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ALTER COLUMN "docs_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ADD CONSTRAINT "FK_3ef1d36b4f53f83d21b404747c7" FOREIGN KEY ("files_id") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ADD CONSTRAINT "FK_30c1ab87085b2862537b6141ee2" FOREIGN KEY ("docs_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "box_id_guid"`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "status_id" character varying`
		)
	}
}
