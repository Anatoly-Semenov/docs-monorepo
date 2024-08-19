import { Client, UploadedObjectInfo } from "minio"

import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { Sentry } from "@docs/shared/decorators/sentry.decorator"

import { NodeEnv } from "@docs/shared/types/config.types"

@Injectable()
@Sentry
export class S3ClientService {
	constructor(private readonly configService: ConfigService) {}

	minioClient = new Client({
		pathStyle:
			this.configService.getOrThrow<NodeEnv>("APP_ENV") === NodeEnv.LOCAL,
		endPoint: this.configService.getOrThrow("S3_ENDPOINT"),
		accessKey: this.configService.getOrThrow("S3_AKEY"),
		secretKey: this.configService.getOrThrow("S3_PKEY"),
		useSSL: this.configService.get("S3_USE_SSL") === "true",
		port: +this.configService.get("S3_PORT") ?? 9000
	})

	private readonly logger = new Logger(S3ClientService.name)
	private readonly bucketName = this.configService.getOrThrow("S3_BUCKET")

	private setError(message: string, error: any): void {
		this.logger.error(message)
		throw new Error(`${message} | ${JSON.stringify(error)}`)
	}

	private convertArrayBufferToBuffer(arrayBuffer: ArrayBuffer): Buffer {
		const buffer = Buffer.alloc(arrayBuffer.byteLength)
		const view = new Uint8Array(arrayBuffer)

		for (let i = 0; i < buffer.length; ++i) {
			buffer[i] = view[i]
		}

		return buffer
	}

	async writeFile(
		file: Buffer,
		fileId: string,
		bucketName: string = this.bucketName
	): Promise<UploadedObjectInfo> {
		try {
			this.logger.log(`Записываю файл в s3 (fileId=${fileId})`)

			if (file instanceof ArrayBuffer) {
				file = this.convertArrayBufferToBuffer(file)
			}

			return await this.minioClient.putObject(bucketName, fileId, file)
		} catch (error) {
			this.setError(
				`Возникла ошибка при записи файла в s3:\nfileId: ${fileId}\nerror: ${error.message}`,
				error
			)
		}
	}

	async readFile(
		fileId: string,
		bucketName: string = this.bucketName
	): Promise<Buffer> {
		try {
			const file = await this.minioClient.getObject(bucketName, fileId)

			const fileBufferArray = []

			return new Promise<Buffer>((res, rej) => {
				file.on("data", function (chunk) {
					fileBufferArray.push(chunk)
				})
				file.on("end", function () {
					const fileBuffer = Buffer.concat(fileBufferArray)
					res(fileBuffer)
				})
			})
		} catch (error) {
			this.setError(
				`Возникла ошибка при чтении файла из s3:\nfileId: ${fileId}\nerror: ${error.message}`,
				error
			)
		}
	}

	async readFileStream(fileId: string, bucketName: string = this.bucketName) {
		try {
			return await this.minioClient.getObject(bucketName, fileId)
		} catch (error) {
			this.setError(
				`Возникла ошибка при чтении файла из s3:\nfileId: ${fileId}\nerror: ${error.message}`,
				error
			)
		}
	}

	async deleteFile(
		fileId: string,
		bucketName: string = this.bucketName
	): Promise<void> {
		try {
			this.logger.log(`Удаляю файл из s3 (fileId=${fileId})`)

			// @ts-ignore
			return await this.minioClient.removeObject(bucketName, fileId)
		} catch (error) {
			this.setError(
				`Возникла ошибка при удалении файла из s3:\nfileId: ${fileId}\nerror: ${error.message}`,
				error
			)
		}
	}
}
