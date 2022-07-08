import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { create } from 'venom-bot';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const chromiumArgs = [
    '--disable-web-security', '--no-sandbox', '--disable-web-security',
    '--aggressive-cache-discard', '--disable-cache', '--disable-application-cache',
    '--disable-offline-load-stale-cache', '--disk-cache-size=0',
    '--disable-background-networking', '--disable-default-apps', '--disable-extensions',
    '--disable-sync', '--disable-translate', '--hide-scrollbars', '--metrics-recording-only',
    '--mute-audio', '--no-first-run', '--safebrowsing-disable-auto-update',
    '--ignore-certificate-errors', '--ignore-ssl-errors', '--ignore-certificate-errors-spki-list'
  ];

create({
    session: 'alexa',
    browserArgs: chromiumArgs,
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
});

app.get('/', (req, res) => {
    return res.send('Hello World!');
});

const start = async (client) => {
    app.post('/sendMessage', async (req, res) => {
        const { message, from } = req.body;
        console.log(message, from);

        if(!message || !from) {
            return res.status(400).json({
                error: 'Missing parameters'
            });
        }

        const contacts = await client.getAllContacts();
        const contact = contacts.filter((contact) => contact.name === from);

        if (contact.length === 0) {
            return res.status(400).json({ error: 'Contact not found' });
        }

        try {
            await client.sendText(contact[0].id._serialized, message);
            return res.status(200).json({message: 'Message sent'});
        } catch (error) {
            return res.status(500).json({message: 'Error sending message'});
        }
    });
    
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
}
