const amqp = require("amqplib");

/**
 * RabbitMQ connection used for async jobs — e.g. generating weekly progress
 * reports for parents, sending notifications, processing AI requests in background.
 * Kept minimal for now: a single connection + channel, exported for queue producers/consumers.
 */
let connection = null;
let channel = null;

const QUEUES = {
  WEEKLY_REPORT: "weekly_report_queue",
  AI_EXPLANATION: "ai_explanation_queue",
};

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost:5672");
    channel = await connection.createChannel();

    // Pre-declare known queues so producers/consumers don't need to repeat this
    for (const queueName of Object.values(QUEUES)) {
      await channel.assertQueue(queueName, { durable: true });
    }

    console.log("✅ RabbitMQ Connected");

    connection.on("error", (err) => {
      console.error(`❌ RabbitMQ Connection Error: ${err.message}`);
    });

    connection.on("close", () => {
      console.warn("⚠️ RabbitMQ connection closed");
    });

    return channel;
  } catch (error) {
    console.error(`❌ RabbitMQ Connection Failed: ${error.message}`);
    // Non-fatal: app can still run without queueing in early development
  }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel, QUEUES };
