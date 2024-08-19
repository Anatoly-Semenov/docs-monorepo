import { RedisVariables } from "@docs/shared/enums/redis.enum"

export interface IRefreshingLists {
	refreshLists(): Promise<void>
}

export interface IBaseRefreshingList {
	refreshLists(
		refreshFunction: () => Promise<void>,
		redisFlag: RedisVariables,
		listName: string
	): Promise<void>
}
