import Delivery from '../models/deliveryModel.js';

// Create a new delivery record
export const addDelivery = async (req, res) => {
  try {
    const delivery = new Delivery({ ...req.body, userId: req.user.id });
    await delivery.save();
    res.status(201).json({ success: true, message: 'Delivery information saved successfully', delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all deliveries for a user
export const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ userId: req.user.id });
    res.status(200).json({ success: true, deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single delivery record by ID
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    res.status(200).json({ success: true, delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a delivery record
export const updateDelivery = async (req, res) => {
  try {
    const updatedDelivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDelivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    res.status(200).json({ success: true, message: 'Delivery information updated successfully', updatedDelivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a delivery record
export const deleteDelivery = async (req, res) => {
  try {
    const deletedDelivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!deletedDelivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    res.status(200).json({ success: true, message: 'Delivery information deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
