import { HealthIndicatorResult } from "@nestjs/terminus"
import { HealthIndicatorFunction } from "@nestjs/terminus/dist/health-indicator"

export namespace Health {
	export interface Indicator {
		check?: (key: string) => Promise<HealthIndicatorResult>
		isHealthy?: () => HealthIndicatorFunction[]
	}

	export type Performance = {
		status: number
		timing: number
	}

	export type RestHealthyIndicator<T> = {
		healthKey: string
		url: string
		options: T
	}
}
