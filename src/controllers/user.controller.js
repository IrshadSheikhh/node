const User = require("../schema/user.schema");
const Post = require("../schema/post.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of items per page, default is 10

    const skip = (page - 1) * limit; // Number of items to skip

    const users = await User.aggregate([
      {
        $lookup: {
          from: "posts", //
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
      
      
      
      {
        $project: {
          _id: 1,
          name: 1,
        
         
          posts: {
             $size: "$posts" 
             
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);


    const totalUsers = await User.countDocuments();

    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const pagination = {
      totalDocs: totalUsers,
      limit,
      page,
      totalPages,
      pagingCounter: skip + 1,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
    };

    res.status(200).json({ data: { users, pagination } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};