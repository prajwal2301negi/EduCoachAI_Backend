const cron = require("node-cron");
const User = require("../models/User");
const { publishToQueue, QUEUES } = require("../utils/queueProducer");

/**
 * Runs every Sunday at 6:00 AM server time. Enqueues one RabbitMQ job per
 * active student — the actual report generation happens in the consumer
 * (queues/weeklyReportConsumer.js), kept separate so report generation
 * doesn't block this scheduling tick if Groq is slow.
 */
const startWeeklyReportScheduler = () => {
  // Cron expression: "0 6 * * 0" = 06:00 every Sunday
  cron.schedule("0 6 * * 0", async () => {
    console.log("⏰ Weekly report scheduler triggered");
    try {
      const students = await User.find({ role: "student", isActive: true }).select("_id");
      for (const student of students) {
        await publishToQueue(QUEUES.WEEKLY_REPORT, { studentId: student._id });
      }
      console.log(`📤 Enqueued weekly report jobs for ${students.length} students`);
    } catch (error) {
      console.error("❌ Weekly report scheduler failed:", error.message);
    }
  });

  console.log("🗓️  Weekly report scheduler registered (runs Sundays at 6:00 AM)");
};

module.exports = { startWeeklyReportScheduler };