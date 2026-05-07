.PHONY: backend frontend dev clean install

install:
	cd backend && npm install
	cd frontend && npm install

backend:
	cd backend && npm run dev
build-front:
	cd frontend && npm run build
build-back:
	cd backend && npm run build
build: build-front build-back
copy:
	cp -r backend/dist/* build/
	cp -r frontend/dist/frontend/browser/* build/
	cp -r backend/cert build/cert
	cp backend/package.json build/
	cp backend/package-lock.json build/
	cp backend/.env build/
install-build:
	cd build && npm install --production
run-build:
	cd build && node server.js
frontend:
	cd frontend && npm start

dev:
	make -j2 backend frontend

clean:
	cd backend && rm -rf node_modules dist cert
	cd frontend && rm -rf node_modules build
certificate:
	openssl req -nodes -new -x509 -keyout backend/cert/private.key -out backend/cert/certificate.crt -days 365