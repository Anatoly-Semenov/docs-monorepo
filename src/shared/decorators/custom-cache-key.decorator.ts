import { Reflector } from "@nestjs/core"

interface CustomCacheKeyInterface {
	argumentIndex: number
	fieldName: string
	uniquePrefix: string
}

export const CustomCacheKey =
	Reflector.createDecorator<CustomCacheKeyInterface>()
