export interface IKafkaWrapper {
	emit(topicName: string, data: IKafkaKeyValue): Promise<unknown | void>
}

export interface IKafkaFactLayerData {
	id: string
	data: IKafkaData
	trace_data: IKafkaTraceData
}

export interface IKafkaTraceData {
	timestamp: string
	trace_id: string
	service_name: "signing"
}

export interface IKafkaData {
	links: string // TODO: Deprecated
	doc_link_one_side: string
	doc_link_two_side?: string // vgo2
	doc_link_third_side?: string // vgo3
	state_doc: string
	state_doc_service: string
	state_doc_diadoc: string
	files_doc: IKafkaFilesDoc[]
}

export interface IKafkaFilesDoc {
	files_id: string
	files_links: string // TODO: Deprecated
	files_link_one_side: string
	files_link_two_side?: string //vgo2
	file_link_third_side?: string //vgo3
	files_comment: string
	files_state: string
	files_state_service: string
	files_print_form: boolean
	files_archive: boolean
	files_deleted: boolean
}

interface IKafkaKeyValue {
	key: string
	value: string
}
