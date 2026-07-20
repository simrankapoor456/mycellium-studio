export type ActionErrorKind =
  | "validation"
  | "network"
  | "authentication"
  | "database"
  | "permission"
  | "unknown";

export type FieldErrors = Record<string, string[]>;

export type ActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: FieldErrors;
  errorKind?: ActionErrorKind;
  retryable?: boolean;
  redirectTo?: string;
};

export const initialActionState: ActionState = {
  status: "idle",
  message: "",
};

export function validationActionState(message: string, fieldErrors: FieldErrors): ActionState {
  return {
    status: "error",
    message,
    fieldErrors,
    errorKind: "validation",
    retryable: false,
  };
}

export function sessionExpiredActionState(): ActionState {
  return {
    status: "error",
    message: "Your session expired. Your work is still here. Sign in again, then retry.",
    errorKind: "authentication",
    retryable: true,
  };
}
