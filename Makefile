build:
	docker build -t tg-bot .

run:
	docker run --name tg-bot --rm tg-bot