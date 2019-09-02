# RabbitMQ Messaging with CNB and Helm

This is a sample repository showing off Cloud Native Buildpacks for two TypeScript applications that send and receive messages to RabbitMQ.

## Building

You need to have `npm`, `node`, and `pack` installed.

```
make
```

## Installing

To push this to Kubernetes you will need `helm` and a tiller (either running in another terminal or in-cluster). For convenience, the images are provided on Docker Hub at https://hub.docker.com/u/voor/ but it is recommended you relocate the images to your own registry. For convenience, a `helmfile` is provided in the root of this repository.

```
helmfile sync
```

Or alternatively:

```
helm install --name amqp-sender --namespace app ./deployment/helm/amqp-sender
helm install --name amqp-receiver --namespace app ./deployment/helm/amqp-receiver
```
