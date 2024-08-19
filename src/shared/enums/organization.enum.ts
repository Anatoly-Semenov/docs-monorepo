export enum OrganizationType {
	UL = "ЮЛ",
	IP = "ИП",
	FL = "ФЛ"
}

export enum LoadMode {
	ALL = "ALL", // обновление данных по всем организациям
	DOCFLOW = "DOCFLOW" // обновление данных по организациям, ведущим ДО
}

export enum OrganizationFeature {
	ALLOW_PROXIFIED_DOCUMENTS = "AllowProxifiedDocuments",
	ALLOW_SEND_LOCKED_PACKETS = "AllowSendLockedPackets",
	ALLOW_APPROVEMENT_SIGNATURES = "AllowApprovementSignatures"
}
