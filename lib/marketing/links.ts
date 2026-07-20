import { getAuthHref } from "@/lib/auth/return-path";

export const PROJECT_CREATION_PATH = "/projects/new";
export const PROJECT_START_HREF = getAuthHref("/signup", PROJECT_CREATION_PATH);
