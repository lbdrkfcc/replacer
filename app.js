let $app = document.querySelector('#app')
let $editorTextarea = $app.querySelector('#editor-textarea')
let $editorPreview = $app.querySelector('#editor-preview')
let $editorResult = $app.querySelector('#editor-result')
let $builder = $app.querySelector('.builder-body')
let $code = $app.querySelector('.code')
let $storageName = $app.querySelector('#storage-name')
let $storageList = $app.querySelector('#storage-list')


function tplBuilderForm(pattern = "", replacement = "") {
    return `<div class="builder-form builder-pattern">
    <input type="text" class="builder-input pattern" value="${pattern}" title="${pattern}" onchange="refreshTitle(this)"> 
    >
    <input type="text" class="builder-input replacement" value="${replacement}" title="${replacement}" onchange="refreshTitle(this)">
    <button type="button" title="удалить" onclick="removeBuilderForm(this)">X</button>
    <button type="button" title="добавить" onclick="addNextBuilderForm(this)">+1</button>
</div>`
}

function addToStartBuilderForm() {
    $builder.insertAdjacentHTML('afterbegin', tplBuilderForm() )
}

function addToEndBuilderForm(thisElement) {
    thisElement.parentElement.insertAdjacentHTML('beforebegin', tplBuilderForm())
}

function addNextBuilderForm(thisElement) {
    thisElement.parentElement.insertAdjacentHTML('afterend', tplBuilderForm())
}

function removeBuilderForm(thisElement) {
    thisElement.parentElement.remove()
}

function clearBuilder() {
    $builder.querySelectorAll('.builder-pattern').forEach(function(element) {
        element.remove()
    })
}

function refreshApp() {
    useReplacer()
}

function refreshTitle(elem) {
    elem.title = elem.value
}

function setStorageList() {
    $storageList.innerHTML = ''
    for(let key in localStorage) {
        if (!localStorage.hasOwnProperty(key) || key === 'lastone') {
            continue
        }
        let optionElement = document.createElement('option')
        optionElement.value = key
        $storageList.appendChild(optionElement)
    }
}

function addToLockalStorage() {
    let data = {
        fontSize: $app.querySelector('.editor-fz').value,
        fontFamily: $app.querySelector('.editor-ff').value,
        editorContent: $editorTextarea.value,
        builderContent: generateArray(),
    }
    let dataJSON = JSON.stringify(data)
    let storageName = $storageName.value.trim()
    if(!storageName) {
        storageName = 'untitled'
    }
    localStorage.setItem(storageName, dataJSON)
    localStorage.lastone = storageName
    setStorageList()
}

function getFromLockalStorage(getlastone) {
    let storageName = $storageName.value
    if(getlastone) {
        storageName = localStorage.lastone
    }
    if(storageName) {
        let data =  JSON.parse(localStorage[storageName])
        if(data.fontSize) {
            $app.querySelector('.editor-fz').value = data.fontSize
        }
        if(data.fontFamily) {
            $app.querySelector('.editor-ff').value = data.fontFamily
        }
        if(data.editorContent) {
            $editorTextarea.value = data.editorContent
        }
        clearBuilder()
        data.builderContent.forEach(function(item) {
            if(item[0] || item[1]) {
                $builder.querySelector('.builder-lastchild').insertAdjacentHTML('beforebegin', tplBuilderForm(item[0], item[1]))
            } 
        })
        refreshApp()
    }
}

function removeFromStorage() {
    let storageName = $storageName.value
    localStorage.removeItem(storageName)
    localStorage.lastone = ''
    $storageName.value = ''
}

function useReplacer() {
    $editorPreview.innerHTML = $editorTextarea.value
    $editorResult.innerHTML = replaser($editorTextarea.value) 
}

function setListeners() {
    $editorTextarea.addEventListener('cut', function(e) {
        useReplacer()
    })
    $editorTextarea.addEventListener('paste', function(e) {
        useReplacer()
    })
    $editorTextarea.addEventListener('keydown', function(e) {
        useReplacer()
    })
    $editorTextarea.addEventListener('keyup', function(e) {
        useReplacer()
    })
    $app.querySelector('.editor-fz').addEventListener('change', function(){
        setEditorFontSize()
    })
    $app.querySelector('.editor-ff').addEventListener('change', function(){
        $editorPreview.style.fontFamily = $app.querySelector('.editor-ff').value
        $editorResult.style.fontFamily = $app.querySelector('.editor-ff').value
    })
    $app.querySelector('.editor-checkbox').addEventListener('change', function() {
        if(this.checked) {
            $editorPreview.classList.add('d-none')
            $editorPreview.innerHTML = ''
            $editorTextarea.classList.remove('d-none')
        } else {
            $editorTextarea.classList.add('d-none')
            $editorPreview.innerHTML = $editorTextarea.value.replace(/\n/g, "<br/>")
            $editorPreview.classList.remove('d-none')
        }
    })
}

function setEditorFontSize() {
    let fontSize = $app.querySelector('.editor-fz').value + 'px'
    $editorPreview.style.fontSize = fontSize
    $editorResult.style.fontSize = fontSize
}

function generateArray() {
    let outputArray = []
    $app.querySelectorAll('.builder-pattern').forEach(function(item) {
        if(item.querySelector('.pattern').value){
            outputArray.push([
                item.querySelector('.pattern').value, 
                item.querySelector('.replacement').value
            ])
        }
    })
    return outputArray
}

function generateCode(type) {
    let replacesArray = JSON.stringify(generateArray())
    if(type === 1) {
        $code.innerHTML = `javascript:function foo(node){if(!['script','style','code','pre'].includes(node.nodeName.toLowerCase())){if(node.childNodes.length){for(let child of node.childNodes){foo(child)}}else{`+replacesArray+`.forEach(function(s){node.textContent=node.textContent.replace(new RegExp(s[0], "g"), s[1])})}}}foo(document.body);`
    } else {
        $code.innerHTML = replacesArray
    }
    $code.classList.remove('d-none')
}

function copyCode() {
    navigator.clipboard.writeText($code.innerText)
}

function copyTextContent(elem) {
    navigator.clipboard.writeText(elem.innerText)
}

function removeCode() {
    $code.classList.add('d-none')
    $code.innerHTML = ''
}

function setSymbolsSet() {
    let symbolsset = $app.querySelector('.symbols-set')
    let alias = [
    'ЛАТИНИЦА','латиница',
    'ЛАТИНИЦА ДОП.','латиница доп.',
    'ГРЕЧЕСКИЙ','греческий',
    'ГРЕЧЕСКИЙ ДОП.','греческий доп.',
    'КИРИЛИЦА','кириллица',
    'КИРИЛИЦА ДОП.','кириллица доп.',
    'АРМЯНСКИЙ','армянский',
    'Грузинский',
    '','',
    'Хирагана','Хирагана доп.',
    'Катакана','Катакана доп.',
    '','',
    '','',
    '','Глаголица',
]

    function setAlias(index) {
        if(alias[index]) {
            return alias[index]
        } else {
            return `Набор №${index}`
        }
    }

    symbolsUTF.forEach(function(item, i) {
        let setItem = document.createElement('div')
        setItem.classList.add('set-item')
        setItem.innerHTML = `
        <input type="checkbox" id="symbols-set-${i}">
        <label for="symbols-set-${i}">${setAlias(i)}</label>
        <span class="plus">+</span><span class="minus">-</span>
        <span class="symbols-list"></span>
        `
        item.split(' ').forEach(function(symbol) {
            setItem.querySelector('.symbols-list').innerHTML += `<button class="btn-symbol" onclick="copyTextContent(this)">${symbol}</button>`
        })
        symbolsset.append(setItem)
    })
}

function openModal(content = '') {
    document.body.classList.add('modal-on')
    document.querySelector('.modal-background').classList.remove('d-none')
    let modal = document.querySelector('.modal')
    modal.classList.remove('d-none')
    modal.querySelector('.modal-body').innerHTML = content
}

function closeModal() {
    let modals = document.querySelectorAll('.modal')
    modals.forEach(function(modal) {
        modal.classList.add('d-none')
    })
    document.querySelector('.modal-background').classList.add('d-none')
    document.body.classList.remove('modal-on')
}

function replaser(str) {
    
    function replaceChars(s){
        $builder.querySelectorAll('.builder-pattern').forEach(function(item) {
            if(item.querySelector('.pattern') && item.querySelector('.replacement')){
                let pattern = item.querySelector('.pattern').value
                let replacement = item.querySelector('.replacement').value
                s = s.replace(new RegExp(pattern, "g"), replacement)
            }
        })
        return s
    }

    function replaserInit(el){
        if(!['script'].includes(el.nodeName.toLowerCase())){
            if(el.childNodes.length){
                for(let child of el.childNodes){
                    replaserInit(child)
                }
            }else{
                el.textContent = replaceChars(el.textContent)
            }
        }
        return el
    }

    let elem = document.createElement('div')
    elem.innerHTML = str.replace(/\n/g, "<br/>")

    return replaserInit(elem).innerHTML
}

function start() {
    setListeners()
    setSymbolsSet()
    setEditorFontSize()
    $storageName.value = localStorage.lastone || ''
    getFromLockalStorage()
    $editorResult.innerHTML = $editorTextarea.value
    refreshApp()
    setStorageList()
}

start()
