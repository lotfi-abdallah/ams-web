.PHONY: backend frontend dev clean install

install:
	cd backend && npm install
	cd frontend && npm install

backend:
	cd backend && npm run dev

frontend:
	cd frontend && npm start

dev:
	make -j2 backend frontend

clean:
	cd backend && rm -rf node_modules dist
	cd frontend && rm -rf node_modules build