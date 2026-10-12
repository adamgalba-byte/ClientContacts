Spustenie aplikácie

Na spustenie je potrebné mať .NET 9 SDK, Node.js a npm.

Spustenie backendu:

V jednom termináli

cd Backend
dotnet run

Backend je na http://localhost:5106
swagger: http://localhost:5106/swagger

Spustenie frontendu:

V druhom terminali:

cd Frontend
npm install
npm run dev

Aplikáciu potom otvorte na adrese, ktorú vypíše Vite, asi http://localhost:5173.

Počas používania musia byť spustené frontend aj backend..

Databáza

V súbore Backend/contacts.db.

Kontrola projektu
Backend:

cd Backend
dotnet build

Frontend:

cd Frontend
npm run build