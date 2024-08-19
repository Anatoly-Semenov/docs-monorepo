import { Operator } from "@docs/common/db/entities/operators.entity"

export interface IOperatorServiceDb {
	saveList(operators: IOperatorDataExpand[]): Promise<Operator[]>
}

export interface IOperatorData {
	RoamingOperators: IOperatorDataExpand[]
}

export interface IOperatorDataExpand {
	FnsId: string
	Name: string
	IsActive: boolean
}

export interface IOperatorDb {
	fns_id: string
	name: string
	is_active: boolean
}
