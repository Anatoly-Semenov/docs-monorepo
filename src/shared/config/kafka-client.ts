import { ConnectionOptions } from "tls"

import { ClientOptions, Transport } from "@nestjs/microservices"
import { SASLOptions } from "@nestjs/microservices/external/kafka.interface"

export const createKafkaClient = (
	brokers: string,
	clientId: string,
	groupId: string,
	logLevel: number,
	certificate?: string,
	username?: string,
	password?: string
): ClientOptions => ({
	transport: Transport.KAFKA,
	options: {
		client: {
			clientId,
			brokers: brokers.split(",") || undefined,
			logLevel,
			ssl: certificate ? setupKafkaCredentials(certificate) : undefined,
			sasl:
				username && password
					? setupKafkaAuthParams(username, password)
					: undefined
		},
		consumer: {
			groupId
		}
	}
})

export const setupKafkaCredentials = (
	certificate: string
): ConnectionOptions => {
	return {
		rejectUnauthorized: false,
		ca: certificate
	}
}

export const setupKafkaAuthParams = (
	username: string,
	password: string
): SASLOptions => {
	return {
		mechanism: "plain",
		username: username,
		password: password
	}
}
