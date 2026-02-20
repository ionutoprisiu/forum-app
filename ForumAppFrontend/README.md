# Forum App – Frontend

Frontend React pentru aplicația Forum (întrebări, răspunsuri, autentificare, moderare).

## Comenzi

- `npm start` – rulează aplicația în development (port 3000)
- `npm test` – rulează testele Jest (watch mode)
- `npm run build` – build pentru producție

## Teste E2E (Cypress)

Backend-ul trebuie să ruleze pe `http://localhost:8080` și frontend-ul pe `http://localhost:3000`.

- `npx cypress run` – rulează testele E2E în headless
- `npx cypress open` – deschide interfața Cypress
