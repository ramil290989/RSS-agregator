install:
	npm ci
	
lint:
	npx eslint .
	
develop:
	npx webpack serve
	
rebuild:
	rm -rf dist
	
build:
	NODE_ENV=production npx webpack
