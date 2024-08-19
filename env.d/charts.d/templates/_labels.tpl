#{{- define "kafka-consumer.labels" }}
#{{- include "common.labels" . }}
#app.kubernetes.io/component: kafka-consumer
#{{- end }}#

#{{- define "kafka-consumer.selectorLabels" }}
#{{- include "common.selectorLabels" . }}
#app.kubernetes.io/component: kafka-consumer
#{{- end }}


#{{- define "kafka-consumer.fullname" -}}
#{{ include "app.fullname" . }}-kafka-consumer
#{{- end -}}
