const User = require('../models/user')
const logger = require('../logger/logger')
const { findMissingParams } = require('../utils/paramsValidator')

class UserService {
  async followUser(userId, followId) {
    try {
      logger.info(`Follow request received by ${userId} for ${followId}`)

      const requiredParams = { userId, followId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message:'Failed to follow, user id is not found'}
      }

      const [userToBeFollowed, user] = await Promise.all([
        User.findById(followId),
        User.findById(userId)
      ])

      if (!userToBeFollowed || !user) {
        throw { status: 400, message: 'Failed to follow, user is not found'}
      }

      if (user.following.includes(followId) && userToBeFollowed.followers.includes(userId)) {
        throw { status: 400, message: 'Failed to follow user: Already following'}
      } 

      user.following.push(followId)
      userToBeFollowed.followers.push(userId)
    
      await Promise.all([user.save(), userToBeFollowed.save()])
    
      logger.info(`User ${userId} successfully followed user ${followId}`)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async unfollowUser(userId, unfollowId) {
    try {
      logger.info(`Unfollow request received by ${userId} for ${unfollowId}`)

      const requiredParams = { unfollowId, userId } 
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message:'Failed to follow, user id is not found'}
      }
  
      const [userToBeUnfollowed, user] = await Promise.all([
        User.findById(unfollowId),
        User.findById(userId)
      ])
  
      if (!userToBeUnfollowed || !user) {
        throw { status: 400, message: 'Failed to follow, user is not found'}
      }
  
      if (!user.following.includes(unfollowId) && !userToBeUnfollowed.followers.includes(userId)) {
        throw { status: 400, message: 'Failed to unfollow user: You are not following them'}
      } 
  
      user.following = user.following.filter(id => id.toString() !== unfollowId.toString())
  
      userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter(id => id.toString() !== userId.toString())
  
      await Promise.all([user.save(), userToBeUnfollowed.save()])
  
      logger.info(`User ${userId} successfully unfollowed user ${unfollowId}`)
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.exports = new UserService()