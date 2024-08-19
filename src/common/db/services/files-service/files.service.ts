import { default as dayjs, ManipulateType } from "dayjs"

import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { EntityManager, In, IsNull, LessThan, Repository } from "typeorm"
import { FindManyOptions } from "typeorm/find-options/FindManyOptions"
import { FindOptionsWhere } from "typeorm/find-options/FindOptionsWhere"

import { IFilesServiceDb } from "@docs/shared/interfaces/services/db/files-service.interfaces"

import { Sentry } from "@docs/shared/decorators/sentry.decorator"

import { GenerateFileLink } from "@docs/shared/helpers/file-link-generator.helper"

import { Files } from "@docs/common/db/entities/files.entity"

import { CreateFileDto } from "@docs/shared/dto/v1/db-dto/file/create-file.dto"
import { FileDto } from "@docs/shared/dto/v1/db-dto/file/files.dto"

import {
	FileTypeForDownloadPath,
	StatusSeverity
} from "@docs/shared/enums/files.enum"

@Injectable()
@Sentry
export class FilesServiceDb implements IFilesServiceDb {
	constructor(
		@InjectRepository(Files)
		private readonly filesRepository: Repository<Files>
	) {}

	private readonly logger = new Logger(FilesServiceDb.name)

	private setError(message: string, error: any): void {
		this.logger.error(message)
		throw new InternalServerErrorException(
			`${message} | ${JSON.stringify(error)}`
		)
	}

	async create(createFileDto: CreateFileDto): Promise<Files> {
		try {
			this.logger.log("Создаю новый файл")

			// @ts-ignore
			const file: Files = await this.filesRepository.create(createFileDto)

			this.logger.log(`Новый файл успешно создан, docs_id=${file.docs_id}`)

			return file
		} catch (error) {
			this.setError("Ошибка создания файла", error)
		}
	}

	async saveEntity(entity: Files): Promise<Files> {
		try {
			this.logger.log(`Сохраняю файл id:${entity.id}`)

			const file: Files = await this.filesRepository.save(entity)

			this.logger.log(`Файл успешно сохранен id:${entity.id}`)

			return file
		} catch (error) {
			this.setError(`Ошибка сохранения файла id:${entity.id}`, error)
		}
	}

	async getByFilename(filename: string): Promise<Files> {
		this.logger.log(`Ищу запись о файле по Filename: ${filename}`)
		try {
			const fileInstance = await this.filesRepository.findOneBy({
				name: filename
			})

			if (!fileInstance) {
				this.logger.log(`Не удалось найти файл ${filename}`)
				throw new NotFoundException("Не удалось найти файл")
			}

			return fileInstance
		} catch (error) {
			this.setError(
				`Ошибка при чтении файла:
      filename: ${filename}
      error: ${error.message}`,
				error
			)
		}
	}

	async setDiadocIdByFilename(
		filename: string,
		diadocId: string
	): Promise<Files> {
		this.logger.log(`Устаналвиваю diadocId ${diadocId} в файл ${filename}`)
		try {
			const fileInstance = await this.getByFilename(filename)

			fileInstance.diadoc_id = diadocId

			return this.filesRepository.save(fileInstance)
		} catch (error) {
			this.setError(
				`Ошибка при установке diadocId по filename:
      filename: ${filename}
      diadocId: ${diadocId}
      error: ${error.message}`,
				error
			)
		}
	}

	/**
	 * Функция для установки diadoc_id и ссылки на файл после
	 * получения этих данных от Диадок
	 * @param id внутренний ID файла
	 * @param diadocId значение diadoc_id от Диадок
	 * @param messageId значение message_id от Диадок
	 * @param fromBoxIdGuid uuid-представление boxId
	 * @returns Promise<Files>
	 */
	async setDiadocIdAndLink(
		id: string,
		diadocId: string,
		messageId: string,
		fromBoxIdGuid: string
	): Promise<Files> {
		this.logger.log(
			`Устаналвиваю diadocId ${diadocId} в файл с ID ${id} и создаю ссылку`
		)
		try {
			const fileInstance: Files = await this.getById(id)
			const link: string = GenerateFileLink(messageId, diadocId, fromBoxIdGuid)
			this.logger.log(`Сгенерирована ссылка ${link}`)

			fileInstance.diadoc_id = diadocId
			fileInstance.link_diadoc = link

			return this.filesRepository.save(fileInstance)
		} catch (error) {
			this.setError(
				`Ошибка при установке diadocId по ID:
      id: ${id}
      diadocId: ${diadocId}
      error: ${error.message}`,
				error
			)
		}
	}

	async getById(id: string): Promise<Files> {
		this.logger.log(`Ищу запись о файле по id=${id}`)

		let fileInstance: Files

		try {
			fileInstance = await this.filesRepository.findOne({
				where: {
					id,
					deleted_at: IsNull()
				},
				relations: ["status"]
			})
		} catch (e) {
			this.logger.log(`Ошибка поиска файла id=${id}`)
			throw new InternalServerErrorException("Ошибка поиска файла")
		}

		if (!fileInstance) {
			this.logger.log(`Не найден файл по id=${id}`)
			throw new NotFoundException("Не удалось найти файл")
		}

		return fileInstance
	}
	async getFilesCreatedThen(
		value: number,
		by: ManipulateType,
		is_deleted_from_s3?: boolean
	): Promise<Files[]> {
		const lessThan: string = dayjs()
			.subtract(value, by)
			.format("YYYY-MM-DD HH:mm:ss")

		try {
			const findOptions: FindManyOptions<Files> = {
				where: {
					// @ts-ignore
					created_at: LessThan(lessThan)
				}
			}

			if (is_deleted_from_s3 !== undefined) {
				// @ts-ignore
				findOptions.where.is_deleted_from_s3 = is_deleted_from_s3
			}

			return await this.filesRepository.find(findOptions)
		} catch (e) {
			const message: string = `Ошибка поиска файлов, созданных до ${lessThan}`

			this.logger.log(message)
			throw new InternalServerErrorException(message)
		}
	}

	async countFilesByDocsId(docsId: string): Promise<number> {
		try {
			return await this.filesRepository.countBy({ docs_id: docsId })
		} catch (error) {
			const message: string = `Ошибка поиска файлов по docs_id ${docsId}`

			this.logger.error(message)
			throw new InternalServerErrorException(message)
		}
	}

	async getByDiadocId(diadocId: string): Promise<Files> {
		try {
			this.logger.log(`Ищу запись о файле по diadocId: ${diadocId}`)
			const fileInstance: Files = await this.filesRepository.findOne({
				where: {
					diadoc_id: diadocId,
					is_archive: false,
					is_print_form: false,
					deleted_at: IsNull()
				},
				relations: ["status", "docs", "docs.status", "docs.organization"]
			})

			if (!fileInstance) {
				this.logger.log(`Не найден файл по diadocId: ${diadocId}`)
				/** Пропускаем обработку файлов, если они не были найдены в БД
				 *    это необходимо, чтобы исключить ошибки обработки "чужих" обновлений,
				 *    которые могут возникать при одновременной работе нескольких инстансов сервиса
				 *    с одними и теми же организациями
				 */
				return undefined
			}
			return fileInstance
		} catch (e) {
			const errorMessage: string = `Ошибка считывания файла по diadocId=${diadocId}: ${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	/**
	 * Получение печатной формы по diadoc_id исходного файла-документа
	 * @param diadocId diadoc_id
	 * @returns Promise<Files>
	 */
	async getPrintFormByDiadocId(diadocId: string): Promise<Files> {
		this.logger.log(`Ищу запись о файле по diadocId: ${diadocId}`)
		const fileInstance: Files = await this.filesRepository.findOne({
			where: {
				diadoc_id: diadocId,
				is_archive: false,
				is_print_form: true,
				deleted_at: IsNull()
			},
			relations: ["status", "docs", "docs.status"]
		})

		if (!fileInstance) {
			this.logger.log(`Не найдена печатная форма по diadocId: ${diadocId}`)
			/** Пропускаем обработку файлов, если они не были найдены в БД
			 *    это необходимо, чтобы исключить ошибки обработки "чужих" обновлений,
			 *    которые могут возникать при одновременной работе нескольких инстансов сервиса
			 *    с одними и теми же организациями
			 */
			return undefined
		}

		return fileInstance
	}

	async getArchiveByDiadocId(diadocId: string): Promise<Files> {
		this.logger.log(`Ищу запись о файле по diadocId: ${diadocId}`)
		const fileInstance: Files = await this.filesRepository.findOne({
			where: {
				diadoc_id: diadocId,
				is_archive: true,
				is_print_form: false,
				deleted_at: IsNull()
			},
			relations: ["status", "docs", "docs.status"]
		})

		if (!fileInstance) {
			this.logger.log(`Не найден архив по diadocId: ${diadocId}`)
			/** Пропускаем обработку файлов, если они не были найдены в БД
			 *    это необходимо, чтобы исключить ошибки обработки "чужих" обновлений,
			 *    которые могут возникать при одновременной работе нескольких инстансов сервиса
			 *    с одними и теми же организациями
			 */
			return undefined
		}

		return fileInstance
	}

	async update(id: string, dto: any): Promise<Files> {
		const fileInstance = await this.getById(id)

		fileInstance.updated_by = fileInstance.created_by

		this.logger.log(`Обновляю запись о файле по ID: ${id}`)
		return this.filesRepository.save({
			...fileInstance,
			...dto
		})
	}

	async delete(id: string, initiator: string = "system"): Promise<Files> {
		const fileInstance: Files = await this.getById(id)

		this.logger.log(`Удаляю запись о файле по ID: ${id}`)

		if (initiator) {
			fileInstance.deleted_by = initiator
		} else {
			fileInstance.deleted_by = fileInstance.created_by
		}

		try {
			const deletedFile: Files = await this.filesRepository.manager.transaction(
				async (entityManager: EntityManager): Promise<Files> => {
					await entityManager.save(fileInstance)
					return entityManager.softRemove(fileInstance)
				}
			)

			this.logger.log(`Успешно удалил файл с id=${id}`)

			return deletedFile
		} catch (error) {
			const message: string = `Не получилось удалить файл с id=${id}`

			this.logger.error(message)
			throw new InternalServerErrorException(message)
		}
	}

	async setDeleteFromS3(id: string, value: boolean = true): Promise<void> {
		try {
			await this.filesRepository.update(
				{ id },
				{
					is_deleted_from_s3: value
				}
			)
		} catch (error) {
			const message: string = `Не получилось привести флаг is_deleted_from_s3 в значение ${value}`

			this.logger.error(message)
			throw new InternalServerErrorException(message)
		}
	}

	async findBySourceId(
		sourceId: string,
		filetype?: FileTypeForDownloadPath,
		relations: string[] = []
	): Promise<Files> {
		try {
			const where: FindOptionsWhere<Files> = {
				source_id: sourceId
			}

			if (filetype) {
				where.is_archive = filetype === FileTypeForDownloadPath.ARCHIVE
				where.is_print_form = filetype === FileTypeForDownloadPath.PRINT_FORM
			}

			return await this.filesRepository.findOne({
				where,
				order: {
					created_at: "DESC"
				},
				relations
			})
		} catch (error) {
			this.setError(
				`Ошибка поиска файла по sourceId=${sourceId}, filetype=${filetype}`,
				error
			)
		}
	}

	/**
	 * Массовое удаление (мягкое)
	 * @param fileInstances инстансы файлов
	 * @param systemId ID системы
	 * @returns Promise<Files[]>
	 */
	async bullSoftDeleteByInstances(
		fileInstances: Files[],
		systemId: string
	): Promise<Files[]> {
		this.logger.log(`Удаляю ${fileInstances.length} файлов`)

		const instances = await this.filesRepository.find({
			where: {
				id: In(fileInstances.map((fileInstance) => fileInstance.id))
			}
		})

		for (const instance of instances) {
			instance.deleted_by = systemId
		}

		await this.filesRepository.save(instances)

		return this.filesRepository.softRemove(fileInstances)
	}

	/**
	 * Валидация дубликатов файлов
	 * @param fileDto DTO
	 * @returns  Promise<boolean>
	 */
	async checkDuplicate(fileDto: FileDto): Promise<boolean> {
		this.logger.log(`Проверяю дубликаты по source_id ${fileDto.file_id}`)
		const existFiles = await this.filesRepository.find({
			where: {
				source_id: fileDto.file_id,
				is_archive: false,
				is_print_form: false,
				deleted_at: IsNull()
			},
			relations: ["status"]
		})

		if (existFiles.length) {
			this.logger.log(
				`Найдено ${existFiles.length} файлов с source_id=${fileDto.file_id}`
			)

			// Ищем хотя бы один файл, удовлетворяющий условиям дублирвания
			const hasDuplicate = existFiles.some((currFile) => {
				this.logger.log(`Проверяю файл ${currFile.id}`)

				// Проверяю статусы
				const activeStatus = currFile.status.find(
					(currStatus) => currStatus.is_active
				)

				// Проверяю наличие статуса
				if (activeStatus) {
					this.logger.log(
						`У файла есть активный статус: ${activeStatus.severity} ${activeStatus.name}`
					)

					// Проверяю на Аннулированный статус
					if (activeStatus.severity === StatusSeverity.ERROR) {
						this.logger.log(`У файла ${currFile.id} аннулированный статус`)
						return false
					} else {
						this.logger.error(
							`У файла ${currFile.id} действующий статус, создание нового файла запрещено`
						)
						return true
					}
				} else {
					this.logger
						.error(`Файл с source_id=${currFile.source_id} уже создан (${currFile.id})
              У него нет активного статуса, создание файла с таким же source_id запрещено`)
					return true
				}
			})

			return hasDuplicate
		}

		this.logger.log("Файлы с таким же ID не найдены")
		return false
	}

	async getDiadocIdsByFileIds(fileIds: string[]): Promise<string[]> {
		this.logger.log(
			`Запрашиваю список diadoc_id по fileIds=${JSON.stringify(fileIds)}`
		)

		let diadocIds: string[]

		try {
			diadocIds = (
				await this.filesRepository.find({
					where: {
						id: In(fileIds)
					},
					select: ["diadoc_id"]
				})
			).map((file: Files) => file.diadoc_id)

			this.logger.log(
				`Cписок diadoc_id по fileIds=${JSON.stringify(fileIds)} успешно получен`
			)
		} catch (error) {
			this.logger.log(
				`Ошибка запроса списка diadoc_id по fileIds=${JSON.stringify(fileIds)}`
			)
		}

		if (!diadocIds.length) {
			const message: string = `Нет ни одного diadoc_id по fileIds=${JSON.stringify(fileIds)}`

			this.logger.log(message)
			throw new NotFoundException(message)
		}

		return diadocIds
	}

	async setTemplateLink(
		id: string,
		link_diadoc_template: string
	): Promise<void> {
		try {
			this.logger.log(
				`Добавляю ссылку на шаблон документа в файл source_id=${id} link_diadoc_template=${link_diadoc_template}`
			)

			await this.filesRepository.update(
				{
					id
				},
				{
					link_diadoc_template
				}
			)
			this.logger.log(
				`Ссылка на шаблон документа успешно добавлена в файл source_id=${id} link_diadoc_template=${link_diadoc_template}`
			)
		} catch (error) {
			this.setError(
				`Ошибка добавления ссылки на шаблон документа в файл source_id=${id} link_diadoc_template=${link_diadoc_template}`,
				error
			)
		}
	}
}
