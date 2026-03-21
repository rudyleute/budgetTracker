import { z } from "zod";
import { formUtils } from './formUtils.js';

const loginSchema = () => {
    return z.object({
        email: z.email("Incorrect email address"),
        password: z.string().min(6, "Password is at least 6 characters long"),
    });
}

export const loginFormUtils = () => formUtils(loginSchema())
export type LoginSchema = ReturnType<typeof loginSchema>;