import User from "../models/userModel.js";
import Video from "../models/videoModel.js";

//Video routes//

export const createVideo = async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const videoUrl = req.body.videoUrl;
  const public_id = req.body.public_id;
  const category = req.body.category;

  if (!title) return res.status(400).json({ message: "please enter title" });
  if (!description) return res.status(400).json({ message: "please enter description" });
  if (!videoUrl) return res.status(400).json({ message: "please enter videoUrl" });
  if (!category) return res.status(400).json({ message: "please enter category" });

  try {
    let video = new Video({
      title: title,
      description: description,
      videoUrl: videoUrl,
      public_id: public_id,
      category: category,
      postedBy: req.user._id,
    });
    let videoSaved = await video.save();
    res.status(201).json({ message: "Video created", videoSaved });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    let videos = await Video.find()
      .populate("postedBy")
      .populate("comments.postedBy");
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVideoById = async (req, res) => {
  try {
    let video = await Video.findById(req.params.id)
      .populate("postedBy")
      .populate("comments.postedBy");
    res.status(200).json({ video });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVideoById = async (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  const description = req.body.description;
  const videoUrl = req.body.videoUrl;
  const category = req.body.category;

  if (!title) return res.status(400).json({ message: "please enter title" });
  if (!description) return res.status(400).json({ message: "please enter description" });
  if (!videoUrl) return res.status(400).json({ message: "please enter videoUrl" });
  if (!category) return res.status(400).json({ message: "please enter category" });
  try {
    let video = await Video.findByIdAndUpdate(
      id,
      {
        title: title,
        description: description,
        videoUrl: videoUrl, 
        category: category,
      },
      { new: true }
    );
    res.status(200).json({ message: "Video updated", video });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVideoById = async (req, res) => {
  try {
    let video = await Video.findById(req.params.id);
    if(!video){
      return res.status(400).json({ message: "Video not found" });
    }
    const public_id = video.public_id;

    cloudinary.api.delete_resources(
      public_id,
      function (result, error) {
        console.log(result, error);
      },
      { resource_type: "video" }
    );

    let delVideo = await Video.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Video deleted", delVideo });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Like routes//

export const likeVideo = async (req, res) => {
  try {
    let vid = await Video.findOne({ _id: req.params.id });
    if (!vid) {
      return res.status(400).json({ message: "Video not found" });
    }
    if (vid.likes.includes(req.user._id)) return;
    let video = await Video.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          likes: req.user._id,
        },
      },
      { new: true }
    );
    res.status(200).json({ message: "Video liked", video });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const unLikeVideo = async (req, res) => {
  try {
    let video = await Video.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likes: req.user._id },
      },
      { new: true }
    );
    res.status(200).json({ message: "Video unliked", video });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const dislikeVideo = async (req, res) => {
  let vid = await Video.findOne({ _id: req.params.id });
  if (!vid) {
    return res.status(400).json({ message: "Video not found" });
  }
  if (vid.dislikes.includes(req.user._id)) return;
  try {
    let video = await Video.findByIdAndUpdate(
      req.params.id,
      {
        $push: { dislikes: req.user._id },
      },
      { new: true }
    );
    res.status(200).json({ message: "Video disliked", video });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Comment routes//

export const commentVideo = async (req, res) => {
  try {
    let comment = {
      text: req.body.text,
      postedBy: req.user._id,
    };
    let video = await Video.findByIdAndUpdate(
      req.params.id,
      {
        $push: { comments: comment },
      },
      { new: true }
    )
      .populate("postedBy", "username")
      .populate("comments.postedBy", "username");
    res.status(200).json({ message: "Video commented", video });
  } catch (error) {
    res
      .status(400)

      .json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  let { commentId } = req.body;
  if (!commentId)
    return res.status(400).send({ message: "please enter comment id" });
  try {
    let obj;
    console.log(obj);
    let found = await Video.findById(req.params.id);
    found.comments.map((item) => {
      if (item._id == commentId) {
        return (obj = item);
      }
    });
    if (obj == undefined) {
      return res
        .status(400)
        .send({ message: "comment id not found for this user" });
    }
    if (obj.postedBy?.toString() !== req.user.id) {
      return res
        .status(402)
        .send({ message: "You are not authorized to delete this comment" });
    }
    let del = await Video.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );
    res.status(200).json({ message: "Comment deleted", data: del });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    let video = await Video.findOneAndUpdate(
      { _id: req.params.id, "comments._id": req.params.commentId },
      { $set: { "comments.$.text": req.body.text } },
      { new: true }
    )
      .populate("postedBy", "username")
      .populate("comments.postedBy", "username");
    res.status(200).json({ message: "Comment updated", video });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Search routes//

export const getVideoByCategory = async (req, res) => {
  try {
    let videos = await Video.find({ category: req.params.category }).populate(
      "postedBy",
      "username"
    );
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVideoByUser = async (req, res) => {
  try {
    let videos = await Video.find({ postedBy: req.user._id })
      .populate("postedBy")
      .populate("comments.postedBy");
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVideoByUserId = async (req, res) => {
  try {
    let videos = await Video.find({ postedBy: req.params.id })
      .populate("postedBy")
      .populate("comments.postedBy");
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVideoBySearch = async (req, res) => {
  try {
    let videos = await Video.find({
      title: { $regex: req.query.title },
    }).populate("postedBy", "username");
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVideoBySearchCategory = async (req, res) => {
  try {
    let videos = await Video.find({ category: req.query.category }).populate(
      "postedBy",
      "username"
    );
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVideoBySearchUser = async (req, res) => {
  try {
    let videos = await Video.find({ postedBy: req.query.postedBy }).populate(
      "postedBy",
      "username"
    );
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVideoBySearchTitleCategory = async (req, res) => {
  try {
    let videos = await Video.find({
      title: { $regex: req.query.title },
      category: req.query.category,
    }).populate("postedBy", "username");
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVideoBySearchTitleUser = async (req, res) => {
  try {
    let videos = await Video.find({
      title: { $regex: req.query.title },
      postedBy: req.query.postedBy,
    }).populate("postedBy", "username");
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVideoBySearchCategoryUser = async (req, res) => {
  try {
    let videos = await Video.find({
      category: req.query.category,
      postedBy: req.query.postedBy,
    }).populate("postedBy", "username");

    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVideoBySearchTitleCategoryUser = async (req, res) => {
  try {
    let videos = await Video.find({
      title: { $regex: req.query.title },
      category: req.query.category,
      postedBy: req.query.postedBy,
    }).populate("postedBy", "username");
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
