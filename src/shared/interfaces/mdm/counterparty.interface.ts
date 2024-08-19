import { OrganizationType } from "@docs/shared/enums/organization.enum"

export interface ICounterparty {
	type: OrganizationType
	is_cancel: boolean
	full_name: string
	name: string
	inn: string
	kpp: string
	id: string
}
