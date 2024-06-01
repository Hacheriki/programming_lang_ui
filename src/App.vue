<script setup lang="ts">
import {onMounted, ref} from "vue";
import {SourceCode} from "@/programmingLang/lexer/sourceCode";
import {tokenize} from "@/programmingLang/lexer/tokenize";
import {Parser} from "@/programmingLang/parser/parser";
import Scope from "@/programmingLang/compiler/scope";
import {evaluate} from "@/programmingLang/compiler/compiler";
import {LangCompileError, LangSyntaxError} from "@/programmingLang/types/languageError";

const backdropRef = ref<HTMLDivElement>()
const highlightRef = ref<HTMLDivElement>()
const srcRef = ref<HTMLTextAreaElement>()

let output = ref<string>("")

let highlightInner = ref<string>("")
let textareaScroll: number = 0

// TODO: РАЗДЕЛИТЬ НА ФАЙЛЫ
// TODO: Сделать пример больше
// TODO: Добавить проверку 'Неверный формат переменной' + Зарезервированные слова
// TODO: Незивестен '+' в контексте '**' (объявлении переменной)

function highlightText() {
    if (!srcRef.value) return
    if (!srcRef.value?.value) return;

    srcRef.value.value = srcRef.value.value.trim()
    try {
        const source = new SourceCode(srcRef.value.value)
        const tokens = tokenize(source)
        console.log(tokens)
        const ast = new Parser(tokens).parse()
        console.log(ast)
        const scope = new Scope()
        evaluate(ast, scope)
        let variablesLog = ""
        scope.variables.forEach((v: any, k: any) => {
            console.log(k)
            variablesLog += `${k} = ${v.value}\n`
        })
        output.value = variablesLog
    } catch (e) {
        let start = 0
        let end = 0
        switch ((e as Error).name) {
            case "CompileError": {
                const error = e as LangCompileError
                start = error.token.from
                end = error.token.to
                break
            }
            case "SyntaxError": {
                const error = e as LangSyntaxError
                start = error.from
                end = error.to
            }
        }
        const originalText = srcRef.value.value;

        const beforeHighlight = originalText.substring(0, start - 1);
        const highlightedText = originalText.substring(start - 1, end);
        const afterHighlight = originalText.substring(end);

        highlightInner.value = beforeHighlight + '<mark>' + highlightedText + '</mark>' + afterHighlight;
        output.value = (e as Error).message
    }
}

function updateScroll() {
    if (!srcRef.value) return
    const scrollY = srcRef.value.scrollTop
    const scrollX = srcRef.value.scrollLeft

    backdropRef.value?.scrollTo(scrollX, scrollY)
}

function clearMarks() {
    if (!srcRef.value) return
    highlightInner.value = srcRef.value.value
}

onMounted(() => {
    if (!srcRef.value) return
    highlightInner.value = srcRef.value.value
})

</script>

<template>
    <div
        style="display: flex; flex-direction: row; padding: 20px; border-radius: 5px; box-shadow: rgba(0, 0, 0, 0.3) 0 1px 3px;">
        <div>
            <h1>Исходный код</h1>
            <div class="srcContainer">
                <div class="backdrop" ref="backdropRef">
                    <div class="highlights" ref="highlightRef" v-html="highlightInner"></div>
                </div>
                <textarea @input="clearMarks" @scroll="updateScroll" ref="srcRef" autocomplete="off"
                          autocapitalize="off" spellcheck="false">Программа
Ввод
1: А123 = 2*[6+6*[1+1+(123+321)]]
2: А124 = 3 + 7*(6+А123)
4: А125 = 7+2;
Ввод
5: А126 = 7+7;
Ввод
6: А127 = 1+1;
Конец</textarea>
            </div>
            <button class="pure-material-button-contained" @click="highlightText" style="margin-top: 10px;">Выполнить
            </button>
            <div class="output">
                <pre>Вывод:<br>{{ output }}</pre>
            </div>
        </div>
        <div style="margin-left: 30px">
            <h1>БНФ языка</h1>
            <div class="srcContainer">
        <textarea disabled>Язык = "Программа" Звенья "Конец"
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
        </textarea>
            </div>
        </div>
    </div>
</template>

<style>

.backdrop, textarea, .srcContainer {
    width: 500px;
    height: 400px;
}

.highlights, textarea {
    padding: 10px;
    font: 14px/20px 'Open Sans', sans-serif;
    letter-spacing: 1px;
}

.backdrop {
    position: absolute;
    z-index: 1;
    border: 2px solid #685972;
    background-color: #fff;
    overflow: auto;
    pointer-events: none;
    transition: transform 1s;
}

.highlights {
    white-space: pre-wrap;
    word-wrap: break-word;
    color: transparent;
}

textarea {
    display: block;
    position: absolute;
    z-index: 2;
    margin: 0;
    border: 2px solid #74637f;
    border-radius: 0;
    color: #444;
    background-color: transparent;
    overflow: auto;
    resize: none;
    transition: transform 1s;
}

mark {
    border-radius: 3px;
    color: transparent;
    background-color: rgba(255, 89, 89, 0.37);
    text-decoration: red underline wavy;
}

pre {
    border: 2px solid #74637f;
    margin-top: 5px;
    padding: 5px;
    border-radius: 2px;
}
</style>
