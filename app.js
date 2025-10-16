// Simple flashcards app with deck support and localStorage persistence
const LS_KEY = 'flashcards.v1.decks'
let decks = {} // { deckId: {id,title,cards:[] } }
let deckOrder = []
let activeDeckId = null
let index = 0
let editingId = null

// Elements
const questionEl = document.getElementById('question')
const answerEl = document.getElementById('answer')
const cardEl = document.getElementById('card')
const showBtn = document.getElementById('showBtn')
const nextBtn = document.getElementById('nextBtn')
const prevBtn = document.getElementById('prevBtn')
const addCardBtn = document.getElementById('addCardBtn')
const editor = document.getElementById('editor')
const qInput = document.getElementById('qInput')
const aInput = document.getElementById('aInput')
const saveBtn = document.getElementById('saveBtn')
const cancelBtn = document.getElementById('cancelBtn')
const deleteBtn = document.getElementById('deleteBtn')
const editorTitle = document.getElementById('editorTitle')
const cardList = document.getElementById('cardList')
const importBtn = document.getElementById('importBtn')
const exportBtn = document.getElementById('exportBtn')
const deckSelect = document.getElementById('deckSelect')
const newDeckBtn = document.getElementById('newDeckBtn')
const delDeckBtn = document.getElementById('delDeckBtn')

function load(){
  try{
    const raw = localStorage.getItem(LS_KEY)
    if(raw){
      const parsed = JSON.parse(raw)
      decks = parsed.decks || {}
      deckOrder = parsed.order || Object.keys(decks)
      activeDeckId = parsed.active || deckOrder[0] || null
    }
  }catch(e){decks={}; deckOrder=[]; activeDeckId=null}

  // if no decks, create a sample deck
  if(!activeDeckId){
    const d = {id: genId(), title: 'Default', cards: [
      {id: genId(), q: 'What is the capital of France?', a: 'Paris'},
      {id: genId(), q: 'What does HTML stand for?', a: 'HyperText Markup Language'}
    ]}
    decks[d.id] = d
    deckOrder = [d.id]
    activeDeckId = d.id
    save()
  }
}

function save(){
  const payload = {decks, order: deckOrder, active: activeDeckId}
  localStorage.setItem(LS_KEY, JSON.stringify(payload))
}

function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}

function getActiveDeck(){
  return decks[activeDeckId] || {cards: [], title: 'Unknown'}
}

function render(){
  const deck = getActiveDeck()
  if(!deck || !deck.cards || deck.cards.length===0){
    questionEl.textContent = 'No cards yet. Add one!'
    answerEl.textContent = ''
    answerEl.classList.add('hidden')
    refreshList()
    refreshDeckSelect()
    return
  }
  index = Math.max(0, Math.min(index, deck.cards.length-1))
  const c = deck.cards[index]
  questionEl.textContent = c.q
  answerEl.textContent = c.a
  answerEl.classList.add('hidden')
  refreshList()
  refreshDeckSelect()
}

function refreshList(){
  cardList.innerHTML = ''
  const deck = getActiveDeck()
  deck.cards.forEach((c,i)=>{
    const d = document.createElement('div')
    d.className='mini'
    d.textContent = (i+1)+'. '+(c.q.length>40?c.q.slice(0,40)+'...':c.q)
    if(i===index) d.style.borderColor = '#2563eb'
    d.addEventListener('click',()=>{index=i;render()})
    const editBtn = document.createElement('button')
    editBtn.textContent='✎'
    editBtn.style.marginLeft='8px'
    editBtn.addEventListener('click',(ev)=>{ev.stopPropagation();openEditor(c.id)})
    d.appendChild(editBtn)
    cardList.appendChild(d)
  })
}

function showAnswer(){
  if(cards.length===0) return
  answerEl.classList.toggle('hidden')
}

function next(){
  if(cards.length===0) return
  index = (index+1) % cards.length
  render()
}
function prev(){
  if(cards.length===0) return
  index = (index-1+cards.length) % cards.length
  render()
}

function openEditor(id){
  editor.classList.remove('hidden')
  if(id){
    editingId = id
    const c = cards.find(x=>x.id===id)
    editorTitle.textContent = 'Edit Card'
    qInput.value = c.q
    aInput.value = c.a
    deleteBtn.classList.remove('hidden')
  }else{
    editingId = null
    editorTitle.textContent = 'Add Card'
    qInput.value = ''
    aInput.value = ''
    deleteBtn.classList.add('hidden')
  }
  qInput.focus()
}

function closeEditor(){
  editor.classList.add('hidden')
  editingId = null
}

function saveCard(){
  const q = qInput.value.trim()
  const a = aInput.value.trim()
  if(!q){alert('Question is required'); qInput.focus(); return}
  const deck = getActiveDeck()
  if(editingId){
    const i = deck.cards.findIndex(x=>x.id===editingId)
    if(i>=0){deck.cards[i].q = q; deck.cards[i].a = a}
  }else{
    deck.cards.push({id: genId(), q, a})
    index = deck.cards.length-1
  }
  decks[deck.id] = deck
  save()
  closeEditor()
  render()
}

function deleteCard(){
  if(!editingId) return
  const ok = confirm('Delete this card?')
  if(!ok) return
  const deck = getActiveDeck()
  deck.cards = deck.cards.filter(x=>x.id!==editingId)
  decks[deck.id] = deck
  index = Math.max(0, Math.min(index, deck.cards.length-1))
  save()
  closeEditor()
  render()
}

function exportJson(){
  const deck = getActiveDeck()
  const blob = new Blob([JSON.stringify(deck.cards,null,2)],{type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = (deck.title||'flashcards') + '.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function importJson(){
  const input = document.createElement('input')
  input.type='file'
  input.accept='application/json'
  input.addEventListener('change',()=>{
    const f = input.files[0]
    if(!f) return
    const reader = new FileReader()
    reader.onload = ()=>{
      try{
        const parsed = JSON.parse(reader.result)
        if(Array.isArray(parsed)){
          // simple validation
          parsed.forEach(p=>{ if(!p.id) p.id = genId() })
          const deck = getActiveDeck()
          deck.cards = deck.cards.concat(parsed)
          decks[deck.id] = deck
          index = 0
          save()
          render()
        }else alert('Invalid format')
      }catch(e){alert('Could not parse file')}
    }
    reader.readAsText(f)
  })
  input.click()
}

function refreshDeckSelect(){
  deckSelect.innerHTML = ''
  deckOrder.forEach(id=>{
    const opt = document.createElement('option')
    opt.value = id
    opt.textContent = decks[id] ? decks[id].title : 'Untitled'
    deckSelect.appendChild(opt)
  })
  if(activeDeckId) deckSelect.value = activeDeckId
}

function createDeck(){
  const name = prompt('Deck name') || 'Untitled'
  const d = {id: genId(), title: name, cards: []}
  decks[d.id] = d
  deckOrder.push(d.id)
  activeDeckId = d.id
  save()
  render()
}

function deleteDeck(){
  if(!activeDeckId) return
  const ok = confirm('Delete current deck and all its cards?')
  if(!ok) return
  delete decks[activeDeckId]
  deckOrder = deckOrder.filter(x=>x!==activeDeckId)
  activeDeckId = deckOrder[0] || null
  save()
  render()
}

function switchDeck(id){
  if(!decks[id]) return
  activeDeckId = id
  index = 0
  save()
  render()
}

// events
showBtn.addEventListener('click',showAnswer)
nextBtn.addEventListener('click',next)
prevBtn.addEventListener('click',prev)
addCardBtn.addEventListener('click',()=>openEditor(null))
saveBtn.addEventListener('click',saveCard)
cancelBtn.addEventListener('click',closeEditor)
deleteBtn.addEventListener('click',deleteCard)
exportBtn.addEventListener('click',exportJson)
importBtn.addEventListener('click',importJson)
newDeckBtn.addEventListener('click',createDeck)
delDeckBtn.addEventListener('click',deleteDeck)
deckSelect.addEventListener('change',(e)=>{switchDeck(e.target.value)})

// init
load()
render()
// ensure deck select listeners initialized
refreshDeckSelect()

// keyboard shortcuts
document.addEventListener('keydown',(e)=>{
  if(e.key==='ArrowRight') next()
  if(e.key==='ArrowLeft') prev()
  if(e.key===' ') { e.preventDefault(); showAnswer() }
})
