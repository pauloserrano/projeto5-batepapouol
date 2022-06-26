// HTML ELEMENTS
const loginInput = document.querySelector('.login input')
const loginBtn = document.querySelector('.login button')
const messagesContainer = document.querySelector('ul.messages-container')
const asideBtn = document.querySelector('header ion-icon')
const aside = document.querySelector('aside')
const overlay = document.querySelector('.overlay')
const sendBtn = document.querySelector('form ion-icon')
const textArea = document.querySelector('form textarea')
const messageRecipient = document.querySelector('.message-recipient')


// VARIABLES
let username
let selectedRecipient = 'Todos'
let messages = []
const url = {
    messages: "https://mock-api.driven.com.br/api/v6/uol/messages",
    participants: "https://mock-api.driven.com.br/api/v6/uol/participants",
    status: "https://mock-api.driven.com.br/api/v6/uol/status"
}


// FUNCTIONS
function login(user){
    const promise = axios.post(url.participants, {name: user})
    
    promise
        .then(() => {
            username = user
            setLoadingScreen()
            setConnection()
            /* INIT */
            updateMessages()
            setInterval(updateMessages, 3000)

            updateParticipants()
            setInterval(updateParticipants, 10000)

            // Público ou Reservado
            setMessageTypeEvent()
        })
        .catch(() => {
            alert('Usuário já logado ou inválido. \nTente novamente.')
        })
}


function setLoadingScreen() {
    const loginScreen = document.querySelector('.login-screen')
    const login = loginScreen.querySelector('.login')
    const loading = loginScreen.querySelector('.loading')

    login.classList.add('hidden')
    loading.classList.remove('hidden')
    
    setInterval(() => loginScreen.remove(), 2000)
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
    const isEmpty = !(liContainer.childNodes.length > 0)
    
    if (isEmpty){
        liContainer.innerHTML = `
            <li class="selected" data-identifier="participant">
                <ion-icon name="people"></ion-icon>
                <span>Todos</span>
                <ion-icon name="checkmark-outline"></ion-icon>
            </li>
            `
    
        participants.forEach(participant => {
            liContainer.innerHTML += `
                <li data-identifier="participant">
                    <ion-icon name="person-circle"></ion-icon>
                    <span>${capitalize(participant.name)}</span>
                    <ion-icon name="checkmark-outline"></ion-icon>
                </li>
                `
        })
        
    } else {
        let selected = liContainer.querySelector('.selected span').innerHTML

        liContainer.innerHTML = `
            <li data-identifier="participant">
                <ion-icon name="people"></ion-icon>
                <span>Todos</span>
                <ion-icon name="checkmark-outline"></ion-icon>
            </li>
            `

        participants.forEach(participant => {
            const isOnline = capitalize(participant.name) === selected

            if (isOnline){
                liContainer.innerHTML += `
                    <li class="selected" data-identifier="participant">
                        <ion-icon name="person-circle"></ion-icon>
                        <span>${capitalize(participant.name)}</span>
                        <ion-icon name="checkmark-outline"></ion-icon>
                    </li>
                    `
            
            } else {
                liContainer.innerHTML += `
                    <li data-identifier="participant">
                        <ion-icon name="person-circle"></ion-icon>
                        <span>${capitalize(participant.name)}</span>
                        <ion-icon name="checkmark-outline"></ion-icon>
                    </li>
                    `
            }
        })

        const isSelected = liContainer.querySelector('.selected')

        if (!isSelected){
            const todos = liContainer.querySelector('li')
            todos.classList.add('selected')
        }
    }

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
                setMessageRecipient()
            }
        })
    })
}


async function updateParticipants(){
    const participants = await getParticipants()
    setParticipants(participants)
    setMessageRecipient()
}


function setMessageTypeEvent(){
    const messageTypes = document.querySelectorAll('aside .message-type li')

    messageTypes.forEach(type => {
        type.addEventListener('click', () => {
            const selected = document.querySelector('aside .message-type .selected')

            if (selected !== type) {
                selected.classList.remove('selected')
                type.classList.add('selected')
                setMessageRecipient()
            }
        })
    })
}


async function getMessages(){
    const response = await axios.get(url.messages)

    return response.data
}


function postMessage(text){
    const from = username
    const to = getMessageRecipient()
    const type = getMessageType()

    axios.post(url.messages, {from, to, text, type})
        .then(updateMessages)
        .catch(() => window.location.reload())
}


function getMessageRecipient(){
    return aside.querySelector('aside .participants .selected span').innerHTML
}

function setMessageRecipient(){
    const recipient = document.querySelector('aside .participants .selected span').innerHTML
    const type = document.querySelector('aside .message-type .selected span').innerHTML

    messageRecipient.innerHTML = `Enviando para ${capitalize(recipient)} (${type.toLowerCase()})`
}


function getMessageType(){
    const selectedType = aside.querySelector('aside .message-type .selected span').innerHTML
    
    if (selectedType === 'Público'){
        return 'message'
    
    } else if (selectedType === 'Reservadamente'){
        return 'private_message'
    }
}


function setMessages(messages){
    messages.forEach(message => {
        if (message.type === 'status'){
            messagesContainer.innerHTML += `
            <li class="${message.type}">
                <span><span class="time">(${message.time})</span> <strong>${capitalize(message.from)}</strong> ${message.text}</span>
            </li>
            `
        
        } else if (message.type === 'private_message'){
            if (message.to === username || message.from === username){
                messagesContainer.innerHTML += `
                <li class="${message.type}">
                    <span><span class="time">(${message.time})</span> <strong>${capitalize(message.from)}</strong> reservadamente para <strong>${capitalize(message.to)}</strong>: ${message.text}</span>
                </li>
                `
            
            } else {console.log(message)}
        
        } else {
            messagesContainer.innerHTML += `
            <li class="${message.type}">
                <span><span class="time">(${message.time})</span> <strong>${capitalize(message.from)}</strong> para <strong>${capitalize(message.to)}</strong>: ${message.text}</span>
            </li>
            `
        }
    })
}

async function updateMessages(){
    const apiMessages = await getMessages()

    if (messages.length === 0){
        messages = apiMessages
        setMessages(messages)
    
    } else if (newMessage(apiMessages)){
        const newMessageIndex = apiMessages.findIndex(message => message[message.length - 1])
        const newMessages = apiMessages.slice(newMessageIndex)
        
        newMessages.forEach(message => {
            messages.push(message)
        })
        
        setMessages(newMessages)
    }

    scrollToLastMessage()
}


function newMessage(apiMessages){
    const apiMsg = apiMessages[apiMessages.length - 1]
    const localMsg = messages[messages.length - 1]

    const sameMsg = (
        apiMsg.from === localMsg.from && 
        apiMsg.text === localMsg.text &&
        apiMsg.time === localMsg.time &&
        apiMsg.to === localMsg.to &&
        apiMsg.type === localMsg.type
    )

    return !sameMsg
}


function scrollToLastMessage(){
    const lastMessage = messagesContainer.querySelector('li:last-child')
    
    if (lastMessage) lastMessage.scrollIntoView()
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
loginBtn.addEventListener('click', () => {
    const username = document.querySelector('.login input').value
    login(username)
})

loginInput.addEventListener('keyup', (e) => {
    const enterPressed = e.keyCode === 13
    if (enterPressed){
        const username = document.querySelector('.login input').value
        login(username)
    }
})

asideBtn.addEventListener('click', () => {
    aside.classList.remove('hidden')
    overlay.classList.remove('hidden')
})

overlay.addEventListener('click', () => {
    aside.classList.add('hidden')
    overlay.classList.add('hidden')
})

sendBtn.addEventListener('click', () => {
    if (textArea.value !== ''){
        postMessage(textArea.value)
        textArea.value = ''
    }
})

textArea.addEventListener('keyup', (e) => {
    const enterPressed = e.keyCode === 13
    if (enterPressed && textArea.value !== ''){
        postMessage(textArea.value)
        textArea.value = ""
    }
})
