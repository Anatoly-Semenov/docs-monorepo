export interface IOperatorService {
	getActiveOperators(
		organizationId: string,
		counterpartyIds: string[]
	): Promise<IOperatorForConnectWrapper>
}

export interface IOperatorForConnect {
	counterparty_id: string
	box_id: string
	operator: string
	counterparty: string
}

export interface IOperatorForConnectWrapper {
	counterparties: IOperatorForConnect[]
}
