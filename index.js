require('dotenv').config()

const fs = require('fs')
const ikea = require('ikea-availability-checker')
const schedule = require('node-schedule')
const Telegram = require('./telegram')

const CACHE_FILE = '.cache'

const telegram = new Telegram(
  process.env.TELEGRAM_BOT_TOKEN,
  process.env.TELEGRAM_CHAT_ID
)

const interval = process.env.INTERVAL_MINUTES || 5
const stores = process.env.IKEA_STORES.split(',')
const products = process.env.IKEA_PRODUCTS.split(',')

let cache
try {
  cache = JSON.parse(fs.readFileSync(CACHE_FILE))
} catch (error) {
  console.error(error)
  cache = {}
}

schedule.scheduleJob(`*/${interval} * * * *`, async date => {
  console.info(`[${date}] ${JSON.stringify(cache)}`)

  for (const product of products) {
    for (const store of stores) {
      const key = `${product}_${store}`

      ikea.availability(store, product)
        .then(result => {
          const status = `${result.probability} (${result.stock})`

          if (cache[key] !== status) {
            // Save status
            cache[key] = status

            // Write to file
            try {
              fs.writeFileSync(CACHE_FILE, JSON.stringify(cache))
            } catch (error) {
              console.error(error)
            }

            // Send message
            telegram.message(`${status} @ ${result.store.name}: https://www.ikea.com/us/en/search/products/?q=${product}`)
          }
        })
        .catch(error => {
          console.error(error)
        })
    }
  }
})
