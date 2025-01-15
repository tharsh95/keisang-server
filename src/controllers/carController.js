import Car from "../models/carSchema.js";

export const getInventory = async (req, res) => {
  try {
    const { condition, brand } = req.query;
    const filter = {};
    if (condition) filter.condition = condition;
    if (brand) filter.brand = brand;

    const data = await Car.find(filter);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getInventoryCount = async (req, res) => {
  try {
    const { condition, brand } = req.query;
    const filter = {};
    if (condition) filter.condition = condition;
    if (brand) filter.brand = brand;

    const data = await Car.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$timestamp" } } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          date: "$_id",
          count: "$count",
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAverageMsrp = async (req, res) => {
  try {
    const { condition, brand } = req.query;
    const filter = {};
    if (condition) filter.condition = condition;
    if (brand) filter.brand = brand;

    const data = await Car.aggregate([
      { $match: filter },
      {
        $addFields: {
          msrp: {
            $toDouble: {
              $trim: { input: { $replaceAll: { input: "$price", find: " USD", replacement: "" } }, chars: " " },
            },
          },
        },
      },
      { $match: { msrp: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$timestamp" } } },
          avgMSRP: { $avg: "$msrp" },
        },
      },
      {
        $project: {
          date: "$_id",
          avgMSRP: { $round: ["$avgMSRP", 2] },
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getHistoryLog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const brand = req.query.brand || "";
    const skip = (page - 1) * limit;
    const filter = {};
    if (brand) filter.brand = brand;
    const result = await Car.aggregate([
        {
            $addFields: {
                msrp: {
                    $toDouble: {
                        $trim: {
                            input: { $replaceAll: { input: "$price", find: " USD", replacement: "" } },
                            chars: " "
                        }
                    }
                }
            }
        },
        {
            $match: filter
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$timestamp" } } },
                    condition: "$condition"
                },
                totalCars: { $sum: 1 },     
                totalPrice: { $sum: "$msrp" },  
                averagePrice: { $avg: "$msrp" } 
            }
        },
        {
            $group: {
                _id: "$_id.date",
                conditions: {
                    $push: {
                        condition: "$_id.condition",
                        totalCars: "$totalCars",
                        totalPrice: "$totalPrice",
                        averagePrice: { $ceil: "$averagePrice" } 
                    }
                }
            }
        },

        {
            $sort: { _id: 1 }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        }
    ]);

    const totalCount = await Car.aggregate([
        {
            $addFields: {
                msrp: {
                    $toDouble: {
                        $trim: {
                            input: { $replaceAll: { input: "$price", find: " USD", replacement: "" } },
                            chars: " "
                        }
                    }
                }
            }
        },
        {
            $match: filter 
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$timestamp" } } },
                    condition: "$condition"
                },
                totalCars: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.date",
                conditions: { $push: "$_id.condition" }
            }
        },
        {
            $count: "totalCount"
        }
    ]);
        res.json({
                data: result,
                totalCount: totalCount[0] ? totalCount[0].totalCount : 0,
                page,
                totalPages: Math.ceil((totalCount[0] ? totalCount[0].totalCount : 0) / limit)
            });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history log" });
  }
};
