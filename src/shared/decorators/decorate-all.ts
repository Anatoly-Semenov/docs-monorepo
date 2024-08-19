import "reflect-metadata"

export interface DecorateAllOptions {
	excludePrefix?: string
	exclude?: string[]
	deep?: boolean
}

function copyMetadata(from: any, to: any) {
	const metadataKeys: any[] = Reflect.getMetadataKeys(from)

	metadataKeys.map((key) => {
		const value: any = Reflect.getMetadata(key, from)
		Reflect.defineMetadata(key, value, to)
	})
}

/**
 * Примение декоратора ко всем методам класса.
 *
 * @param decorator Декоратор метода, применяемый ко всем методам класса
 * @param {string[]} options.exclude массив имен методов, которые не будут декорированы
 * @param {boolean} options.deep если true, также декорирует методы наследуемых классов (рекурсивно)
 */
export const DecorateAll = (
	decorator: MethodDecorator,
	options: DecorateAllOptions = {}
) => {
	return (target: any) => {
		let descriptors = Object.getOwnPropertyDescriptors(target.prototype)

		if (options.deep) {
			let base = Object.getPrototypeOf(target)

			while (base.prototype) {
				const baseDescriptors = Object.getOwnPropertyDescriptors(base.prototype)
				descriptors = { ...baseDescriptors, ...descriptors }
				base = Object.getPrototypeOf(base)
			}
		}

		for (const [propName, descriptor] of Object.entries(descriptors)) {
			const isMethod =
				typeof descriptor.value == "function" && propName != "constructor"

			if (
				propName.startsWith(options.excludePrefix) ||
				options.exclude?.includes(propName) ||
				!isMethod
			) {
				continue
			}

			const originalMethod = descriptor.value

			decorator(target, propName, descriptor)

			if (originalMethod != descriptor.value) {
				copyMetadata(originalMethod, descriptor.value)
			}

			Object.defineProperty(target.prototype, propName, descriptor)
		}
	}
}
