exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user and explicitly include the role field
        const user = await User.findOne({ email });

        // 2. Check if user exists and password matches
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ 
                error: "Invalid email or password" 
            });
        }

        // 3. Normalize the role 
        // Force 'user' if the database field is empty or missing
        const userRole = user.role ? user.role.toLowerCase() : 'user';

        // 4. Send the response
        return res.status(200).json({
            token: generateToken(user._id),
            role: userRole, 
            name: user.name,
            email: user.email
        });

    } catch (err) {
        console.error("Login Controller Error:", err);
        return res.status(500).json({ 
            error: "Internal server error. Please try again." 
        });
    }
};