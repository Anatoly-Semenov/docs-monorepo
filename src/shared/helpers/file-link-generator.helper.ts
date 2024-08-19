export const GenerateFileLink = (
	messageId: string,
	diadocId: string,
	fromBoxIdGuid: string
) => {
	return `https://diadoc.kontur.ru/${fromBoxIdGuid}/Document/Show?letterId=${messageId}&documentId=${diadocId}`
}
