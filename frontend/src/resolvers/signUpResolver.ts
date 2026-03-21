import { z } from "zod";
import { formUtils } from './formUtils.js';

const signUpSchema = () => {
    return z.object({
        email: z.email("Incorrect email address"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Provided passwords do not match",
        path: ["confirmPassword"]
    });
}

export const signUpFormUtils = () => formUtils(signUpSchema())
export type SignUpSchema = ReturnType<typeof signUpSchema>;