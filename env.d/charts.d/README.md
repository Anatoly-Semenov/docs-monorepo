# Helm chart

This chart deploys project as a Deployments. It creates a ClusterIP
Service in front of the Deployment for load balancing by default, but can also
be configured to deploy other Service types or an Ingress Controller. The
default persistence mechanism is simply the ephemeral local filesystem.

## TL;DR

```bash
$ helm install <release-name> ./<chartname> -f ./<chartname>/custom-values.yaml
```

## Prerequisites

- Kubernetes 1.9+ with Beta APIs enabled
- Ingress requires Kubernetes 1.19+

## Installing the Chart

To install the chart with the release name `my-release`:

Add the Helm repository:

```bash
$ helm repo add <repo-name> https://<fqdn>/helm
```

This Helm chart deploys project on the Kubernetes cluster in a default
configuration. The [configuration](#configuration) section lists
the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `my-release` Deployment:

```bash
$ helm delete my-release
```

The command removes all the Kubernetes components associated with the chart and
deletes the release.


### Upgrade

```bash
$ helm upgrade <release-name> \
  --version=3.6.4 \
  --reuse-values \
  ./charts
```
## Feedback, Issues, Contributing