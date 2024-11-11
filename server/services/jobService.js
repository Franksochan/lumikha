const User = require('../models/user')
const Job = require('../models/job')
const logger = require('../logger/logger')
const validator = require('validator')
const { isAfter } = require('date-fns') // For date validation

class JobService {

  async createJob(title, description, skillsRequired, deadline, maxApplicants, type, userId) {
    // Ensure required fields are provided and valid
    const requiredParams = { title, description, skillsRequired, deadline, maxApplicants, userId }
    if (Object.values(requiredParams).some(param => param === undefined || param === null)) {
      throw { status: 400, message: "Missing required fields: title, description, skillsRequired, deadline, and userId are required." }
    }

    // Validate and sanitize each input using validator functions

    // Check title - validate length and sanitize
    if (!validator.isLength(title, { min: 5, max: 100 }) || typeof title !== 'string') {
      throw { status: 400, message: "Title must be a string between 5 and 100 characters." }
    }
    title = validator.escape(title)  // Sanitize title to prevent special character injection

    // Check description - validate length and sanitize
    if (!validator.isLength(description, { min: 10 }) || typeof description !== 'string') {
      throw { status: 400, message: "Description must be a string with at least 10 characters." }
    }
    description = validator.escape(description)

    // Validate skillsRequired is an array of strings
    if (!Array.isArray(skillsRequired) || skillsRequired.some(skill => typeof skill !== 'string' || !validator.isAlphanumeric(skill.replace(/\s/g, '')))) {
      throw { status: 400, message: "SkillsRequired must be an array of alphanumeric strings." }
    }

    // Check deadline is a valid ISO date and in the future
    if (!validator.isISO8601(deadline.toString()) || !isAfter(new Date(deadline), new Date())) {
      throw { status: 400, message: "Deadline must be a valid future date." }
    }

    // Validate userId format if it's an ObjectId
    if (!validator.isMongoId(userId.toString())) {
      throw { status: 400, message: "Invalid userId format." }
    }

    // Validate maxApplicants
    if (maxApplicants !== undefined) {
      if (typeof maxApplicants !== 'number' || !Number.isInteger(maxApplicants) || maxApplicants <= 0) {
        throw { status: 400, message: "maxApplicants must be a positive integer." }
      }
    }

    const validJobTypes = [
      'Computer Science & IT', 
      'Web Design & Graphic Design', 
      'Digital Marketing & Social Media',
      'Content Creation & Writing',
      'Photography & Visual Arts',
      'Virtual Assistant & Administrative Support',
      'Transcription & Translation',
      'Consulting & Business Strategy',
      'Sales & Marketing',
      'Voiceovers & Audio Production',
      'Accounting & Financial Services',
      'Legal & Intellectual Property Services',
      'Event Planning & Coordination',
      'Health, Fitness & Wellness',
      'Education & Tutoring'
    ];

    if (!validJobTypes.includes(type)) {
      throw { status: 400, message: `Invalid job type. Available types: ${validJobTypes.join(', ')}` };
    }

    // Fetch and check if the user exists in the database
    const postedBy = await User.findById(userId);
    if (!postedBy) {
      throw { status: 404, message: 'User not found.' }
    }

    const job = new Job({
      title,
      description,
      skillsRequired,
      deadline: new Date(deadline),
      postedBy: userId,
      type
    })

    await job.save()
    logger.info(`User ${userId} successfully posted a job`)
  }
}

module.exports = new JobService()