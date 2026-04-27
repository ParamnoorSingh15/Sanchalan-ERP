const Notification = require('../../models/Notification');

exports.getUserNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        next(err);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ message: 'Notification marked as read', notification });
    } catch (err) {
        next(err);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { read: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        next(err);
    }
};

// For sending a notification (internal use or admin)
exports.createNotification = async (req, res, next) => {
    try {
        const { userId, title, body, type } = req.body;
        const notification = new Notification({ userId, title, body, type });
        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        next(err);
    }
};
