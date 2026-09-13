import express from 'express';
import morgan from 'morgan';
import sendEmail from './email.js';
import channel from './mq.js';

const app = express();

app.use(morgan('dev'));

app.get('/api/notification/healthz', (req, res) => {
    res.status(200).json({
        status: "OK"
    });
});

app.get('/api/notification/readyz', (req, res) => {
    res.status(200).json({
        status: "Ready"
    });
});

channel.consume('auth_notification_queue', async (msg) => {
    if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log(`Received message from Queue: `, messageContent);

        try {
            const {userId, timestamp, email} = JSON.parse(messageContent);

            const subject = 'New Login Notification'
            const text = `A new login was detected for your account at ${timestamp}. If this was not you, please secure your account immediately.`
            const html = `<p>A new login was detected for your account at <strong>${timestamp}</strong>. If this was not you, please secure your account immediately.</p>`

            await sendEmail(email, subject, text, html);
            channel.ack(msg);
        } catch (error) {
            console.error('Error processing message: ', error)
        }
    }
});

export default app;