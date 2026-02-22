// backend/routes/userRoutes.js
router.delete('/saved-points/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        // Filter out the point with the matching ID
        user.savedPoints = user.savedPoints.filter(point => point.toString() !== req.params.id);
        await user.save();
        res.status(200).json({ message: "Point removed successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to remove point" });
    }
});