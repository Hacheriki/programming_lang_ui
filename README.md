# programmin-lang-ui

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

```
Язык = "Программа" Множества Опер...Опер "Конец"
Множества = Множество...Множество
Множество = ["Выполнить" ! "Сохранить"] ":" Вещ...Вещ ["Первое" ! "Второе"]
Опер = Перем "=" Пр.ч.
Пр.ч = </"-"/> Блок ["+" ! "-"]...Блок
Блок = Блок2 ["*" ! "/"]...Блок2
Блок2 = Блок3 ["&&" ! "||"]... Блок3
Блок3 = </"!"/> Блок4
Блок4 = </Функ...Функ/> Блок5
Блок5 = Цел ! Перем
Перем = Б</Сим...Сим/>
Функ = "Синус" ! "Косинус" ! "Тангенс" ! "Котангенс"
Сим=Б!Ц
Б="А"!"Б"!..."Я"!"а"!"б"!..."я"
Ц="0"!"1"!..."7"
```
