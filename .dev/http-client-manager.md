# HTTP-клиент: свой менеджер (отложено)

Статус: не делаем в текущей итерации auth. Пока остаётся `apps/frontend/src/services/api/apiClient.ts` (axios + p-limit), без очереди на refresh.

## Задумка

Когда на один или несколько запросов приходит 401 (протухший access_token):

1. Автоматически дергаем refresh.
2. Пока refresh идёт — остальные запросы ждут, не падают наружу с ошибкой.
3. После успешного refresh упавшие запросы уходят на сервер ещё раз.
4. Если refresh не удался — тогда уже ошибка / разлогин.

Плюс свой concurrency-лимит вместо `p-limit`: один менеджер и очередь, и параллелизм, и auth-retry.

Готовые пакеты вроде `axios-auth-refresh` не берём — пишем сами.

## Контекст cookies (когда дойдём)

- `access_token` — httpOnly, Path под `/api/*`
- `refresh_token` — httpOnly, Path только `/api/auth/refresh`
- Нужен `withCredentials`
- Сам `/api/auth/refresh` (и login/logout) не должны попадать в retry-петлю по 401

## Когда брать в работу

Отдельная итерация после базового auth (login / logout / me, Redis, guards, тестовая страница входа). Этот файл — напоминалка и ТЗ на потом.

## Набросок критериев приёмки

- Один in-flight refresh, параллельные 401 его не дублируют
- Успех refresh → retry исходных запросов
- Провал refresh → запросы получают ошибку, без бесконечного цикла
- Лимит параллелизма без `p-limit`
- Login / logout / refresh исключены из auto-retry
