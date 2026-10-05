# Zasady pracy w projekcie 1C

Ten plik jest głównym punktem wejścia dla agentów pracujących nad aplikacją.
Zachowuj zasady proste i dobieraj je do ryzyka konkretnej zmiany.

## Przebieg pracy

1. Ustal oczekiwany rezultat, kryteria sukcesu i ograniczenia.
2. Przed zmianą sprawdź odpowiednie pliki i istniejące zachowanie aplikacji.
3. Wybierz najmniejszą zmianę, która realizuje cel. Nie refaktoryzuj przy okazji.
4. Zanim zaczniesz, określ krótko zakres plików, podejście i sposób weryfikacji.
5. Po zmianie sprawdź diff oraz uruchom odpowiednie kontrole projektu.
6. Zgłoś rezultat i konkretny dowód weryfikacji. Nie deklaruj PASS bez sprawdzenia.

Używaj lekkiego trybu dla zmian kosmetycznych i małych poprawek. Dla zmian
zachowania, danych lub nowej funkcji najpierw przeanalizuj przepływ i możliwe
przypadki błędów. Audyt oznacza wyłącznie odczyt i raport bez edycji plików.

## Kontekst aplikacji

1C to aplikacja React i TypeScript do planowania jednego dziennego celu oraz
śledzenia jego kroków. Dane aktualnego celu i historia są przechowywane w
przeglądarce przez `localStorage`.

- `src/App.tsx` — główny przepływ aplikacji i stan celu.
- `src/components/` — formularz celu, karta celu, historia i nagłówek.
- `src/storage/goalStorage.ts` — odczyt i zapis danych lokalnych.
- `src/types/` — typy celu, kroków i statusów.
- `src/index.css` — style globalne.

Trzymaj interfejs, logikę przepływu i dostęp do pamięci w ich istniejących
warstwach. Preferuj istniejące komponenty i zależności.

## Zasady zmian

- Zachowaj polski język interfejsu, chyba że zadanie wymaga inaczej.
- Nie zmieniaj bez potrzeby podstawowego założenia produktu: jednego celu na dzień.
- Zmiany formatu lub znaczenia danych w `localStorage` wymagają sprawdzenia
  zgodności ze starszymi zapisami i ochrony istniejących danych użytkownika.
- Dla operacji na danych sprawdź błędne lub brakujące dane oraz ścieżki błędów,
  nie tylko pomyślne użycie.
- Nie wprowadzaj `any`, nie ukrywaj błędów cichym sukcesem i nie dodawaj
  zależności ani abstrakcji bez potrzeby wynikającej z zadania.
- Zachowuj dostępność i działanie układu na małych ekranach przy zmianach UI.
- Jeśli brakuje istotnych dowodów albo bezpieczny zakres jest niejasny, najpierw
  sprawdź, co da się ustalić w repozytorium. Pytaj użytkownika tylko o brakującą
  decyzję, której nie da się wywnioskować.

## Weryfikacja

Dobierz sprawdzenie do zmiany. Dostępne komendy:

- `npm run lint` — kontrola typów TypeScript.
- `npm run build` — kompilacja aplikacji produkcyjnej.

Przy zmianach logiki lub zapisu danych wskaż, jakie przypadki zostały
sprawdzone. Przy zmianach wizualnych przejrzyj zmieniony kod i, jeśli to
możliwe, wynik interfejsu. Zgłoś kontrole, których nie udało się wykonać.

## Raport

Pisz zwięźle i prostym językiem:

- co zostało zmienione i w jakich plikach,
- dlaczego ta zmiana realizuje cel,
- jak ją sprawdzono i z jakim wynikiem,
- jakie istotne ograniczenie lub ryzyko pozostało.
