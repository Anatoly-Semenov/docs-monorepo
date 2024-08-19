import { BadRequestException } from "@nestjs/common"

export const UrlDomainResolverHelper = (url: string) => {
	try {
		return new URL(url).hostname.split(".")[0]
	} catch (e) {
		throw new BadRequestException("Ошибка валидации URL системы")
	}
}
