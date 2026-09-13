import ampqlib from 'amqplib';

const QUEUE = 'auth_notification_queue';

const connection = await ampqlib.connect(process.env.RABBITMQ_URL);


const channel = await connection.createChannel();

channel.assertQueue(QUEUE, {durable: true});


export default channel;