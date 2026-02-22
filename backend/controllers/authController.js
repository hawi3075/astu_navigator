exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    // ✅ MUST include 'role' in the response
    res.json({
        token: generateToken(user._id),
        role: user.role, // This will be 'admin' for your specific email
        name: user.name
    });
};