export function formatObjectToCamelCaseHelper<T = object>(object: T): T {
	let key: string,
		keys: string[] = Object.keys(object)

	let index = keys.length

	const newObject: T = {} as T

	while (index--) {
		key = keys[index]

		const firstWord = key[0].toLowerCase()

		newObject[`${firstWord}${key.slice(1)}`] = object[key]
	}

	return newObject
}

export function formatObjectListToCamelCaseHelper<T = object>(list: T[]): T[] {
	const newList: T[] = []

	for (const object of list) {
		newList.push(formatObjectToCamelCaseHelper(object))
	}

	return newList
}
