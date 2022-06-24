// HTML ELEMENTS
const messagesContainer = document.querySelector('ul.messages-container')
const asideBtn = document.querySelector('header ion-icon')
const aside = document.querySelector('aside')
const overlay = document.querySelector('.overlay')
const sendBtn = document.querySelector('form ion-icon')
const textArea = document.querySelector('form textarea')


// VARIABLES
let username
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
        // console.log(username)
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
        <li class="selected">
            <ion-icon name="people"></ion-icon>
            <span>Todos</span>
            <ion-icon name="checkmark-outline"></ion-icon>
        </li>`
    participants.forEach(participant => {
        liContainer.innerHTML += `
            <li>
                <ion-icon name="person-circle"></ion-icon>
                <span>${participant.name}</span>
                <ion-icon name="checkmark-outline"></ion-icon>
            </li>`
    })
}


async function updateParticipants(){
    const participants = await getParticipants()
    setParticipants(participants)
}


async function getMessages(){
    const response = await axios.get(url.messages)
    // console.log(response)
    return response.data
}


function postMessage(text){
    const from = username
    const to = 'Todos'
    const type = 'message'

    axios.post(url.messages, {from, to, text, type})
}


function setMessages(messages){
    messages.forEach(message => {
        const from = capitalize(message.from)
        const to = capitalize(message.to)
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
            messagesContainer.innerHTML += `
            <li class="${type}">
                <span><span class="time">(${time})</span> <strong>${from}</strong> reservadamente para <strong>${to}</strong>: ${text}</span>
            </li>
        `
        
        } else {
            messagesContainer.innerHTML += `
            <li class="${type}">
                <span><span class="time">(${time})</span> <strong>${from}</strong> para <strong>${to}</strong>: ${text}</span>
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

// login()
updateMessages()
// setInterval(updateMessages, 3000)
updateParticipants()
setInterval(updateParticipants, 3000)
axios.get(url.participants).then(res => console.log(res))

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