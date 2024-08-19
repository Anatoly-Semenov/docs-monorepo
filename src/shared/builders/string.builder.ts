import safeStringify from "fast-safe-stringify"

type Options = {
	depthLimit: number | undefined
	edgesLimit: number | undefined
}

export class StringBuilder {
	private options: Options = {
		depthLimit: Number.MAX_SAFE_INTEGER,
		edgesLimit: Number.MAX_SAFE_INTEGER
	}

	private replacer(key: string, value: any) {
		console.log("Key:", JSON.stringify(key), "Value:", JSON.stringify(value))

		// Remove the circular structure
		if (value === "[Circular]") {
			return
		}

		return value
	}

	private tryJSONStringify(obj: object): string {
		try {
			return JSON.stringify(obj)
		} catch (_) {}
	}

	private deepStringify(value: any): string {
		return safeStringify(value, this.replacer, 2, this.options)
	}

	public stringify(value: any): string {
		return this.tryJSONStringify(value) || this.deepStringify(value)
	}
}
