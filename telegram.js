const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

class Telegram {
  constructor (token, id) {
    this.token = token
    this.id = id
  }

  message (content, token = this.token, id = this.id) {
    return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: id,
        text: content
      })
    }).then(response => {
      if (response.headers.get('content-type').includes('application/json')) {
        return response.json()
      } else {
        return null
      }
    }).catch(error => {
      console.error(error)
    })
  }
}

module.exports = Telegram
