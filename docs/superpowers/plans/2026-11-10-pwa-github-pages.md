# PWA i publikacja na GitHub Pages — plan wdrożenia

> **Dla agentów:** WYMAGANY SUB-SKILL: użyj superpowers:subagent-driven-development (zalecane) albo superpowers:executing-plans, żeby wykonywać plan task po tasku. Kroki mają checkboxy (`- [ ]`) do śledzenia postępu.
> Przed startem przeczytaj `AGENTS.md` — jego zasady obowiązują w każdym tasku.

**Cel:** Aplikację 1C da się zainstalować jako PWA na Androidzie (Chrome) i iPhonie (Safari → „Do ekranu początkowego”), działa offline i jest automatycznie publikowana na GitHub Pages.

**Architektura:** `vite-plugin-pwa` generuje manifest i service worker (Workbox, precache wszystkich plików z `dist/`). Ikony powstają z jednego pliku SVG. GitHub Actions buduje aplikację i publikuje `dist/` na GitHub Pages; ścieżka bazowa (`/<nazwa-repo>/`) jest przekazywana przez zmienną środowiskową. Dane nadal tylko w `localStorage` — bez backendu i bazy danych.

**Stack:** React 19, TypeScript 5.8, Vite 6, Tailwind 4, pnpm, `vite-plugin-pwa`, `@vite-pwa/assets-generator`, GitHub Actions, GitHub Pages.

**Spec:** prośba użytkownika z 2026-11-10: „wdrożyć PWA, opublikować na GitHubie, instalacja na Androidzie i Apple, nadal bez bazy danych”.

## Ograniczenia globalne

- Bez bazy danych i backendu. Dane zostają w `localStorage`; klucze `jeden_cel_current_goal_v1` i `jeden_cel_history_v1` w `src/storage/goalStorage.ts` NIE mogą się zmienić.
- Interfejs i teksty manifestu po polsku. `lang: "pl"`.
- Nazwa w manifeście: `name: "1cel — jeden cel dziennie"`, `short_name: "1cel"`.
- Nowe zależności tylko: `vite-plugin-pwa` (dependency dev) i `@vite-pwa/assets-generator` (dependency dev). Żadnych innych.
- Menedżer pakietów: **pnpm** (jest `pnpm-lock.yaml`). Nie twórz `package-lock.json`.
- Bez `any`. Bez refaktoru niezwiązanego z PWA.
- Nie ruszaj `@google/genai`, `express`, `metadata.json` itp. — porządkuje to równolegle inna praca. Jeśli blokują build, zgłoś to, nie usuwaj samodzielnie.
- Każdy task kończy się: `pnpm lint` i `pnpm build` bez błędów.
- Hosting: GitHub Pages pod adresem `https://<użytkownik>.github.io/<repo>/`. Repozytorium **publiczne** (darmowe Pages dla prywatnych repo wymagają płatnego planu).

## Na co uważać przy review (Review Focus)

1. **Ścieżka bazowa na Pages** — aplikacja pod `/<repo>/` musi ładować JS/CSS, manifest, ikony i service worker bez 404. Weryfikacja: `pnpm build` z `BASE_PATH=/1cel/` + `pnpm preview` (Task 2, krok 6) i sprawdzenie na żywym Pages (Task 5).
2. **Offline po instalacji** — po pierwszym wejściu, przy wyłączonej sieci, aplikacja startuje i pokazuje zapisany cel (Task 2, krok 7).
3. **Aktualizacja wersji nie kasuje danych** — po nowym deployu użytkownik dostaje nową wersję, a cel i historia z `localStorage` zostają (Task 5, krok 5).
4. **iPhone** — ikona na ekranie głównym (nie zrzut strony), tryb pełnoekranowy, poprawny pasek statusu (Task 3 + Task 5).
5. **Dane są per adres** — dane z `localhost` nie przejdą na `github.io`, a na iOS aplikacja z ekranu głównego ma inną pamięć niż karta Safari. To trzeba opisać w README, nie „naprawiać” (Task 4).

---

## Mapa plików

| Plik | Zmiana | Odpowiedzialność |
|---|---|---|
| `package.json` | modyfikacja | nowe devDependencies, skrypt `generate-pwa-assets` |
| `pnpm-workspace.yaml` | modyfikacja | rozstrzygnięcie placeholderów `allowBuilds` (blokują CI) |
| `vite.config.ts` | modyfikacja | `base` z `BASE_PATH`, konfiguracja `VitePWA` |
| `public/icon.svg` | nowy | źródłowa ikona aplikacji |
| `public/*.png`, `public/favicon.ico` | generowane | ikony PWA i Apple |
| `pwa-assets.config.ts` | nowy | konfiguracja generatora ikon |
| `index.html` | modyfikacja | meta tagi: theme-color, Apple, ikony |
| `src/storage/goalStorage.ts` | modyfikacja | `requestPersistentStorage()` |
| `src/main.tsx` | modyfikacja | wywołanie `requestPersistentStorage()` |
| `.github/workflows/deploy.yml` | nowy | build + deploy na Pages |
| `README.md` | modyfikacja | instrukcja instalacji na telefonie i ograniczenia danych |

---

### Task 0: Przygotowanie repozytorium (wymaga decyzji/działań użytkownika)

Ten task wykonuje użytkownik albo agent **po jego zgodzie**.

- [ ] **Krok 1: Napraw dostęp do gita.** Obecnie `git` zwraca `detected dubious ownership` (folder `.git` należy do użytkownika `CodexSandboxOffline`). Użytkownik uruchamia:

```bash
git config --global --add safe.directory C:/_work/1cel
```

Oczekiwane: `git status` działa.

- [ ] **Krok 2: Sprawdź stan gita.** `git status`, `git log --oneline -5`, `git remote -v`. Jeśli nie ma commitów — zrób pierwszy commit obecnego stanu (po zakończeniu trwającego porządkowania kodu). Upewnij się, że `dist/` i `node_modules/` są ignorowane (są w `.gitignore`).

- [ ] **Krok 3: Utwórz publiczne repozytorium na GitHubie** (np. `1cel`) i dodaj remote. Jeśli `gh` jest zalogowane i użytkownik się zgodził:

```bash
gh repo create 1cel --public --source . --remote origin
```

Nie pushuj jeszcze — push następuje w Task 5. Zapisz nazwę repo — to wartość `BASE_PATH` (`/1cel/`).

---

### Task 1: Ścieżka bazowa i zależności PWA

**Pliki:** modyfikacja `vite.config.ts`, `package.json`, `pnpm-workspace.yaml`.

**Interfejsy:**
- Produkuje: zmienna środowiskowa `BASE_PATH` (string, np. `/1cel/`, domyślnie `/`) czytana w `vite.config.ts` jako `base`. Task 2 i 4 z niej korzystają.

- [ ] **Krok 1: Rozstrzygnij `pnpm-workspace.yaml`.** Wartości `set this to true or false` przerwą `pnpm install` w CI. Ustaw `esbuild: true`. `@google/genai` i `protobufjs` — jeśli równoległe porządkowanie już usunęło te pakiety, usuń wpisy; jeśli nie, ustaw `false`. Uruchom `pnpm install` — oczekiwane: bez błędów i bez pytań.

- [ ] **Krok 2: Dodaj zależności.**

```bash
pnpm add -D vite-plugin-pwa @vite-pwa/assets-generator
```

Sprawdź, że zainstalowana wersja `vite-plugin-pwa` deklaruje zgodność z Vite 6 (peerDependencies). Jeśli pnpm zgłasza konflikt peer — zatrzymaj się i zgłoś.

- [ ] **Krok 3: Ustaw `base` w `vite.config.ts`.** W obiekcie zwracanym przez `defineConfig` dodaj `base: process.env.BASE_PATH ?? '/'`. Nie zmieniaj sekcji `server` ani aliasów.

- [ ] **Krok 4: Weryfikacja.**

```bash
pnpm lint
BASE_PATH=/1cel/ pnpm build
```

(W PowerShell: `$env:BASE_PATH='/1cel/'; pnpm build`.) Oczekiwane: build OK, a `dist/index.html` odwołuje się do `/1cel/assets/...`.

- [ ] **Krok 5: Commit** — `chore: konfigurowalna ścieżka bazowa i zależności PWA`.

---

### Task 2: Ikony, manifest i service worker

**Pliki:** nowy `public/icon.svg`, `pwa-assets.config.ts`, generowane PNG w `public/`; modyfikacja `vite.config.ts`, `package.json`.

**Interfejsy:**
- Konsumuje: `base` z Task 1.
- Produkuje: pliki `public/pwa-64x64.png`, `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png`, `public/favicon.ico` (nazwy z presetu `minimal-2023`). Task 3 odwołuje się do nich w `index.html`.

- [ ] **Krok 1: Ustal kolory.** Odczytaj z `src/index.css` / komponentów główny kolor akcentu i kolor tła strony. Zapisz je jako `THEME_COLOR` i `BACKGROUND_COLOR` (hex). Te same wartości idą do manifestu i `index.html`.

- [ ] **Krok 2: Narysuj `public/icon.svg`.** Kwadrat 512×512, tło `THEME_COLOR` na całej powierzchni (bez przezroczystości — iOS wypełnia przezroczystość czernią), wyśrodkowana cyfra „1” w kolorze kontrastowym. Ważna treść w środkowych ~80% (bezpieczna strefa ikon maskable).

- [ ] **Krok 3: Generator ikon.** Utwórz `pwa-assets.config.ts`:

```ts
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/icon.svg'],
});
```

Dodaj do `package.json` skrypt `"generate-pwa-assets": "pwa-assets-generator"`. Uruchom `pnpm generate-pwa-assets`. Oczekiwane: w `public/` pojawiają się pliki wymienione w „Produkuje”. Commituj wygenerowane PNG (nie generuj ich w CI).

- [ ] **Krok 4: Skonfiguruj `VitePWA` w `vite.config.ts`.** Dodaj `VitePWA({...})` do `plugins` z ustawieniami:
  - `registerType: 'autoUpdate'`, `injectRegister: 'auto'` (rejestracja przez wygenerowany skrypt — bez zmian w kodzie React; nowa wersja działa od następnego otwarcia aplikacji, bez wymuszonego przeładowania w trakcie wpisywania).
  - `includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg']`.
  - `manifest`: `name`, `short_name`, `lang` z „Ograniczeń globalnych”; `description` = opis z `README.md` (pierwsze zdanie); `start_url: '.'`, `scope: '.'`, `display: 'standalone'`, `orientation: 'portrait'`, `theme_color: THEME_COLOR`, `background_color: BACKGROUND_COLOR`; `icons`: 64, 192, 512 (`purpose: 'any'`) oraz `maskable-icon-512x512.png` (`purpose: 'maskable'`).
  - `workbox`: `globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']`, `navigateFallback: 'index.html'`, `cleanupOutdatedCaches: true`.
  - Nie włączaj `devOptions` (SW tylko w buildzie produkcyjnym).

- [ ] **Krok 5: Weryfikacja buildu.**

```bash
pnpm lint
BASE_PATH=/1cel/ pnpm build
```

Oczekiwane: w `dist/` są `manifest.webmanifest`, `sw.js`, `registerSW.js`, ikony; w manifeście `start_url`/`scope` względne; `dist/index.html` ma `<link rel="manifest" href="/1cel/manifest.webmanifest">`.

- [ ] **Krok 6: Weryfikacja w przeglądarce.** `pnpm preview` po buildzie z `BASE_PATH=/1cel/`, otwórz `http://localhost:4173/1cel/`. W DevTools → Application: Manifest bez błędów i ostrzeżeń o ikonach; Service Worker „activated”. Konsola bez 404.

- [ ] **Krok 7: Weryfikacja offline i danych.** Na tej samej stronie dodaj cel z 2 krokami, odhacz jeden. DevTools → Network → Offline, przeładuj. Oczekiwane: aplikacja się ładuje, cel i postęp są widoczne. Wróć online.

- [ ] **Krok 8: Commit** — `feat: manifest PWA, ikony i service worker`.

---

### Task 3: Meta tagi dla iOS/Androida i trwała pamięć

**Pliki:** modyfikacja `index.html`, `src/storage/goalStorage.ts`, `src/main.tsx`.

**Interfejsy:**
- Konsumuje: nazwy ikon z Task 2.
- Produkuje: `export async function requestPersistentStorage(): Promise<boolean>` w `src/storage/goalStorage.ts`.

- [ ] **Krok 1: `index.html` — dodaj w `<head>`:**
  - `<meta name="theme-color" content="THEME_COLOR">`
  - `<meta name="description" content="…">` (ten sam opis co w manifeście)
  - `<link rel="icon" href="/favicon.ico" sizes="any">` i `<link rel="icon" href="/icon.svg" type="image/svg+xml">`
  - `<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">`
  - `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-title" content="1cel">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
  - viewport zmień na `width=device-width, initial-scale=1.0, viewport-fit=cover`

  Ścieżki zaczynające się od `/` Vite przepisze na `base` przy buildzie — sprawdź to w `dist/index.html`.

- [ ] **Krok 2: Bezpieczne marginesy.** Ponieważ `viewport-fit=cover`, sprawdź, czy nagłówek i dolne elementy nie wchodzą pod notch/pasek iPhone'a. Jeśli trzeba, dodaj w `src/index.css` dla kontenera strony `padding-top: env(safe-area-inset-top)` i `padding-bottom: env(safe-area-inset-bottom)`. Tylko to — bez innych zmian stylu.

- [ ] **Krok 3: `requestPersistentStorage()` w `goalStorage.ts`.** Zachowanie: jeśli `navigator.storage?.persist` nie istnieje → zwraca `false`; jeśli `navigator.storage.persisted()` zwraca `true` → zwraca `true` bez pytania; w przeciwnym razie zwraca wynik `navigator.storage.persist()`. Błąd → `console.warn` z polskim komunikatem i `false` (nie rzucaj — aplikacja ma działać dalej). Nie zmieniaj istniejących funkcji ani kluczy.

- [ ] **Krok 4: Wywołanie w `src/main.tsx`** po `createRoot(...).render(...)`: `void requestPersistentStorage();`.

- [ ] **Krok 5: Weryfikacja.** `pnpm lint`, `BASE_PATH=/1cel/ pnpm build`, `pnpm preview`. W konsoli brak błędów; w DevTools → Application → Storage widać stan „persistent” (w Chrome może wymagać zainstalowania aplikacji — brak zgody to poprawny wynik `false`, nie błąd). Widok mobilny (375 px) w DevTools — układ bez poziomego scrolla. Powtórz krok 7 z Task 2 (offline + dane).

- [ ] **Krok 6: Commit** — `feat: meta tagi iOS/Android i prośba o trwałą pamięć`.

---

### Task 4: Automatyczna publikacja na GitHub Pages + README

**Pliki:** nowy `.github/workflows/deploy.yml`; modyfikacja `README.md`.

**Interfejsy:**
- Konsumuje: `BASE_PATH` z Task 1, skrypty `pnpm lint` / `pnpm build`.

- [ ] **Krok 1: Workflow `.github/workflows/deploy.yml`.** Wymagania:
  - Wyzwalacz: `push` na `master` oraz `workflow_dispatch`.
  - `permissions: contents: read, pages: write, id-token: write`; `concurrency: group: pages, cancel-in-progress: true`.
  - Job `build`: `actions/checkout@v4`, `pnpm/action-setup@v4` (wersja pnpm z pola `packageManager` w `package.json`, jeśli jest; inaczej podaj wersję zgodną z lokalną `pnpm -v`), `actions/setup-node@v4` z `node-version: 22` i `cache: pnpm`, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build` z `env: BASE_PATH: /${{ github.event.repository.name }}/`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` z `path: dist`.
  - Job `deploy`: `needs: build`, `environment: name: github-pages, url: ${{ steps.deployment.outputs.page_url }}`, `actions/deploy-pages@v4` z `id: deployment`.

- [ ] **Krok 2: README — dodaj sekcje (po polsku):**
  - „Wersja online” — adres `https://<użytkownik>.github.io/<repo>/` (uzupełnij po Task 5).
  - „Instalacja na telefonie”: Android/Chrome — menu ⋮ → „Zainstaluj aplikację” / „Dodaj do ekranu głównego”; iPhone/Safari — przycisk Udostępnij → „Do ekranu początkowego”.
  - „Gdzie są dane”: dane tylko na tym urządzeniu i w tej przeglądarce; wersja lokalna (`localhost`) i online mają osobne dane; na iPhonie aplikacja z ekranu głównego ma inne dane niż karta Safari; usunięcie aplikacji lub danych przeglądarki usuwa cele; brak synchronizacji między urządzeniami.
  - „Publikacja”: push na `master` uruchamia deploy; jednorazowo w repo Settings → Pages → Source: „GitHub Actions”.

- [ ] **Krok 3: Weryfikacja lokalna.** `pnpm lint`, `pnpm build`. Sprawdź składnię YAML (np. przegląd wcięć; jeśli dostępne — `actionlint`).

- [ ] **Krok 4: Commit** — `ci: publikacja na GitHub Pages i instrukcja instalacji`.

---

### Task 5: Pierwszy deploy i test na telefonach (wymaga użytkownika)

- [ ] **Krok 1:** Użytkownik włącza w repo Settings → Pages → Source: **GitHub Actions**.
- [ ] **Krok 2:** Push na `master` (po zgodzie użytkownika): `git push -u origin master`. Oczekiwane: workflow „deploy” zielony w zakładce Actions (`gh run watch`).
- [ ] **Krok 3: Test na desktopie.** Otwórz adres Pages. DevTools → Application: manifest OK, SW aktywny, brak 404 w konsoli. Lighthouse (kategoria PWA/„Installable”, jeśli dostępna) bez błędów instalowalności. Uzupełnij adres w README, commit `docs: adres wersji online`.
- [ ] **Krok 4: Test na telefonach (użytkownik).**
  - Android/Chrome: pojawia się „Zainstaluj aplikację”; po instalacji ikona „1” na ekranie, start bez paska adresu; dodaj cel, włącz tryb samolotowy, uruchom ponownie — cel widoczny.
  - iPhone/Safari: Udostępnij → „Do ekranu początkowego”; ikona to grafika „1” (nie zrzut strony), nazwa „1cel”, start pełnoekranowy, nagłówek nie wchodzi pod notch; test offline jak wyżej.
- [ ] **Krok 5: Test aktualizacji.** Zrób drobną widoczną zmianę (np. tekst w stopce — potem ją cofnij), push, poczekaj na deploy. Na zainstalowanej aplikacji: zamknij i otwórz dwa razy. Oczekiwane: nowa wersja widoczna, cel i historia zachowane.

---

## Czego ten plan świadomie nie robi

- Brak synchronizacji, kont, backendu i bazy danych.
- Brak eksportu/importu danych (dobry kandydat na osobne zadanie, bo dane żyją tylko na jednym urządzeniu).
- Brak powiadomień push i własnego przycisku „Zainstaluj” w UI.
- Brak publikacji w Google Play / App Store.
