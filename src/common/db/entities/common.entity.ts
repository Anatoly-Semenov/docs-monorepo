import {
	BaseEntity,
	CreateDateColumn,
	DeleteDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from "typeorm"

export class CommonEntity extends BaseEntity {
	@PrimaryGeneratedColumn("uuid", {
		comment: "Внутренний id сущности"
	})
	id: string

	@CreateDateColumn({
		comment: "Дата создания сущности"
	})
	created_at: Date

	@UpdateDateColumn({
		comment: "Дата внесения изменений в сущность"
	})
	updated_at: Date

	@DeleteDateColumn({
		comment: "Дата удаления сущности"
	})
	deleted_at: Date
}
