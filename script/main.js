const url = "https://mock-api.driven.com.br/api/v6/uol/messages"
const messagesContainer = document.querySelector('main.messages-container')
const messages = [
    {
        from: "felipe",
        text: "entra na sala...",
        time: "01:58:22",
        to: "Todos",
        type: "status"
    },
    {
        from: "felipe",
        text: "entra na sala...",
        time: "01:58:22",
        to: "Todos",
        type: "message"
    },
    {
        from: "felipe",
        text: "entra na sala...",
        time: "01:58:22",
        to: "Todos",
        type: "private_message"
    }

]


async function getMessages(){
    const response = await axios.get(url)
    console.log(response.data)
    return response.data
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
            <div class="${type}">
                <span><span class="time">(${time})</span> <strong>${from}</strong> ${text}</span>
            </div>
        `
        
        } else if (type === 'private_message'){
            messagesContainer.innerHTML += `
            <div class="${type}">
                <span><span class="time">(${time})</span> <strong>${from}</strong> reservadamente para <strong>${to}</strong>: ${text}</span>
            </div>
        `
        
        } else {
            messagesContainer.innerHTML += `
            <div class="${type}">
                <span><span class="time">(${time})</span> <strong>${from}</strong> para <strong>${to}</strong>: ${text}</span>
            </div>
        `
        }
    })
}


async function updateMessages(){
    const messages = await getMessages()
    setMessages(messages)
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

updateMessages()