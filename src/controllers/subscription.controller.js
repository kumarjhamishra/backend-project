import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  //TODO: toggle subscription

  const { channelId } = req.params;
  const userId = req.user._id;

  // validate the channel whose subscription we want to toggle
  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "channelId is required and in correct format");
  }

  // validate the subscriber who want to subscribe
  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "userId is required and in correct format");
  }

  // find the channel whose subscription we want to toggle
  // if found means already subscribed and need to delete this document
  // and if not found make a new document
  const isSubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });

  if (!isSubscribed) {
    // create a new subscription document
    const newSubsciption = await Subscription.create({
      channel: channelId,
      subscriber: userId,
    });

    if (!newSubsciption) {
      throw new ApiError(400, "error in subscribing the channel");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          newSubsciption,
          "successfully subscribed the channel"
        )
      );
  } else {
    // delete the subscription document
    const deletedSubscription = await Subscription.findOneAndDelete({
      channel: channelId,
      subscriber: userId,
    });

    if (!deletedSubscription) {
      throw new ApiError(400, "error in deleting this subscription");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          deletedSubscription,
          "subscription deleted successfully"
        )
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // validate the channel whose subscription we want to toggle
  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "channelId is required and in correct format");
  }

  // now write a pipeline to match all those documents whose channelId matches and for those
  // documents take their subscriberId and do a join of it with the user model to get some of the infromation of the user
  // from the user model with this id
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(`${channelId}`),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    // this pipeline will return an array and $unwind will will flattens that array
    {
      $unwind: "$subscriberDetails",
    },
    {
      $project: {
        _id: 0,
        subscriberId: "$subscriberDetails._id",
        username: "$subscriberDetails.username",
        avatar: "$subscriberDetails.avatar",
        subscribedAt: "$createdAt",
      },
    },
  ]);

  if (!subscribers) {
    throw new ApiError(400, "error in fetching the subscribers list");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "subscribers list fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const {subscriberId } = req.params

  //TODO: with this subscriberId get all the channels that the subscriber has subscribed

  if(!subscriberId || !isValidObjectId(subscriberId)){
    throw new ApiError(400, "subscriberId is required and in correct format")
  }

  const channelsSubscribed = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(`${subscriberId}`)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        // nested pipeline to project only selective feilds of the channel object
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1
            }
          }
        ]
      },
    },

    // project the subscribed channels with the time when they were subscribed
    {
      $project: {
        channel: 1,
        createdAt: 1
      }
    }
  ])

  if(!channelsSubscribed){
    throw new ApiError(400, "error in fetching subscribed channels")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200, channelsSubscribed, "successfully fetched the subscribed channels")
  )
})

export { 
  toggleSubscription, 
  getUserChannelSubscribers,
  getSubscribedChannels
};
