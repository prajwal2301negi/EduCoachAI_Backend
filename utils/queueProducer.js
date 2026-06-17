const { getChannel, QUEUES } = require("../config/rabbitmq");

/**
 * Publishes a job onto a RabbitMQ queue. Used for things that shouldn't
 * block the HTTP response — e.g. queuing a "generate weekly report" job
 * after a quiz is completed, or an "AI explanation" generation job.
 *
 * Safe no-op if RabbitMQ isn't connected yet (e.g. local dev without it running),
 * so it never crashes the main request flow.
 */
const publishToQueue = async (queueName, payload) => {
  try {
    const channel = getChannel();
    if (!channel) {
      console.warn(`⚠️ RabbitMQ channel not available, skipping publish to ${queueName}`);
      return false;
    }
    const sent = channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
    return sent;
  } catch (error) {
    console.error(`❌ Failed to publish to queue ${queueName}: ${error.message}`);
    return false;
  }
};

module.exports = { publishToQueue, QUEUES };
