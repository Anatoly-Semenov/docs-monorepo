import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common"

import { DiadocClientService } from "@docs/common/clients/providers/diadoc/diadoc-client.service"

import { DocsService } from "../docs-service/docs.service"
import { DocsServiceDb } from "@docs/common/db/services/docs-service/docs.service"
import { FilesServiceDb } from "@docs/common/db/services/files-service/files.service"
import { KafkaService } from "@docs/common/kafka-service/kafka.service"
import { IDeleteDocsService } from "@docs/shared/interfaces/services/delete-docs-service.interfaces"
import { IDiadocStatus } from "@docs/shared/interfaces/services/docs-service.interfaces"

import {
	IOC__KAFKA_SERVICE,
	IOC__SERVICE__CLIENT_PROVIDER_DIADOC,
	IOC__SERVICE__DOCS,
	IOC__SERVICE__DOCS_DB,
	IOC__SERVICE__FILES_DB
} from "@docs/shared/constants/ioc.constants"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Status } from "@docs/common/db/entities/status.entity"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

@Injectable()
export class DeleteDocsService implements IDeleteDocsService {
	constructor(
		@Inject(IOC__SERVICE__DOCS)
		private readonly docsService: DocsService,

		@Inject(IOC__SERVICE__DOCS_DB)
		private readonly docsServiceDb: DocsServiceDb,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_DIADOC)
		private readonly diadocService: DiadocClientService,

		@Inject(IOC__SERVICE__FILES_DB)
		private readonly filesServiceDb: FilesServiceDb,

		@Inject(IOC__KAFKA_SERVICE)
		private readonly kafkaService: KafkaService
	) {}

	private readonly logger = new Logger(DeleteDocsService.name)

	/**
	 * Удаление документа от смежных систем
	 * @param docId doc_id документа
	 * @param systemPayload IJwtPayloadSystem (из токена)
	 */
	public async deleteFromSystem(
		docId: string,
		systemPayload: IJwtPayloadSystem
	): Promise<string> {
		const docInstance: Docs = await this.docsService.getByDocId(
			docId,
			systemPayload
		)
		const extendedDocInstance: Docs =
			await this.docsService.getExtendedDocInfoById(docInstance.id)

		await this.checkCanDocumentDelete(extendedDocInstance)

		// Запрос в диадок
		if (extendedDocInstance.isPublish) {
			await this.diadocService.deleteFromDiadoc(
				extendedDocInstance.organization.box_id,
				extendedDocInstance.messages_id
			)
		}

		// Удаление документа и файлов
		await this.removeDocumentWithFiles(extendedDocInstance.id)

		// Отправка обновлений в Кафка
		await this.kafkaService.sendDeleteByFiles(
			extendedDocInstance.files,
			extendedDocInstance
		)

		return "Документ с файлами успешно удален"
	}

	/**
	 * Проверка возможности удаления документа
	 * @param extendedDocInstance инстанс документа
	 * @returns boolean
	 */
	private async checkCanDocumentDelete(
		extendedDocInstance: Docs
	): Promise<void> {
		if (
			extendedDocInstance.isPublish &&
			extendedDocInstance.messages_id &&
			extendedDocInstance.organization.box_id
		) {
			// Проверка возможности удаления на основе статуса
			this.checkCanDeleteDocumentByStatus(extendedDocInstance)

			// Проверка возможности удаления на основе ответа от Диадок
			await this.checkCanDeleteByDiadoc(extendedDocInstance)
		}

		this.logger.log(`Удаление документа ${extendedDocInstance.id} разрешено`)
	}

	/**
	 * Проверка возможности удаления на основе статуса в Диадок
	 * @param docInstance инстанс документа
	 * @returns boolean
	 */
	private async checkCanDeleteByDiadoc(docInstance: Docs): Promise<void> {
		const status: IDiadocStatus = await this.diadocService.getCurrentStatus(
			docInstance.organization.box_id,
			docInstance.messages_id
		)

		if (
			!(
				status.StatusText.includes("Требуется подписать и отправить") &&
				status.Severity.includes("Warning")
			)
		) {
			const errorMessage: string =
				"Удаление запрещено, т.к. документ подписан в Диадок"
			this.logger.error(errorMessage)
			throw new BadRequestException(errorMessage)
		}
	}

	private checkCanDeleteDocumentByStatus(extendedDocInstance: Docs): void {
		const activeStatus: Status = extendedDocInstance.status.find(
			(status) => status.is_active
		)

		if (
			!(
				activeStatus.name.includes("Требуется подписать и отправить") &&
				activeStatus.severity.includes("Warning")
			)
		) {
			const errorMessage: string = "Удаление запрещено, т.к. документ подписан"
			this.logger.error(errorMessage)
			throw new BadRequestException(errorMessage)
		}
	}

	async removeDocumentWithFiles(id: string): Promise<boolean> {
		this.logger.log(`Запущено удаление файлов и документа с ID = ${id}`)
		const docInstance = await this.docsServiceDb.getExtendedDocInfoById(id)
		const systemId: string = docInstance.system.id
		const fileInstances = docInstance.files

		await this.filesServiceDb.bullSoftDeleteByInstances(fileInstances, systemId)

		this.logger.log(`Удалено ${fileInstances.length} файлов`)

		this.logger.log(`Удаляю документ ${id}`)
		await this.docsService.deleteByDocId(docInstance.doc_id, systemId)

		return true
	}
}
