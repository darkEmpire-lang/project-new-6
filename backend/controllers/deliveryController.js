import DeliveryInfo from "../models/DeliveryModel.js";

// Fetch all delivery infos for the logged-in user
export const getDeliveryInfos = async (req, res) => {
  try {
    const userId = req.body.userId; // Set by your authUser middleware
    const infos = await DeliveryInfo.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, deliveryInfos: infos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a new delivery info for the logged-in user
export const addDeliveryInfo = async (req, res) => {
  try {
    const userId = req.body.userId;
    const deliveryInfo = req.body.deliveryInfo;
    if (!deliveryInfo) return res.status(400).json({ success: false, message: "No delivery info provided" });

    const newInfo = new DeliveryInfo({ ...deliveryInfo, user: userId });
    await newInfo.save();

    const infos = await DeliveryInfo.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, deliveryInfos: infos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a delivery info (only if it belongs to the logged-in user)
export const updateDeliveryInfo = async (req, res) => {
  try {
    const userId = req.body.userId;
    const infoId = req.params.id;
    const newInfo = req.body.deliveryInfo;

    const info = await DeliveryInfo.findOneAndUpdate(
      { _id: infoId, user: userId },
      newInfo,
      { new: true }
    );
    if (!info) return res.status(404).json({ success: false, message: "Delivery info not found" });

    const infos = await DeliveryInfo.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, deliveryInfos: infos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a delivery info (only if it belongs to the logged-in user)
export const deleteDeliveryInfo = async (req, res) => {
  try {
    const userId = req.body.userId;
    const infoId = req.params.id;

    const info = await DeliveryInfo.findOneAndDelete({ _id: infoId, user: userId });
    if (!info) return res.status(404).json({ success: false, message: "Delivery info not found" });

    const infos = await DeliveryInfo.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, deliveryInfos: infos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
