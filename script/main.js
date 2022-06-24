// HTML ELEMENTS
const messagesContainer = document.querySelector('ul.messages-container')
const asideBtn = document.querySelector('header ion-icon')
const aside = document.querySelector('aside')
const overlay = document.querySelector('.overlay')
const sendBtn = document.querySelector('form ion-icon')
const textArea = document.querySelector('form textarea')


// VARIABLES
let username
let messages
const url = {
    messages: "https://mock-api.driven.com.br/api/v6/uol/messages",
    participants: "https://mock-api.driven.com.br/api/v6/uol/participants",
    status: "https://mock-api.driven.com.br/api/v6/uol/status"
}


// FUNCTIONS
function login(){
    username = 'prompt("Qual seu nome?")'
    const promise = axios.post(url.participants, {name: username})
    
    promise
        .then(() => setConnection())
        .catch(login)
}


function setConnection(){
    setInterval(() => {
        axios.post(url.status, {name: username})
    }, 5000)
}


async function getParticipants(){
    const response = await axios.get(url.participants)
    return response.data
}


function setParticipants(participants){
    const liContainer = aside.querySelector('.participants')

    liContainer.innerHTML = `
        <li class="selected" data-identifier="participant">
            <ion-icon name="people"></ion-icon>
            <span>Todos</span>
            <ion-icon name="checkmark-outline"></ion-icon>
        </li>`

    participants.forEach(participant => {
        liContainer.innerHTML += `
            <li data-identifier="participant">
                <ion-icon name="person-circle"></ion-icon>
                <span>${participant.name}</span>
                <ion-icon name="checkmark-outline"></ion-icon>
            </li>`
    })

    setParticipantsEvent()
}


function setParticipantsEvent(){
    const allParticipants = document.querySelectorAll('aside .participants li')

    allParticipants.forEach(participant => {
        participant.addEventListener('click', () => {
            const selected = document.querySelector('aside .participants .selected')

            if (selected !== participant) {
                selected.classList.remove('selected')
                participant.classList.add('selected')
            }
        })
    })
}


function setMessageTypeEvent(){
    const messageTypes = document.querySelectorAll('aside .message-type li')

    messageTypes.forEach(type => {
        type.addEventListener('click', () => {
            const selected = document.querySelector('aside .message-type .selected')

            if (selected !== type) {
                selected.classList.remove('selected')
                type.classList.add('selected')
            }
        })
    })
}


async function updateParticipants(){
    const participants = await getParticipants()
    setParticipants(participants)
}


async function getMessages(){
    const response = await axios.get(url.messages)
    messages = response.data
    // console.log(response)
    return response.data
}


function postMessage(text){
    const from = username
    const to = 'Todos'
    const type = 'message'

    axios.post(url.messages, {from, to, text, type})
        .then(updateMessages)
        .catch(() => window.location.reload())
}


function setMessages(messages){
    messages.forEach(message => {
        const from = message.from
        const to = message.to
        const text = message.text
        const time = message.time
        const type = message.type


        if (type === 'status'){
            messagesContainer.innerHTML += `
            <li class="${type}">
                <span><span class="time">(${time})</span> <strong>${from}</strong> ${text}</span>
            </li>
            `
        
        } else if (type === 'private_message'){
            if (to === username){
                messagesContainer.innerHTML += `
                <li class="${type}">
                    <span><span class="time">(${time})</span> <strong>${capitalize(from)}</strong> reservadamente para <strong>${capitalize(to)}</strong>: ${text}</span>
                </li>
                `
            
            } else {console.log(message)}
        
        } else {
            messagesContainer.innerHTML += `
            <li class="${type}">
                <span><span class="time">(${time})</span> <strong>${capitalize(from)}</strong> para <strong>${capitalize(to)}</strong>: ${text}</span>
            </li>
            `
        }
    })
}

async function updateMessages(){
    const messages = await getMessages()
    setMessages(messages)
    scrollToLast()
}


function scrollToLast(){
    const lastMessage = messagesContainer.querySelector('li:last-child')
    lastMessage.scrollIntoView()
}


function capitalize(str){
    let words = str.split(' ')
    let capitalizedStr = ''

    for (let i = 0; i < words.length; i++){
        if (words[i].length > 0){
            capitalizedStr += words[i][0].toUpperCase() + words[i].slice(1) 
        }

        if (words[i] !== words[words.length - 1] && words[i + 1] !== '') {
            capitalizedStr += ' '
        }
    }

    return capitalizedStr
}

// EVENTS
asideBtn.addEventListener('click', () => {
    aside.classList.remove('hidden')
    overlay.classList.remove('hidden')
})

overlay.addEventListener('click', () => {
    aside.classList.add('hidden')
    overlay.classList.add('hidden')
})

sendBtn.addEventListener('click', () => {
    postMessage(textArea.value)
    textArea.value = ""
})

textArea.addEventListener('keyup', (e) => {
    const enterPressed = e.keyCode === 13
    if (enterPressed){
        postMessage(textArea.value)
        textArea.value = ""
    }
})


// Init

// login()
updateMessages()
// setInterval(updateMessages, 3000)
updateParticipants()
// setInterval(updateParticipants, 10000)
setMessageTypeEvent()