import { DocsRecipient } from "@docs/common/db/entities/docs-recipient.entity"

export interface IDocsRecipientServiceDb {
	create(dto: any): Promise<DocsRecipient>

	getByRecipientId(id: string): Promise<DocsRecipient>

	getByDocumentId(documentId: string): Promise<DocsRecipient[]>

	update(docsId: string, dto: any): Promise<DocsRecipient>

	delete(docsId: string): Promise<DocsRecipient>
}
