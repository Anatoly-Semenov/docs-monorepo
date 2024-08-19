import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb"

export class GoogleTimestampBuilder {
	public formatTimestampToISOString(timestampObj: Timestamp.AsObject) {
		const timestamp = new Timestamp()

		timestamp.setSeconds(timestampObj.seconds)
		timestamp.setNanos(timestampObj.nanos)

		return timestamp.toDate().toISOString()
	}

	public formatISOStringToTimestamp(dateString: string): Timestamp.AsObject {
		return Timestamp.fromDate(new Date(dateString)).toObject()
	}

	public createTimestamp(date?: string): Timestamp.AsObject {
		return Timestamp.fromDate(date ? new Date(date) : new Date()).toObject()
	}
}
