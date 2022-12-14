# Ticket Bot
A simple bot that can be used to create tickets in a Discord server.

### For self-hosting
##### 1. Clone the repository
```bash
$ git clone https://github.com/biaw/ticket-bot
```

##### 2. Install dependencies
```bash
$ npm install
```

##### 3. Rename `example.env` to `.env` and fill in the values
| Variable       | Description                       | Required |
| -------------- | --------------------------------- | -------- |
| `CLIENT_ID`    | Bot User ID                       | Yes      |
| `CLIENT_TOKEN` | Bot Token                         | Yes      |
| `DATABASE_URI` | MongoDB URI                       | Yes      |
| `OWNER_ID`     | Bot Owner ID                      | Yes      |
| `GUILD_ID`     | Server ID to register commands to | No       |

All values are required.

##### 4. Build and start the bot
```bash
$ npm run build && npm start
```