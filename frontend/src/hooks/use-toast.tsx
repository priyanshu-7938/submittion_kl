import * as React from "react";
import { toast as sonnerToast } from "sonner";

// Define our own types without depending on deprecated Shadcn toast
type ToastVariant = "default" | "destructive";

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const sonnerToastMap = new Map<string, string | number>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, 1000000);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, 1),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
              }
            : t,
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

function toast({ title, description, variant = "default", duration = 5000, action, ...props }: Toast) {
  const id = genId();

  // Build the toast content
  let toastContent: React.ReactNode;
  
  if (title && description) {
    toastContent = (
      <div className="grid gap-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm opacity-90">{description}</div>
      </div>
    );
  } else if (title) {
    toastContent = title;
  } else if (description) {
    toastContent = description;
  } else {
    toastContent = "Notification";
  }

  // Show Sonner toast with action button if provided
  const toastOptions = {
    id: id,
    duration: duration,
    action: action ? {
      label: typeof action === 'string' ? action : 'Action',
      onClick: () => {
        // Handle action click if needed
      }
    } : undefined,
  };

  const sonnerId = variant === "destructive" 
    ? sonnerToast.error(toastContent, toastOptions)
    : sonnerToast(toastContent, toastOptions);

  sonnerToastMap.set(id, sonnerId);

  const update = (updateProps: Partial<ToasterToast>) => {
    const oldSonnerId = sonnerToastMap.get(id);
    if (oldSonnerId) {
      sonnerToast.dismiss(oldSonnerId);
    }

    const newVariant = updateProps.variant || variant;

    let updatedContent: React.ReactNode;
    const newTitle = updateProps.title !== undefined ? updateProps.title : title;
    const newDescription = updateProps.description !== undefined ? updateProps.description : description;

    if (newTitle && newDescription) {
      updatedContent = (
        <div className="grid gap-1">
          <div className="font-semibold">{newTitle}</div>
          <div className="text-sm opacity-90">{newDescription}</div>
        </div>
      );
    } else if (newTitle) {
      updatedContent = newTitle;
    } else if (newDescription) {
      updatedContent = newDescription;
    }

    const newSonnerId = newVariant === "destructive"
      ? sonnerToast.error(updatedContent, {
          id: id,
          duration: updateProps.duration || duration,
        })
      : sonnerToast(updatedContent, {
          id: id,
          duration: updateProps.duration || duration,
        });

    sonnerToastMap.set(id, newSonnerId);

    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...updateProps, id },
    });
  };

  const dismiss = () => {
    const sonnerId = sonnerToastMap.get(id);
    if (sonnerId) {
      sonnerToast.dismiss(sonnerId);
      sonnerToastMap.delete(id);
    }
    dispatch({ type: "DISMISS_TOAST", toastId: id });
  };

  dispatch({
    type: "ADD_TOAST",
    toast: {
      id,
      title,
      description,
      variant,
      duration,
      action,
      ...props,
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        const sonnerId = sonnerToastMap.get(toastId);
        if (sonnerId) {
          sonnerToast.dismiss(sonnerId);
          sonnerToastMap.delete(toastId);
        }
      } else {
        // Dismiss all toasts
        sonnerToast.dismiss();
        sonnerToastMap.clear();
      }
      dispatch({ type: "DISMISS_TOAST", toastId });
    },
  };
}

export { useToast, toast };
export type { ToasterToast, ToastVariant };