# FiveCity Transmisje Live

Aplikacja z listą kanałów Twitch.tv streamerów grających na serwerze FiveCity.

## FAQ

### 1. Mojego ulubionego streamera nie ma na liście

> Podczas streama musi być ustawiona kategoria GTAV, a w tytule streama powinna się znaleść wzmianka o FiveCity. Streamerzy zwykle wstawiają w tytuł `5city`. Obecnie wymagane jest wstawienie w tytuł jednej z poniższych fraz
> `[5city]`, `5city`, `fivecity` lub `5miasto`.

### 2. Jak dodać streamera do listy?

> Stwórz stronę z informacjami o odgrywanej przez niego postaci na wiki fivecity.
> Nie zapomnij umieścić tam linku do jego kanału twitch.tv

### 3. Informacje są nieaktualne, co robić?

> Lista postaci jest aktualizowana raz dziennie.
> Lista streamerów jest aktualizowana co około 5min.
> Wszystkie informacje dotyczące postaci są pobierane z wiki fivecity i to tam powinny być dokonywane stosowne poprawki i korekty.

## Setup

### Zdobądź dostęp do API Twitch

Idź do <https://dev.twitch.tv/docs/api/get-started> i stwórz nową aplikację  
Uwaga: Aby utworzyć TwitchApp, musisz mieć włączone dwuskładnikowe uwierzytelnianie. Zrobisz to tutaj: <https://www.twitch.tv/settings/security>  
Zapisz do pliku `.env` zmienne: `TWITCH_API_CLIENT_ID` i `TWITCH_API_CLIENT_SECRET`

### Getting Started

Development server:

```bash
yarn dev
```

Build:

```bash
yarn build
```

Start production build:

```bash
yarn start
```

or

```bash
docker-compose up -d
# or
docker-compose -f docker-compose.local.yml up -d
```

## Contributing

Jeśli chcesz przyczynić się do projektu i ulepszyć go, nie krępuj się, Twoja pomoc jest mile widziana. Czekam na twoje PRy ;-)

## Credits

Stworzenie tej aplikacji nie byłoby możliwe bez redaktorów <https://5city.fandom.com>, którzy dodali informacje o postaciach i kanałach streamerów, którzy odgrywają postacie.
