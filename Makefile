.PHONY: backend frontend dev clean install

install:
	cd backend && npm install
	cd frontend && npm install

backend:
	cd backend && npm run dev
build-front:
	cd frontend && npm run build
frontend:
	cd frontend && npm start

dev:
	make -j2 backend frontend

clean:
	cd backend && rm -rf node_modules dist cert
	cd frontend && rm -rf node_modules build
certificate:
	openssl req -nodes -new -x509 -keyout backend/cert/private.key -out backend/cert/certificate.crt -days 365