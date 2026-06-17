const asyncHandler = require("express-async-handler");
const User = require("../models/User");

/**
 * @desc    Update logged-in user's own profile
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "grade", "subjects"];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

/**
 * @desc    Parent links a student account to themselves via student's email
 * @route   POST /api/users/link-child
 * @access  Private (parent only)
 */
const linkChild = asyncHandler(async (req, res) => {
  const { studentEmail } = req.body;

  const student = await User.findOne({ email: studentEmail, role: "student" });
  if (!student) {
    res.status(404);
    throw new Error("No student found with this email");
  }

  if (student.parent) {
    res.status(400);
    throw new Error("This student is already linked to a parent");
  }

  student.parent = req.user._id;
  await student.save();

  req.user.children.push(student._id);
  await req.user.save();

  res.status(200).json({
    success: true,
    message: "Child linked successfully",
    data: student,
  });
});

/**
 * @desc    Get all children linked to the logged-in parent
 * @route   GET /api/users/my-children
 * @access  Private (parent only)
 */
const getMyChildren = asyncHandler(async (req, res) => {
  const parent = await User.findById(req.user._id).populate(
    "children",
    "name email grade subjects lastLogin"
  );

  res.status(200).json({
    success: true,
    data: parent.children,
  });
});

module.exports = { updateMyProfile, linkChild, getMyChildren };
