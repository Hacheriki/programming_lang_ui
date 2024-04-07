<script setup lang="ts">
import {h, onMounted, ref} from "vue";
import {SourceCode} from "@/programmingLang/lexer/sourceCode";
import {tokenize} from "@/programmingLang/lexer/tokenize";
import {Parser} from "@/programmingLang/parser/parser";
import Scope from "@/programmingLang/compiler/scope";
import {evaluate} from "@/programmingLang/compiler/compiler";
import {LangCompileError, LangSyntaxError} from "@/programmingLang/types/languageError";

const backdropRef = ref<HTMLDivElement>()
const highlightRef = ref<HTMLDivElement>()
const srcRef = ref<HTMLTextAreaElement>()

let highlightInner = ref<string>("")
let textareaScroll: number = 0

function highlightText() {
  if (!srcRef.value) return

  try {
    const source = new SourceCode(srcRef.value.value)
    const tokens = tokenize(source)
    console.log(tokens[0])
    const ast = new Parser(tokens).parse()

    const scope = new Scope()
    const runtime = evaluate(ast, scope)
    console.log(scope)
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

    const beforeHighlight = originalText.substring(0, start-1);
    const highlightedText = originalText.substring(start-1, end);
    const afterHighlight = originalText.substring(end);

    highlightInner.value = beforeHighlight + '<mark>' + highlightedText + '</mark>' + afterHighlight;
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
  <div style="padding: 20px; border-radius: 5px; box-shadow: rgba(0, 0, 0, 0.3) 0 1px 3px;">
    <h1>Введите исходный код</h1>
    <div class="srcContainer">
      <div class="backdrop" ref="backdropRef">
        <div class="highlights" ref="highlightRef" v-html="highlightInner"></div>
      </div>
      <textarea @input="clearMarks" @scroll="updateScroll" ref="srcRef">Программа
Выполнить:123.321 Первое
Сохранить:123.1 Второе

А321=1+1
А123=-А321+123*2+Косинус Синус 2+!0
Т123=1/0

Конец</textarea>
    </div>
    <button class="pure-material-button-contained" @click="highlightText" style="margin-top: 10px;">Выполнить</button>
  </div>
</template>

<style>

.backdrop, textarea, .srcContainer {
  width: 800px;
  height: 400px;
}

.highlights, textarea {
  padding: 10px;
  font: 20px/28px 'Open Sans', sans-serif;
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
  background-color: #b1d5e5;
}
</style>
