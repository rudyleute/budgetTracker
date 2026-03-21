import { z } from "zod";
import { formUtils } from './formUtils';

const changeEmailSchema = () => {
    return z.object({
        email: z.email("Incorrect email address"),
        confirmEmail: z.email("Incorrect email address"),
        password: z.string().min(6, "Password is at least 6 characters long")
    }).refine((data) => data.email === data.confirmEmail, {
        message: "Provided emails do not match",
        path: ["confirmEmail"]
    });
}

export const changeEmailFormUtils = () => formUtils(changeEmailSchema())
export type ChangeEmailSchema = ReturnType<typeof changeEmailSchema>;