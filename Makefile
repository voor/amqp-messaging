
REPOSITORY=voor
VERSION=0.0.2

all: build

build: clean tsc pack

tsc:
	npm install --prefix amqp-receiver
	npm install --prefix amqp-sender
	npm run-script build --prefix amqp-receiver
	npm run-script build --prefix amqp-sender

pack:
	rm -rf amqp-receiver/node_modules amqp-sender/node_modules
	pack build -p amqp-receiver ${REPOSITORY}/amqp-receiver:${VERSION}
	pack build -p amqp-sender ${REPOSITORY}/amqp-sender:${VERSION}

clean:
	rm -rf amqp-receiver/dist amqp-sender/dist

deploy:
	docker push ${REPOSITORY}/amqp-receiver:${VERSION}
	docker push ${REPOSITORY}/amqp-sender:${VERSION}