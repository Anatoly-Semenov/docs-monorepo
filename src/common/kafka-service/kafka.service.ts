import { randomUUID } from "crypto"

import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger
} from "@nestjs/common"

import { KafkaClientWrapper } from "@docs/common/kafka-client/kafka-client.wrapper"

import { DiadocClientService } from "@docs/common/clients/providers/diadoc/diadoc-client.service"

import {
	IKafkaService,
	IVgoFields
} from "@docs/shared/interfaces/services/kafka-service.interfaces"

import { StatusConstant } from "@docs/shared/constants/status.constants"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"
import { Status } from "@docs/common/db/entities/status.entity"

import {
	IKafkaData,
	IKafkaFactLayerData,
	IKafkaFilesDoc,
	IKafkaTraceData
} from "@docs/shared/interfaces/client/kafka.interfaces"

import { Vgo } from "@docs/shared/enums/docs.enum"
import { FileType } from "@docs/shared/enums/files.enum"

@Injectable()
export class KafkaService implements IKafkaService {
	constructor(private readonly kafkaClientProvider: KafkaClientWrapper) {}

	private readonly logger = new Logger(KafkaService.name)
	private readonly kafkaTopicName =
		"infrastructure.public.quening.linksforsign.updated"

	/**
	 * Функция для отправки обновлений в Kafka на основе документа
	 * @param docInstance инстанс документа
	 * @param fileType одно из значений FileTypeEnum,
	 * определяет тип файла - документ, ПФ или архив
	 * @returns Promise<boolean>
	 */
	async sendToKafkaByDoc(
		docInstance: Docs,
		fileType: FileType
	): Promise<boolean> {
		const allFiles = docInstance.files

		let files: Files[] = []

		switch (fileType) {
			case FileType.DOCUMENT:
				files = allFiles.filter(
					(curr) => !curr.is_archive && !curr.is_print_form
				)
				break
			case FileType.PRINTING_FORM:
				files = allFiles.filter(
					(curr) => curr.is_print_form && !curr.is_archive
				)
				break
			case FileType.ARCHIVE:
				files = allFiles.filter(
					(curr) => !curr.is_print_form && curr.is_archive
				)
				break
			default:
				this.logger.error(`Непредвиденное значение fileType: ${fileType}`)
				throw new InternalServerErrorException("Внутренняя ошибка")
		}

		const preparedData = this.prepareData(docInstance, files)

		return this.sendUpdateToKafka(preparedData)
	}

	/**
	 * Отправка обновлений о готовности печатных форм и архивов
	 * @param docInstance инстанс документа
	 * @param fileInstance инстанс файла (ПФ/архив)
	 * @returns
	 */
	sendNewDiadocFileToKafka(
		docInstance: Docs,
		fileInstance: Files
	): Promise<boolean> {
		try {
			const preparedData: IKafkaFactLayerData = this.prepareData(docInstance, [
				fileInstance
			])

			return this.sendUpdateToKafka(preparedData)
		} catch (e) {
			const errorMessage: string = `Ошибка отправки отчёта о готовности печатных форм и/или архивов:
			document: ${docInstance.id}
			file: ${fileInstance.id}
			error:${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	/**
	 * Отправка обновлений по файлу в Kafka
	 * @param docInstance инстанс документа
	 * @param fileInstance инстанс файла
	 * @returns Promise<boolean>
	 */
	async sendToKafkaByFile(
		docInstance: Docs,
		fileInstance: Files,
		boxIdGuid?: string
	): Promise<boolean> {
		const preparedData: IKafkaFactLayerData = this.prepareData(
			docInstance,
			[fileInstance],
			boxIdGuid
		)

		return this.sendUpdateToKafka(preparedData)
	}

	/**
	 * Подготовка установленной структуры данных для отправки в Kafka
	 * @param docInstance инстанс документа
	 * @param files массив инстансов файлов
	 * @param boxIdGuid boxId организации-отправителя
	 * @returns IKafkaFactLayerData
	 */
	prepareData(
		docInstance: Docs,
		files: Files[],
		boxIdGuid?: string
	): IKafkaFactLayerData {
		const documentLink: string = docInstance.is_template
			? docInstance.link_diadoc_template
			: docInstance.link_diadoc

		const preparedFiles: IKafkaFilesDoc[] = files.map((file: Files) => {
			const activeStatus: Status = file.status.find(
				(status: Status) => status.is_active
			)

			const fileLink: string = docInstance.is_template
				? file.link_diadoc_template
				: file.link_diadoc

			const preparedData: IKafkaFilesDoc = {
				files_state_service: activeStatus?.mapped_status ?? null,
				files_print_form: file.is_print_form,
				files_state: activeStatus?.name ?? null,
				files_archive: file.is_archive,
				files_id: file.source_id,
				files_link_one_side: fileLink,
				files_comment: null,
				files_deleted: null,
				files_links: fileLink
			}

			/** Обработка ВГО только при получении boxIdGuid */
			if (boxIdGuid) {
				const vgoFields: IVgoFields = this.addVgoData(
					docInstance.vgo,
					activeStatus,
					preparedData,
					boxIdGuid
				)

				if (vgoFields.files_links2) {
					preparedData.files_link_two_side = vgoFields.files_links2
				}
				if (vgoFields.files_links3) {
					preparedData.file_link_third_side = vgoFields.files_links3
				}
			}

			return preparedData
		})

		const docStatus: Status = docInstance.status.find(
			(status: Status) => status.is_active
		)
		const mainPreparedFile: IKafkaFilesDoc = preparedFiles.find(
			(file: IKafkaFilesDoc) => file.files_links === documentLink
		)

		const preparedDocument: IKafkaData = {
			state_doc_service: docStatus.service_status,
			state_doc_diadoc: docStatus.mapped_status,
			state_doc: docStatus?.name ?? null,
			doc_link_one_side: documentLink,
			files_doc: preparedFiles,
			links: documentLink
		}

		/** Ищем основной файл для получения ссылки */
		if (mainPreparedFile) {
			if (mainPreparedFile.files_link_two_side) {
				preparedDocument.doc_link_two_side =
					mainPreparedFile.files_link_two_side
			}

			if (mainPreparedFile.file_link_third_side) {
				preparedDocument.doc_link_third_side =
					mainPreparedFile.file_link_third_side
			}
		}

		return {
			trace_data: {
				timestamp: new Date().toISOString(),
				service_name: "signing",
				trace_id: randomUUID()
			},

			id: docInstance.doc_id,
			data: preparedDocument
		}
	}

	/**
	 * Отправка данных в Kafka
	 * @param preparedKafkaObject подготовленный объект IKafkaFactLayerData
	 * @returns Promise<boolean>
	 */
	async sendUpdateToKafka(
		preparedKafkaObject: IKafkaFactLayerData
	): Promise<boolean> {
		try {
			this.logger.log(`Отправляю данные в kafka, id:${preparedKafkaObject.id}`)
			await this.kafkaClientProvider.emit(this.kafkaTopicName, {
				key: preparedKafkaObject.id,
				value: preparedKafkaObject
			})
			this.logger.log(
				`Данные в kafka отправлены, id: ${preparedKafkaObject.id}`
			)
		} catch (e) {
			this.logger.error(`Возникла ошибка при отправке данных в Kafka:
      id: ${preparedKafkaObject.id}
      error: ${e.message}
      `)
			throw new InternalServerErrorException(
				"Ошибка при передаче данных в Kafka"
			)
		}

		return true
	}

	/**
	 * Функция подготовки информации об удалении файла для
	 * отправки в Kafka
	 * @param fileInstances инстансы файла
	 * @param docInstance инстанс документа
	 * @returns IKafkaFactLayerData
	 */
	prepareDeleteByFiles(
		fileInstances: Files[],
		docInstance: Docs
	): IKafkaFactLayerData {
		this.logger.log(
			`Отправляю в Kafka обновление о удалении файлов ${fileInstances.length} шт.`
		)

		if (!fileInstances.length) {
			const errorMessage: string = `При подготовке данных для кафка не получено файлов для документа ${docInstance?.id}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}

		const filesDocs: IKafkaFilesDoc[] = fileInstances.map((file) => {
			return {
				files_id: file.source_id,
				files_links: null,
				files_link_one_side: null,
				files_state: null,
				files_comment: null,
				files_state_service: null,
				files_archive: null,
				files_print_form: null,
				files_deleted: true
			}
		})

		const preparedDocument: IKafkaData = {
			links: null,
			doc_link_one_side: null,
			state_doc_service: null,
			state_doc_diadoc: null,
			state_doc: null,
			files_doc: filesDocs
		}

		const traceData: IKafkaTraceData = {
			service_name: "signing",
			timestamp: new Date().toISOString(),
			trace_id: randomUUID()
		}

		return {
			id: docInstance.doc_id,
			data: preparedDocument,
			trace_data: traceData
		}
	}

	/**
	 * Функция отправки информации об удалении файла в Kafka
	 * @param fileInstances инстанс файла
	 * @param docInstance инстанс документа
	 * @returns Promise<boolean>
	 */
	async sendDeleteByFiles(
		fileInstances: Files[],
		docInstance: Docs
	): Promise<boolean> {
		const preparedData: IKafkaFactLayerData = this.prepareDeleteByFiles(
			fileInstances,
			docInstance
		)

		try {
			this.logger.log(`Отправляю данные в kafka, id: ${preparedData.id}`)
			await this.kafkaClientProvider.emit(this.kafkaTopicName, {
				key: preparedData.id,
				value: preparedData
			})
			this.logger.log(`Данные в kafka отправлены, id: ${preparedData.id}`)
		} catch (e) {
			this.logger.error(`Возникла ошибка при отправке данных в Kafka:
      id: ${preparedData.id}
      error: ${e.message}
      `)
			throw new InternalServerErrorException(
				"Ошибка при передаче данных в Kafka"
			)
		}

		return true
	}

	private addVgoData(
		vgo: Vgo,
		activeStatus: Status,
		preparedData: IKafkaFilesDoc,
		boxIdGuid: string
	): IVgoFields {
		switch (vgo) {
			case Vgo.None:
				return {}
			case Vgo.One:
				if (activeStatus.name === StatusConstant.BILATERAL_STATUS_VGO_TRIGGER) {
					return {
						files_links2: this.replaceBoxIdLink(
							preparedData.files_links,
							boxIdGuid
						)
					}
				}
				return {}
			case Vgo.Two:
				if (
					activeStatus.name ===
					StatusConstant.TRILATERAL_STATUS_STEP2_VGO_TRIGGER
				) {
					return {
						files_links2: this.replaceBoxIdLink(
							preparedData.files_links,
							boxIdGuid
						)
					}
				}

				if (
					activeStatus.name ===
					StatusConstant.TRILATERAL_STATUS_STEP3_VGO_TRIGGER
				) {
					// TODO: Найти и прокинуть guid boxid третьей стороны
					//  когда будет готово трёхстороннее подписание
					return {
						files_links3: this.replaceBoxIdLink(
							preparedData.files_links,
							"MOCK_BOXID_SECOND_COUNTERPARTY"
						)
					}
				}
				return {}
			default:
				const errorMessage: string = `Непредвиденное значение VGO = ${vgo}`
				this.logger.error(errorMessage)
				throw new InternalServerErrorException(errorMessage)
		}
	}

	/**
	 * Функция замены boxIdGuid в ссылке на документ
	 * @param originalLink оригинальная ссылка
	 * @param newBoxIdGuid новый boxIdGuid
	 * @returns новая ссылка (string)
	 */
	private replaceBoxIdLink(originalLink: string, newBoxIdGuid: string): string {
		const centerPartRaw: string = originalLink.split(
			"https://diadoc.kontur.ru/"
		)[1]
		const centerPart: string = centerPartRaw.split("/Document/Show?")[0]
		const leftPart: string = originalLink.split(centerPart)[0]
		const rightPart: string = originalLink.split(centerPart)[1]

		return leftPart + newBoxIdGuid + rightPart
	}
}
