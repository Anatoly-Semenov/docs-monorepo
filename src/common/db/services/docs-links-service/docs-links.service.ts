import {
	Injectable,
	InternalServerErrorException,
	Logger
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { Repository } from "typeorm"

import { DocsLinks } from "@docs/common/db/entities/docs_links.entity"

@Injectable()
export class DocsLinksServiceDb {
	private readonly logger = new Logger(DocsLinksServiceDb.name)

	constructor(
		@InjectRepository(DocsLinks)
		private readonly docsLinksRepository: Repository<DocsLinks>
	) {}

	public async createEmpty(): Promise<DocsLinks> {
		try {
			return await this.docsLinksRepository.create()
		} catch (error) {
			const message: string = `Не получилось создать пустой связанный документ`

			this.logger.log(message)
			throw new InternalServerErrorException(message)
		}
	}

	public async saveEntity(entity: DocsLinks): Promise<DocsLinks> {
		try {
			this.logger.log(`Создаю связный документ с id=${entity.id}`)

			return await this.docsLinksRepository.save(entity)
		} catch (error) {
			const message: string = `Не получилось создать связанный документ с id=${entity.id}`

			this.logger.log(message)
			throw new InternalServerErrorException(message)
		}
	}

	public async getListByParam({
		remoteLinkedDocId,
		linkedDocId,
		parentDocId
	}: {
		remoteLinkedDocId?: string
		linkedDocId?: string
		parentDocId?: string
	}): Promise<DocsLinks[]> {
		const where: any = {}

		try {
			if (remoteLinkedDocId) {
				where.remote_linked_doc_id = remoteLinkedDocId
			}

			if (parentDocId) {
				where.parent_doc_id = parentDocId
			}

			if (linkedDocId) {
				where.linked_doc_id = linkedDocId
			}

			this.logger.log(`Ищу связные документы по параметру ${where}`)

			return await this.docsLinksRepository.find({ where })
		} catch (error) {
			const message: string = `Ошибка поиска списка связанных документов по параметру ${JSON.stringify(where)}`

			this.logger.log(message)
			throw new InternalServerErrorException(message)
		}
	}
}
