import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, MapPin, CheckCircle2, AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { useHub, SuperHub, SubHub } from "@/context/HubContext";
import locationImg from "@assets/placeholder_(1)_1774706943633.png";

const BRAND_BLUE = "#364F9F";
const BRAND_ORANGE = "#F97316";
const WHATSAPP_NUMBER = "919220200100";

type CheckStatus = "idle" | "checking" | "eligible" | "ineligible";

export function LocationPicker() {
  const { isPickerOpen, closePicker, setHub } = useHub();

  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [areaName, setAreaName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allSubHubs = [] } = useQuery<SubHub[]>({
    queryKey: ["/api/hubs/sub-all"],
    queryFn: async () => {
      const res = await fetch("/api/hubs/sub", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isPickerOpen,
  });

  const { data: superHubs = [] } = useQuery<SuperHub[]>({
    queryKey: ["/api/hubs/super"],
    enabled: isPickerOpen,
  });

  useEffect(() => {
    if (isPickerOpen) {
      setPincode("");
      setStatus("idle");
      setAreaName("");
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isPickerOpen]);

  if (!isPickerOpen) return null;

  const handleCheck = () => {
    const clean = pincode.replace(/\s/g, "");
    if (clean.length !== 6) return;

    setStatus("checking");

    const matchedSub = allSubHubs.find((sub) =>
      sub.pincodes.some((p) => p.pincode.replace(/\s/g, "") === clean)
    );

    setTimeout(() => {
      if (matchedSub) {
        const matchedSuper = superHubs.find((s) => s.id === matchedSub.superHubId);
        if (matchedSuper) {
          setAreaName(matchedSub.name);
          setStatus("eligible");
          setHub(matchedSuper, matchedSub);
          setTimeout(() => closePicker(), 2000);
          return;
        }
      }
      setStatus("ineligible");
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-stretch justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePicker} />

      <div className="relative bg-white w-full h-full sm:max-w-sm rounded-none border-l border-border/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 max-h-screen font-[Poppins,sans-serif]">

        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-border/30 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={locationImg} alt="Location" className="w-5 h-5 object-contain" />
              <span className="text-xl font-bold text-foreground">Check Delivery</span>
            </div>
            <button
              onClick={closePicker}
              className="flex items-center justify-center w-9 h-9 rounded-full text-white transition-all duration-200 hover:opacity-80 shadow-md"
              style={{ backgroundColor: BRAND_BLUE }}
              data-testid="button-location-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col px-5 pt-8 pb-6">

          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${BRAND_BLUE}15` }}
            >
              <MapPin className="w-8 h-8" style={{ color: BRAND_BLUE }} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Enter your Pincode</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We'll check if fresh fish, seafood &amp; meat can be delivered to your area.
            </p>
          </div>

          {/* Pincode input */}
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPincode(val);
                if (status !== "idle") setStatus("idle");
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 400601"
              className="w-full h-14 px-5 rounded-2xl border-2 text-xl font-bold text-center text-slate-800 tracking-[0.25em] outline-none transition-all duration-200 placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal"
              style={{
                borderColor: status === "eligible"
                  ? "#22c55e"
                  : status === "ineligible"
                  ? BRAND_ORANGE
                  : BRAND_BLUE,
                boxShadow: `0 0 0 3px ${status === "eligible" ? "#22c55e" : status === "ineligible" ? BRAND_ORANGE : BRAND_BLUE}18`,
              }}
              data-testid="input-pincode"
            />
          </div>

          {/* Check button */}
          <button
            onClick={handleCheck}
            disabled={pincode.length !== 6 || status === "checking"}
            className="w-full h-13 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
            style={{ backgroundColor: BRAND_BLUE }}
            data-testid="button-check-pincode"
          >
            {status === "checking" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Delivery Availability"
            )}
          </button>

          {/* Eligible result */}
          {status === "eligible" && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-700">You're eligible for delivery!</p>
              <p className="text-sm text-slate-500 mt-1">
                We deliver fresh seafood &amp; meat to{" "}
                <span className="font-semibold text-slate-700">{areaName}</span>.
              </p>
              <p className="text-xs text-slate-400 mt-3">Taking you to the store...</p>
            </div>
          )}

          {/* Ineligible result */}
          {status === "ineligible" && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: `${BRAND_ORANGE}18` }}
              >
                <AlertCircle className="w-7 h-7" style={{ color: BRAND_ORANGE }} />
              </div>
              <p className="text-lg font-bold text-slate-800">Not in our delivery zone yet</p>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Sorry, we don't deliver to <span className="font-semibold">{pincode}</span> at the moment.
              </p>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* WhatsApp CTA — always visible at bottom, more prominent when ineligible */}
          <div
            className={`mt-6 rounded-2xl p-4 border transition-all duration-300 ${
              status === "ineligible"
                ? "border-green-200 bg-green-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            {status === "ineligible" && (
              <p className="text-sm font-semibold text-slate-700 mb-1 text-center">
                Need delivery to a longer distance?
              </p>
            )}
            <p className="text-xs text-slate-500 text-center mb-3 leading-relaxed">
              {status === "ineligible"
                ? "Contact us on WhatsApp — we'll do our best to arrange it for you!"
                : "For bulk or long-distance orders, connect with us directly."}
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#25D366" }}
              data-testid="button-whatsapp-order"
            >
              <MessageCircle className="w-5 h-5" />
              Connect via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
