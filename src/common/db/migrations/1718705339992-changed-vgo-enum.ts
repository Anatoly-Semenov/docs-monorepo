import { MigrationInterface, QueryRunner } from "typeorm"

export class ChangedVgoEnum1718705339992 implements MigrationInterface {
	name = "ChangedVgoEnum1718705339992"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("UPDATE docs SET vgo = NULL")
		await queryRunner.query(
			`ALTER TYPE "public"."docs_vgo_enum" RENAME TO "docs_vgo_enum_old"`
		)
		await queryRunner.query(
			`CREATE TYPE "public"."docs_vgo_enum" AS ENUM('None', 'One', 'Two')`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "vgo" DROP DEFAULT`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "vgo" TYPE "public"."docs_vgo_enum" USING "vgo"::"text"::"public"."docs_vgo_enum"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "vgo" SET DEFAULT 'None'`
		)
		await queryRunner.query(`DROP TYPE "public"."docs_vgo_enum_old"`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."docs_vgo_enum_old" AS ENUM('0', '1', '2')`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "vgo" DROP DEFAULT`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "vgo" TYPE "public"."docs_vgo_enum_old" USING "vgo"::"text"::"public"."docs_vgo_enum_old"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "vgo" SET DEFAULT '0'`
		)
		await queryRunner.query(`DROP TYPE "public"."docs_vgo_enum"`)
		await queryRunner.query(
			`ALTER TYPE "public"."docs_vgo_enum_old" RENAME TO "docs_vgo_enum"`
		)
	}
}
