# 1cel

1cel to prosta aplikacja do planowania jednego dziennego celu. Pozwala rozpisać
cel na kroki, śledzić postęp, oznaczyć dzień jako zakończony i wrócić do historii
wcześniejszych celów.

Aktualny cel i historia są zapisywane lokalnie w przeglądarce (`localStorage`).
Aplikacja nie wymaga konta ani klucza API.

## Uruchomienie lokalne

Wymagany jest Node.js oraz pnpm.

```bash
pnpm install
pnpm dev
```

## Kontrola projektu

```bash
pnpm lint
pnpm test
pnpm build
```

## Instalacja na telefonie (PWA)

Aplikacja działa jako PWA: można ją zainstalować i używać bez internetu
(po pierwszym wejściu na stronę).

- **Android (Chrome):** menu ⋮ → „Zainstaluj aplikację” (lub „Dodaj do ekranu głównego”).
- **iPhone (Safari):** przycisk Udostępnij → „Do ekranu początkowego”.

### Gdzie są dane

Cele i historia są tylko na tym urządzeniu, w tej przeglądarce. Nie ma konta
ani synchronizacji między urządzeniami.

- Wersja lokalna (`localhost`) i wersja online mają osobne dane.
- Na iPhonie aplikacja z ekranu początkowego ma inne dane niż karta w Safari.
- Usunięcie aplikacji lub danych przeglądarki usuwa zapisane cele.

## Publikacja na GitHub Pages

Push na gałąź `master` uruchamia workflow `.github/workflows/deploy.yml`
(lint, testy, build, deploy). Jednorazowo w repozytorium trzeba ustawić:
Settings → Pages → Source: **GitHub Actions**. Ścieżka bazowa (`/<nazwa-repo>/`)
jest ustawiana automatycznie przez zmienną `BASE_PATH`.

Adres wersji online: `https://<użytkownik>.github.io/<nazwa-repo>/`.

Ikony PWA powstają z `public/icon.svg`; po zmianie ikony uruchom
`pnpm generate-pwa-assets`.
