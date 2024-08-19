import lodash from "lodash"

import { IDiadocStatusExtended } from "../interfaces/services/docs-service.interfaces"

export function removeDiadocEventsDuplicates(
	updateStatusData: IDiadocStatusExtended[]
) {
	return lodash.uniqBy(updateStatusData, (item) => {
		return `${item.entityId}${item.messageId}${item.primaryStatus.Severity}${item.primaryStatus.StatusText}${item.primaryStatus.StatusHint}${item.isDeleted}`
	})
}
