import { validationResult } from "express-validator";

/** Runs after express-validator chains; sends 400 if checks failed */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors
                .array()
                .map((e) => e.msg)
                .join(", "),
            statusCode: 400,
        });
    }
    next();
};

export default validateRequest;
