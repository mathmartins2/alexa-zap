const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "alexa" })
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    app.get('/sendMessage', async (req, res) => {
        try {
            const {from, message} = req.body;

            if(!from || !message) {
                return res.status(400).send('Missing parameters');
            }
        
            let contacts = await client.getContacts();
            contacts = contacts.filter((contact) => contact.name === from && contact.isUser === true);

            if(contacts.length === 0) {
                return res.status(400).json({ error: 'Contact not found' });
            }
    
            await client.sendMessage(contacts[0].id._serialized, message);

            return res.status(200).json({
                message: 'Message sent'
            });
            
        } catch (error) {
            return res.status(400).json({
                error
            });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

client.initialize();

