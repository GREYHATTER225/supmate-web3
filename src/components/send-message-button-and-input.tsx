import { KeyboardEvent, useRef, useState } from "react";
import { toast } from "react-toastify";
import { playSendSound } from "../utils/soundEffects";
import { AssetIcon } from "./ui/asset-icon";
import { GasTicker } from "./ui/gas-ticker";

export interface SendMessageButtonAndInputProps {
  onClick: (messageToSend: string) => Promise<void> | void;
  onQuickPrompt?: (prompt: string) => void;
  showEncryptionNote?: boolean;
}

/**
 * Bento 5 · Smart cryptographic composer.
 *
 * A clean, text-centric writing zone inside an obsidian plate. The only
 * instrument is the send control (local asset glyph) and a compact gas
 * ticker anchored inside the right margin, contextualizing the composer on
 * the chain infrastructure.
 */
export const SendMessageButtonAndInput = ({
  onClick,
  showEncryptionNote = true,
}: SendMessageButtonAndInputProps) => {
  const [isSending, setIsSending] = useState(false);
  const [messageToSend, setMessageToSend] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    if (!messageToSend.trim()) {
      toast.warning("Please type a message first");
      return;
    }
    if (isSending) return;

    setIsSending(true);
    playSendSound();
    const text = messageToSend;
    setMessageToSend("");

    try {
      await onClick(text);
    } catch (e) {
      setMessageToSend(text);
    } finally {
      setIsSending(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const canSend = (e: KeyboardEvent<HTMLTextAreaElement>) =>
    e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing;

  const hasText = messageToSend.trim().length > 0;

  return (
    <section className="bento composer-bento" aria-label="Message composer">
      <div className="composer-bento__inner">
        <textarea
          ref={textareaRef}
          rows={1}
          className="composer-input"
          placeholder="Write a message…"
          value={messageToSend}
          onChange={(e) => {
            setMessageToSend(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 118) + "px";
          }}
          onKeyDown={async (e) => {
            if (canSend(e)) {
              e.preventDefault();
              await sendMessage();
            }
          }}
        />

        <button
          className={`composer-send ${hasText ? "composer-send--ready" : ""}`}
          onClick={sendMessage}
          disabled={!hasText || isSending}
          aria-label="Send message"
        >
          <AssetIcon name="send" size={15} active />
        </button>
      </div>

      <GasTicker className="gas-ticker--inline" />

      {showEncryptionNote && (
        <div className="composer-note">
          <span className="composer-note__dot">●</span>
          Encrypted with DeSo access groups when both parties are set up
        </div>
      )}
    </section>
  );
};