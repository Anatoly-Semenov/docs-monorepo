import { Controller, Get } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"

// @ts-ignore
import packageJson from "../package.json"

@Controller()
@ApiTags("App")
export class AppController {
	@Get()
	healthCheck() {
		return {
			name: packageJson?.name || "unknown",
			version: `Version app: ${packageJson?.version || "unknown"}`
		}
	}
}
