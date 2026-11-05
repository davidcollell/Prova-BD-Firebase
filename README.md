# Firestore Lab — PWA de proves

Aplicació React + Vite per provar Firebase Firestore des d'una PWA publicada a Vercel.

## 1. Crear el projecte Firebase
1. Entra a https://console.firebase.google.com/ i crea un projecte.
2. Afegeix una aplicació web (icona `</>`).
3. Copia els valors de configuració de Firebase.
4. A Firebase Console, ves a **Firestore Database** i crea una base de dades.

## 2. Configurar el projecte en local
1. Descomprimeix el projecte.
2. Instal·la Node.js (versió LTS) si encara no el tens: https://nodejs.org/
3. Obre una terminal dins la carpeta del projecte.
4. Executa `npm install`.
5. Copia `.env.example` i posa-li el nom `.env.local`.
6. Omple les variables `VITE_FIREBASE_...` amb els valors de la configuració de l'aplicació web de Firebase.
7. Executa `npm run dev` i obre l'adreça local que aparegui a la terminal.

## 3. Regles de Firestore (ATENCIÓ: només proves)
1. A Firebase Console, obre **Firestore Database > Rules**.
2. Copia el contingut de `firestore.rules` i publica les regles.
3. Aquestes regles permeten a qualsevol persona d'internet llegir, crear, modificar i eliminar documents de la col·lecció `proves` fins a l'1 de gener de 2027.
4. La resta de col·leccions queden bloquejades.

**Important:** no utilitzis aquestes regles amb dades personals, privades o de producció. Qualsevol persona que conegui l'adreça de l'app pot modificar o esborrar les dades de prova. Abans de fer una app real caldrà implementar autenticació i regles per usuari/rol. Les claus de configuració web de Firebase no són contrasenyes; la protecció real són les regles de Firestore.

## 4. Pujar a GitHub
1. Crea un repositori nou a GitHub.
2. Puja-hi tots els fitxers del projecte.
3. **No pugis mai `.env.local`**. Aquest fitxer ja queda exclòs si més endavant afegeixes un `.gitignore`; crea'l amb el contingut següent si no existeix:

```gitignore
node_modules
dist
.env
.env.local
.env.*.local
```

## 5. Publicar a Vercel
1. Entra a https://vercel.com/ i importa el repositori de GitHub.
2. Framework Preset: Vite (normalment el detecta automàticament).
3. A **Project Settings > Environment Variables**, afegeix totes les variables de `.env.local` (una per una), amb el mateix nom i valor.
4. Fes el desplegament. Si ja estava desplegat, torna a fer **Redeploy** després d'afegir les variables.

## 6. Provar la sincronització
1. Obre l'enllaç de Vercel.
2. Crea un registre.
3. Obre l'app en una altra pestanya o dispositiu.
4. Comprova que el registre apareix sense refrescar.
5. Edita o elimina el registre i comprova que el canvi es replica.

## 7. Instal·lar com a PWA
Obre l'enllaç de Vercel des del navegador del mòbil i utilitza **Instal·la l'aplicació** o **Afegeix a la pantalla d'inici**. La PWA necessita HTTPS, que Vercel proporciona.

## Estructura de dades
Col·lecció: `proves`

Cada document inclou:
- `nom` (string)
- `descripcio` (string)
- `categoria` (string)
- `data` (string, format YYYY-MM-DD)
- `actiu` (boolean)
- `creatEl` (timestamp)
- `actualitzatEl` (timestamp)

## Nota tècnica
La lectura en temps real es fa amb `onSnapshot()`. El projecte utilitza variables d'entorn `VITE_` perquè Vite les pugui incorporar al client. Aquestes variables són visibles al navegador: no hi posis secrets de servidor.
