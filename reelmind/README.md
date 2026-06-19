# ReelMind — Frontend

Aplikacja webowa **ReelMind** — serwis do przeglądania, oceniania i odkrywania
filmów. SPA zbudowana w **Vue 3** + **TypeScript** + **Vite**, komunikująca się
z backendem Django REST (`reelmind_backend`). Interfejs jest dwujęzyczny
(polski / angielski) i responsywny (osobna nawigacja mobilna).

---

## Spis treści
- [Stack technologiczny](#stack-technologiczny)
- [Główne funkcje](#główne-funkcje)
- [Wymagania](#wymagania)
- [Szybki start](#szybki-start)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [Skrypty npm](#skrypty-npm)
- [Struktura projektu](#struktura-projektu)
- [Routing](#routing)
- [Warstwa API](#warstwa-api)
- [Stan aplikacji (Pinia)](#stan-aplikacji-pinia)
- [Internacjonalizacja (i18n)](#internacjonalizacja-i18n)

---

## Stack technologiczny
- **Vue 3** (Composition API, `<script setup>`)
- **TypeScript**
- **Vite** — dev server i bundler
- **Vue Router** — routing z lazy-loadingiem stron i guardami
- **Pinia** — zarządzanie stanem
- **vue-i18n** — tłumaczenia PL / EN

## Główne funkcje
- Rejestracja i logowanie (JWT — token w `localStorage`)
- Strona główna z karuzelami filmów (`MovieRow`)
- Katalog filmów z wyszukiwaniem, filtrami i sortowaniem
- Szczegóły filmu z ocenianiem i recenzjami
- Watchlista i profil użytkownika
- Onboarding (modal zbierający preferencje nowego użytkownika)
- Spersonalizowane rekomendacje + popup zachęcający po zalogowaniu
- Asystent AI (`ChatWidget`) — okno czatu z asystentem filmowym
- Panel administratora (chroniony guardem `requireAdmin`)
- Przełącznik języka PL / EN, dolna nawigacja na urządzeniach mobilnych

## Wymagania
- **Node.js** (zalecane ≥ 20)
- Działający backend `reelmind_backend` (domyślnie na `http://localhost:8000/api`)

## Szybki start
```bash
# 1. Instalacja zależności
npm install

# 2. Konfiguracja środowiska
cp .env.example .env.local
# ustaw VITE_API_BASE_URL na adres backendu

# 3. Uruchomienie dev servera (domyślnie http://localhost:5173)
npm run dev
```

> Backend zezwala na CORS dla `http://localhost:5173` — uruchamiaj frontend na
> tym porcie albo dopisz swój origin do `CORS_ALLOWED_ORIGINS` w ustawieniach backendu.

## Zmienne środowiskowe
Plik `.env.local` (nie jest commitowany):

| Zmienna              | Opis                                  | Domyślnie                      |
|----------------------|---------------------------------------|--------------------------------|
| `VITE_API_BASE_URL`  | Bazowy URL API backendu               | `http://localhost:8000/api`    |
| `VITE_API_MODE`      | Tryb pracy (`api` / `dev`)            | `api`                          |

## Skrypty npm
| Komenda            | Opis                                              |
|--------------------|---------------------------------------------------|
| `npm run dev`      | Uruchamia dev server Vite z hot-reload            |
| `npm run build`    | Sprawdza typy (`vue-tsc`) i buduje produkcyjnie do `dist/` |
| `npm run preview`  | Lokalny podgląd zbudowanej wersji produkcyjnej    |

## Struktura projektu
```
reelmind/
├── public/
├── src/
│   ├── api/
│   │   ├── client.ts          # wrapper fetch: nagłówki, JWT, obsługa błędów
│   │   ├── config.ts          # baseUrl, klucze tokenów, domyślny język
│   │   └── modules/           # klienty API per domena
│   │       ├── auth.api.ts
│   │       ├── movies.api.ts
│   │       ├── ratings.api.ts
│   │       ├── recommendations.api.ts
│   │       ├── user.api.ts
│   │       ├── chat.api.ts
│   │       └── admin.api.ts
│   ├── assets/                # grafiki (hero, logo)
│   ├── components/            # komponenty współdzielone
│   │   ├── AppNavbar.vue
│   │   ├── AppSidebar.vue
│   │   ├── BottomNav.vue      # nawigacja mobilna
│   │   ├── AppToast.vue
│   │   ├── ChatWidget.vue     # asystent AI
│   │   ├── OnboardingModal.vue
│   │   ├── RecommendationPopup.vue
│   │   ├── MovieCard.vue / MovieCardSkeleton.vue
│   │   ├── MovieGrid.vue / MovieRow.vue
│   │   └── ui/                # małe elementy UI
│   ├── composables/
│   │   ├── useDebounce.ts     # debounce (np. dla wyszukiwarki)
│   │   └── useLocale.ts       # zmiana i utrzymanie języka
│   ├── i18n/                  # tłumaczenia
│   │   ├── index.ts
│   │   ├── pl.ts
│   │   └── en.ts
│   ├── pages/                 # widoki tras (lazy-loaded)
│   │   ├── HomePage.vue
│   │   ├── MoviesPage.vue / MoviePage.vue
│   │   ├── RecommendationsPage.vue
│   │   ├── ProfilePage.vue
│   │   ├── LoginPage.vue / RegisterPage.vue
│   │   ├── AdminPage.vue
│   │   └── NotFoundPage.vue
│   ├── router/
│   │   ├── index.ts           # definicje tras
│   │   └── guards.ts          # requireAuth / requireAdmin / redirectIfAuthenticated
│   ├── stores/                # magazyny Pinia
│   ├── types/                 # typy TypeScript (DTO API)
│   ├── utils/format.ts        # formatowanie (czas trwania, daty itp.)
│   ├── App.vue
│   ├── main.ts                # bootstrap: pinia, router, i18n, fetchMe
│   └── style.css
├── index.html
├── vite.config.ts             # alias '@' → ./src
├── tsconfig*.json
└── .env.example
```

## Routing
Trasy definiowane w `src/router/index.ts` (komponenty ładowane leniwie):

| Ścieżka            | Nazwa            | Ochrona                       |
|--------------------|------------------|-------------------------------|
| `/`                | home             | publiczna                     |
| `/movies`          | movies           | publiczna                     |
| `/movie/:id`       | movie            | publiczna                     |
| `/recommendations` | recommendations  | `requireAuth`                 |
| `/profile`         | profile          | `requireAuth`                 |
| `/login`           | login            | `redirectIfAuthenticated`     |
| `/register`        | register         | `redirectIfAuthenticated`     |
| `/admin`           | admin            | `requireAdmin`                |
| `/:pathMatch(.*)*` | not-found        | publiczna                     |

Guardy (`src/router/guards.ts`):
- **`requireAuth`** — przekierowuje niezalogowanych na `/login` (z parametrem `redirect`).
- **`requireAdmin`** — wymaga roli `admin`, w przeciwnym razie kieruje na `/`.
- **`redirectIfAuthenticated`** — zalogowanych odsyła ze stron logowania/rejestracji na `/`.

## Warstwa API
- `api/client.ts` zawiera wrapper na `fetch`, który dołącza nagłówek
  `Authorization: Bearer <token>` (token z `localStorage`), serializuje JSON
  i ujednolica obsługę błędów (`ApiException`).
- `api/config.ts` definiuje `baseUrl` (z `VITE_API_BASE_URL`), klucze tokenów
  (`reelmind_access`, `reelmind_refresh`) oraz domyślny język (`pl`).
- Każdy moduł w `api/modules/` grupuje wywołania jednej domeny (auth, movies,
  ratings, recommendations, user, chat, admin).

## Stan aplikacji (Pinia)
| Store                   | Odpowiedzialność                                                       |
|-------------------------|------------------------------------------------------------------------|
| `auth.store`            | Użytkownik, logowanie/rejestracja, `isAuthenticated`, `isAdmin`, `needsOnboarding`, popup rekomendacji |
| `movie.store`           | Lista filmów, filtry, wyszukiwanie, szczegóły                          |
| `recommendation.store`  | Pobieranie i cache rekomendacji                                        |
| `onboarding.store`      | Stan i zapis preferencji onboardingu                                   |
| `chat.store`            | Sesja i historia rozmowy z asystentem AI                              |
| `toast.store`           | Globalne powiadomienia (toasty)                                       |

Przy starcie (`main.ts`) wywoływane jest `auth.fetchMe()` — odtworzenie sesji
na podstawie zapisanego tokenu.

## Internacjonalizacja (i18n)
- Skonfigurowane w `src/i18n/index.ts` (vue-i18n, tryb `legacy: false`).
- Język początkowy wykrywany z `navigator.language`, fallback: `en`.
- Wybór użytkownika zapisywany jest w `localStorage` (`reelmind_locale`).
- Tłumaczenia: `src/i18n/pl.ts` oraz `src/i18n/en.ts`; zmiana języka przez
  composable `useLocale`.
