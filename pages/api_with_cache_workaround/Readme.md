
Stworzenie listy wszystkich postaci zajmuje dużo czasu.

Nie mogę zrobić tego za każdym razem jak idzie zapytanie do API bo to trwa zbyt długo.

Dodatkowo Vercel ma ograniczenie 10sek na zapytanie. Jeżeli trwa dłużej to TIMEOUT. Nie dotyczy to jednak momentu kiedy jest build.

Idealnym miejscem było by użycie `getStaticProps` ale nie można jej użyć w API.

Więc podepnę `getStaticProps` do stron tutaj, a w api będę robić requesta do tej strony by pobrać wszystko z `#__NEXT_DATA__` w DOM strony.

Konkretnie to `#__NEXT_DATA__` -> Json -> `props.pageprops.MOJA_NAZWA_ZMIENNEJ`

Giga skąplikowane ale powinno działać.
