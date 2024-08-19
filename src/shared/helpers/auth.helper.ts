import { ForbiddenException, NotFoundException } from "@nestjs/common"

import { Docs } from "@docs/common/db/entities/docs.entity"

export function checkAccessToDoc(docInstance: Docs, systemId: string) {
	if (!docInstance) {
		throw new NotFoundException("Документ не найден")
	}

	if (docInstance.system.id !== systemId) {
		throw new ForbiddenException("Доступ к документу этой системы запрещён")
	}
}
