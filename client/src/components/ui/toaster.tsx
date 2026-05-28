import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import fishIcon from "@assets/fish_(1)_1779944030843.png"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        if (variant === "destructive") {
          return (
            <Toast key={id} variant="destructive" {...props}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
              {action}
              <ToastClose />
            </Toast>
          )
        }

        return (
          <Toast key={id} {...props}>
            <div className="flex items-center gap-2.5">
              <img
                src={fishIcon}
                alt=""
                className="w-5 h-5 shrink-0"
                style={{ filter: "brightness(0) saturate(100%) invert(55%) sepia(90%) saturate(700%) hue-rotate(340deg) brightness(105%)" }}
              />
              <span
                className="text-white text-sm font-medium whitespace-nowrap tracking-wide"
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
              >
                {title}
              </span>
              {description && (
                <span
                  className="text-white/80 text-xs whitespace-nowrap"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {description}
                </span>
              )}
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
