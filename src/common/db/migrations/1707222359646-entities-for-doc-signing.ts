import { MigrationInterface, QueryRunner } from "typeorm"

export class EntitiesForDocSigning1707222359646 implements MigrationInterface {
	name = "EntitiesForDocSigning1707222359646"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "systems" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "link" character varying NOT NULL, "message" character varying NOT NULL, CONSTRAINT "PK_aec3139aedeb09c5ae27f2c94d3" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TABLE "docs_recipient" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "docs_id" uuid NOT NULL, "ka_id" character varying NOT NULL, "order" integer NOT NULL, CONSTRAINT "PK_e254393183c20d60aac715a1409" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "is_send" TIMESTAMP NOT NULL, "s3_links" character varying NOT NULL, "file_signing_results" character varying NOT NULL, "document_kind" character varying NOT NULL, "messages_id" character varying NOT NULL, "link_diadoc" character varying NOT NULL, "docs_id" uuid NOT NULL, "status_id" character varying NOT NULL, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TABLE "docs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "doc_id" character varying NOT NULL, "post_id" character varying NOT NULL, "entity_id" character varying NOT NULL, "messages_id" character varying NOT NULL, "packet_id" character varying NOT NULL, "reg_number" character varying NOT NULL, "reg_date" TIMESTAMP NOT NULL, "name" character varying NOT NULL, "document_kind" character varying NOT NULL, "sum" numeric(17,2) NOT NULL, "is_internal" boolean NOT NULL, "is_send" TIMESTAMP NOT NULL, "need_recipient_signature" boolean NOT NULL DEFAULT false, "comment" character varying, "link_contr_system" character varying NOT NULL, "link_diadoc" character varying NOT NULL, "system_id" uuid NOT NULL, "status_id" character varying NOT NULL, "org_id" character varying NOT NULL, CONSTRAINT "REL_20c69af02b0c5a090b1c068595" UNIQUE ("system_id"), CONSTRAINT "PK_3a13e0daf5db0055b25d829f2f2" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TABLE "docs_links" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "parent_doc_id" uuid NOT NULL, "linked_doc_id" uuid NOT NULL, CONSTRAINT "PK_a23d0183f6f90e5915f5298a618" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD CONSTRAINT "FK_4abe471cd9ddb570062223bb208" FOREIGN KEY ("docs_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD CONSTRAINT "FK_2bba1dbc2275185e5c96dece0ee" FOREIGN KEY ("docs_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_20c69af02b0c5a090b1c068595f" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_links" ADD CONSTRAINT "FK_3a5d571da15bb884daf740e0d96" FOREIGN KEY ("parent_doc_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_links" ADD CONSTRAINT "FK_8274349b2610cdc412868ee6dd7" FOREIGN KEY ("linked_doc_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs_links" DROP CONSTRAINT "FK_8274349b2610cdc412868ee6dd7"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_links" DROP CONSTRAINT "FK_3a5d571da15bb884daf740e0d96"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_20c69af02b0c5a090b1c068595f"`
		)
		await queryRunner.query(
			`ALTER TABLE "files" DROP CONSTRAINT "FK_2bba1dbc2275185e5c96dece0ee"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP CONSTRAINT "FK_4abe471cd9ddb570062223bb208"`
		)
		await queryRunner.query(`DROP TABLE "docs_links"`)
		await queryRunner.query(`DROP TABLE "docs"`)
		await queryRunner.query(`DROP TABLE "files"`)
		await queryRunner.query(`DROP TABLE "docs_recipient"`)
		await queryRunner.query(`DROP TABLE "systems"`)
	}
}
