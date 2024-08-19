import { Counterparty } from "@docs/common/db/entities/counterparty.entity"

import { ICounterparty } from "../../mdm/counterparty.interface"

export interface ICounterpartyServiceDb {
	getAll(): Promise<Counterparty[]>
	saveList(counterparties: ICounterparty[]): Promise<Counterparty[]>
	getByInn(inn: string[]): Promise<Counterparty[]>
	getById(id: string[]): Promise<Counterparty[]>
}
