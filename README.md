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

```
Язык = "Программа" Звенья "Конец"
Звенья = Звено ";" ...Звено
Звено = "Ввод" Слово...Слово
Слово = Метка ":" Переменная = Правая часть
Правая часть = </"-"/> Блок1 ["+"!"-"]...Блок1
Блок1 = Блок2 ["*"!"/"]...Блок2
Блок2 = Блок3 ["&&"!"||"]...Блок3
Блок3 = </"!"/> Блок4
Блок4 = Переменная ! Целое ! "(" Правая часть ")" ! "[" Правая часть "]" <= 2
Переменная = Буква Цифра Цифра Цифра
Метка = Целое
Целое = Цифра...Цифра
Буква = "А"!"Б"!...!"Я"!"а"!"б"!...!"я"
Цифра = "0"!"1"!...!"7"
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
