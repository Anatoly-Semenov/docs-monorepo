import { IDiadocStatusExtended } from "../interfaces/services/docs-service.interfaces"

import { IStructuredEventsDocument } from "../interfaces/client/diadoc.interfaces"

export function structuringEventsHelper(events: IDiadocStatusExtended[]) {
	const structuredEvents: IStructuredEventsDocument[] = []

	for (const event of events) {
		const messageId = event.messageId

		let currentDoc = structuredEvents.find(
			(curr) => curr.messageId === messageId
		)

		if (!currentDoc) {
			structuredEvents.push({
				messageId,
				files: []
			})

			currentDoc = structuredEvents[structuredEvents.length - 1]
		}

		const entityId = event.entityId
		let currentFile = currentDoc.files.find(
			(curr) => curr.entityId === entityId
		)

		if (!currentFile) {
			currentDoc.files.push({
				entityId,
				statuses: []
			})

			currentFile = currentDoc.files[currentDoc.files.length - 1]
		}

		const status = event.primaryStatus

		currentFile?.statuses.push(status)
	}

	return structuredEvents
}

export function dateToEpochFormat(date: Date) {
	return date.getTime() * 10000 + 621355968000000000
}
