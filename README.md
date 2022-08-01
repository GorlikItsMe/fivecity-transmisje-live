# FiveCity Transmisje Live

Aplikacja z listą kanałów Twitch.tv streamerów grających na serwerze FiveCity.

## Setup

### Zdobądz dostęp do API Twitch

Idz do <https://dev.twitch.tv/docs/api/get-started> i stwórz nową aplikację  
Uwaga: Aby utworzyć TwitchApp musisz mieć włączone dwuskładnikowe uwierzytelnianie. Zrobisz to tutaj: <https://www.twitch.tv/settings/security>  
Zapisz do pliku `.env` zmienne: `TWITCH_API_CLIENT_ID` i `TWITCH_API_CLIENT_SECRET`

### Getting Started

Development server:

```bash
yarn dev
```

Build

```bash
yarn build
```

Start production build

```bash
yarn start
```

## Contributing

Jeśli chcesz przyczynić się do projektu i ulepszyć go, nie krępuj się, Twoja pomoc jest mile widziana. Czekam na twoje PRy ;-)

## Credits

Stworzenie tej aplikacji nie było by możliwe bez ciężkiej pracy redaktorów <https://5city.fandom.com> którzy dodali informacje o postaciach i kanałach streamerów którzy odgrywalją postacie.
