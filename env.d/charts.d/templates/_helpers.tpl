{{- define "project.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "project.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "parts" -}}
{{- if .Values.parts }}
{{- .Values.parts | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "testing" }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "project.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "project.labels" -}}
helm.sh/chart: {{ include "project.chart" . }}
{{ include "project.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "migrations.labels" -}}
helm.sh/chart: {{ include "project.chart" . }}
{{ include "migrations.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "kafka.labels" -}}
helm.sh/chart: {{ include "project.chart" . }}
{{ include "kafka.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "worker.labels" -}}
helm.sh/chart: {{ include "project.chart" . }}
{{ include "worker.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "grpc.labels" -}}
helm.sh/chart: {{ include "project.chart" . }}
{{ include "grpc.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}


{{/*
Selector labels
*/}}
{{- define "project.selectorLabels" -}}
app.kubernetes.io/name: {{ include "project.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/parts: {{ include "parts" . }}
{{- end }}

{{- define "migrations.selectorLabels" -}}
app.kubernetes.io/name: {{ include "project.name" . }}-grpc
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/parts: {{ include "parts" . }}
{{- end }}

{{- define "kafka.selectorLabels" -}}
app.kubernetes.io/name: {{ include "project.name" . }}-kafka
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/parts: {{ include "parts" . }}
{{- end }}

{{- define "worker.selectorLabels" -}}
app.kubernetes.io/name: {{ include "project.name" . }}-kafka
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/parts: {{ include "parts" . }}
{{- end }}

{{- define "grpc.selectorLabels" -}}
app.kubernetes.io/name: {{ include "project.name" . }}-grpc
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/parts: {{ include "parts" . }}
{{- end }}


{{/*
Create the name of the service account to use
*/}}
{{- define "project.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "project.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
