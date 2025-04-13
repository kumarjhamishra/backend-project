import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: get the channel stats like total video views, total subscribers, total videos, total likes etc

  const channelId = req.user._id;
  if (!channelId) {
    throw new ApiError(400, "userId is required");
  }

  // get the total videos and total views
  const videos = await Video.aggregate([
    // first pipeline to match tha basis the documents on the basis of
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    // second pipeline to group the documents of this channel and to get it's total views
    {
      $group: {
        _id: null, // no grouping on the basis of any feild
        countVideos: {
          $sum: 1, // for every video add 1 to the sum
        },
        countViews: {
          $sum: "$views", // in summ add the views of every video of the channel
        },
      },
    },
  ]);

  // total subscribers
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $count: "countSubscribers",
    },
  ]);

  // total likes on the videos, comments and tweets made by this channel

  // 1.get all ID's
  const [likedVideos, likedTweets, likedComments] = await Promise.all([
    Video.find({ owner: channelId }).select("_id"),
    Tweet.find({ owner: channelId }).select("_id"),
    Comment.find({ owner: channelId }).select("_id"),
  ]);

  const likedVideosIds = likedVideos.map((v) => v._id);
  const likedTweetsIds = likedTweets.map((t) => t._id);
  const likedCommentsIds = likedComments.map((c) => c._id);

  if (
    !likedVideosIds.length &&
    !likedTweetsIds.length &&
    !likedCommentsIds.length
  ) {
    // now make the stats object
    const stats = {
      totalVideos: videos[0]?.countVideos || 0,
      totalViews: videos[0]?.countViews || 0,
      totalSubscribers: subscribers[0]?.countSubscribers || 0,
      videoLikes: 0,
      tweetLikes: 0,
      commentLikes: 0,
      totalLikes: 0,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, "channel stats fetched successfully"));
  }

  // 2. count likes of each type
  const [likedVideosStats, likedTweetsStats, likedCommentsStats] =
    await Promise.all([
      Like.aggregate([
        {
          $match: {
            video: {
              $in: likedVideosIds,
            },
          },
        },
        {
          $count: "videoLikes",
        },
      ]),
      Like.aggregate([
        {
          $match: {
            tweet: {
              $in: likedTweetsIds,
            },
          },
        },
        {
          $count: "tweetLikes",
        },
      ]),
      Like.aggregate([
        {
          $match: {
            comment: {
              $in: likedCommentsIds,
            },
          },
        },
        {
          $count: "commentLikes",
        },
      ]),
    ]);

  // 3. Extract counts with fallback to 0
  const videoLikes = likedVideosStats[0]?.videoLikes || 0;
  const tweetLikes = likedTweetsStats[0]?.tweetLikes || 0;
  const commentLikes = likedCommentsStats[0]?.commentLikes || 0;

  // 4. Total likes
  const totalLikes = videoLikes + tweetLikes + commentLikes;

  // now make the stats object
  const stats = {
    totalVideos: videos[0]?.countVideos || 0,
    totalViews: videos[0]?.countViews || 0,
    totalSubscribers: subscribers[0]?.countSubscribers || 0,
    videoLikes,
    tweetLikes,
    commentLikes,
    totalLikes,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: to get all the videos uploaded by the channel

  const channelId = req.user._id;
  if (!channelId) {
    throw new ApiError(400, "channelId is required");
  }

  const videos = await Video.find({
    owner: channelId,
  });

  if (videos.length === 0) {
    throw new ApiError(404, "videos of the channel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
