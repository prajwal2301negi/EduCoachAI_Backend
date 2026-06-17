const { getChannel, QUEUES } = require("../config/rabbitmq");
const { generateWeeklyReportForStudent } = require("../utils/reportGenerator");

/**
 * Consumer for the weekly report queue. Each message is { studentId }.
 * Jobs are enqueued by the node-cron schedule in cron/weeklyReportScheduler.js
 * (one job per active student, every Sunday) — not per-quiz-submission, to
 * avoid generating a redundant report on every single quiz a student takes.
 *
 * Call startWeeklyReportConsumer() once after RabbitMQ connects (see server.js).
 */
const startWeeklyReportConsumer = () => {
  const channel = getChannel();
  if (!channel) {
    console.warn("⚠️ Cannot start weekly report consumer, RabbitMQ channel not ready");
    return;
  }

  channel.consume(QUEUES.WEEKLY_REPORT, async (msg) => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      console.log("📩 Generating weekly report for student:", data.studentId);
      await generateWeeklyReportForStudent(data.studentId);
      channel.ack(msg);
    } catch (error) {
      console.error("❌ Error processing weekly report job:", error.message);
      channel.nack(msg, false, false); // discard malformed/failed message
    }
  });

  console.log("👷 Weekly report consumer started");
};

module.exports = { startWeeklyReportConsumer };