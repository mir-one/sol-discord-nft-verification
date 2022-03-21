# Аутентификация с помощью NFT на Discord сервере

Простое приложение для проверки NFT из сети Solana на сервере Discord. Он состоит из двух частей, которые представляют собой приложение React Web3 и Discord, написанные с помощью DiscordJS. React можно использовать отдельно без discord бота, если необходимо.

## Moralis
Это приложение создано с использованием Morals и SOLANA API для аутентификации, получения NFT пользователя и загрузки метаданных NFT для выполнения проверки. Вам нужно зарегистрироваться в Moralis, настроить сервер и получить свой "Идентификатор приложения" и "URL сервера", которые можно сделать бесплатно. [Инструкция здесь](https://docs.moralis.io/moralis-server/getting-started/create-a-moralis-server).

## Discord бот
Вам нужно создать приложение discord с портала разработчиков discord, пригласить своего бота на свой сервер и получить секретный токен бота. [Как получить токен](https://techbriefly.com/2021/12/30/how-to-get-a-discord-bot-token/).

# НАчало

Сначала установите зависимости
```javascript
npm run install-all
```
затем запустите приложение
```javascript
npm run dev
```
или запустите Discord бота и интерфейса отдельно
```javascript
npm start
```
Затем выполните команду из discord, чтобы открыть для пользователей проверкe NFT
```
!verifyNFT
```

Конфигурация

## React Web3 App
### .env
Измените название `.env.example` файла `.env` и заполните поля.
```
REACT_APP_MORALIS_APP_ID=<Moraliss APP_ID>
REACT_APP_MORALIS_SERVER_URL=<Moralis Server URL>
```
### config.json
```javascript
{
    "updateAuthority": "<updateAuthority of the nft to be verified>",
    "network" : "<mainnet or devnet>"
    "discordURL": <URL of discord server> (eg. http://localhost:9090/)
}
``` 


## Discord
Измените название `.env.example` файла `.env` и заполните поля.
```
TOKEN=<Bot TOKEN>
APP_URL=<URL of React App> (eg. http://localhost:3000/)
CHANNEL_NAME=<Название Discord канала, на котором будут верифицироваться владельцы NFT>
```
# Внимание
В настоящее время приложение использует только один центр обновления, чтобы проверить, принадлежит ли NFT к определенной коллекции. Однако некоторые коллекции могут иметь более одного updateAuthority. Поэтому, чтобы иметь возможность использовать это приложение в рабочей среде, если для вашей коллекции требуется более одного updateAuthority, у вас есть следующие опции:

1) Вы можете изменить несколько строк кодов, чтобы загрузить более одного центра обновлений.
2) Если у вас есть идентификатор candyMachineID коллекции, вы можете использовать [Solana-Web3.js Library](https://docs.solana.com/developing/clients/javascript-api) чтобы получить все NFT из определенной коллекции с помощью candyMachineID. [Это пожет помочь](https://stackoverflow.com/questions/70597753/how-to-find-all-nfts-minted-from-a-v2-candy-machine/70601874#70601874).
