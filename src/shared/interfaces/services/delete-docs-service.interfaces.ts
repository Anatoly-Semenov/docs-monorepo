import { IJwtPayloadSystem } from "../jwt-payload.interface"

export interface IDeleteDocsService {
	deleteFromSystem(
		docId: string,
		systemPayload: IJwtPayloadSystem
	): Promise<string>
}
