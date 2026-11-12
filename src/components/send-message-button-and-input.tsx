
import {
  FormEvent,
  KeyboardEvent,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { playSendSound } from "../utils/soundEffects";
import { AssetIcon } from "./ui/asset-icon";
import { GasTicker } from "./ui/gas-ticker";

export interface SendMessageButtonAndInputProps {
  onClick: (messageToSend: string) => Promise<void> | void;
  onQuickPrompt?: (prompt: string) => void;
  showEncryptionNote?: boolean;
}

const MAX_MESSAGE_LENGTH = 10000;

const composerStyles = `
  .supmate-composer {
    position: relative;
    width: 100%;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.23);
    border-radius: 18px;
    padding: 10px;
    background:
      radial-gradient(ellipse at 0% 0%,rgba(255,255,255,.09),transparent 45%),
      linear-gradient(145deg,#20252d 0%,#0c0f13 42%,#030405 100%);
    box-shadow:
      0 12px 35px rgba(0,0,0,.45),
      inset 0 1px 2px rgba(255,255,255,.24),
      inset 0 -2px 5px rgba(0,0,0,.75);
    font-family: 'Plus Jakarta Sans',sans-serif;
  }

  .supmate-composer::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      115deg,
      transparent 15%,
      rgba(255,255,255,.065) 35%,
      transparent 55%
    );
  }

  .supmate-composer__main {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 5px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 13px;
    background: rgba(0,0,0,.44);
    box-shadow:
      inset 0 2px 8px rgba(0,0,0,.65),
      inset 0 1px 1px rgba(255,255,255,.09);
    transition: border-color .2s ease,box-shadow .2s ease;
  }

  .supmate-composer__main:focus-within {
    border-color: rgba(103,232,249,.5);
    box-shadow:
      inset 0 2px 8px rgba(0,0,0,.65),
      0 0 14px rgba(34,211,238,.1);
  }

  .supmate-composer__textarea {
    width: 100%;
    min-height: 40px;
    max-height: 150px;
    padding: 10px 8px;
    resize: none;
    border: 0;
    outline: none;
    background: transparent;
    color: #f8fafc;
    font-family: 'Plus Jakarta Sans',sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.65;
  }

  .supmate-composer__textarea::placeholder {
    color: rgba(203,213,225,.48);
  }

  .supmate-composer__textarea:disabled {
    opacity: .55;
    cursor: wait;
  }

  .supmate-composer__counter {
    position: absolute;
    right: 12px;
    bottom: 4px;
    color: #64748b;
    font-family: 'JetBrains Mono',monospace;
    font-size: 9px;
  }

  .supmate-composer__send {
    position: relative;
    display: flex;
    width: 43px;
    height: 43px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.48);
    border-radius: 12px;
    color: #080a0d;
    background: linear-gradient(145deg,#fff,#aeb9c8 50%,#f1f5f9);
    box-shadow:
      inset 0 1px 2px rgba(255,255,255,.9),
      0 4px 12px rgba(0,0,0,.55);
    cursor: pointer;
    transition: transform .2s ease,box-shadow .2s ease,filter .2s ease;
  }

  .supmate-composer__send:disabled {
    cursor: not-allowed;
    filter: grayscale(1);
    opacity: .35;
    box-shadow: none;
  }

  .supmate-composer__send:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow:
      inset 0 1px 2px white,
      0 0 17px rgba(34,211,238,.22),
      0 6px 14px rgba(0,0,0,.55);
  }

  .supmate-composer__send:not(:disabled):active {
    transform: scale(.95);
  }

  .supmate-composer__send--ready {
    background: linear-gradient(135deg,#fff,#dbeafe 45%,#a5f3fc);
  }

  .supmate-composer__status {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 5px 2px;
  }

  .supmate-composer__hint {
    color: #7f8997;
    font-family: 'JetBrains Mono',monospace;
    font-size: 8px;
    letter-spacing: .035em;
  }

  .supmate-composer__note {
    position: relative;
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 9px;
    padding: 9px 10px;
    border-top: 1px solid rgba(255,255,255,.1);
    color: #929ba8;
    font-size: 10px;
    line-height: 1.5;
  }

  .supmate-composer__secure {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #67e8f9;
    box-shadow: 0 0 9px rgba(34,211,238,.8);
  }

  @media(prefers-reduced-motion:reduce) {
    .supmate-composer__main,
    .supmate-composer__send {
      transition: none;
    }
  }
`;

export const SendMessageButtonAndInput = ({
  onClick,
  onQuickPrompt,
  showEncryptionNote = true,
}: SendMessageButtonAndInputProps) => {
  const [isSending, setIsSending] = useState(false);
  const [messageToSend, setMessageToSend] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasText = messageToSend.trim().length > 0;
  const remainingCharacters =
    MAX_MESSAGE_LENGTH - messageToSend.length;

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height =
      Math.min(textarea.scrollHeight, 150) + "px";
  };

  const sendMessage = async () => {
    const text = messageToSend.trim();

    if (!text) {
      toast.warning("Please type a message first");
      return;
    }

    if (isSending) return;

    setIsSending(true);

    try {
      await onClick(text);

      setMessageToSend("");
      playSendSound();

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Message could not be sent. Your draft was preserved."
      );
    } finally {
      setIsSending(false);
    }
  };

  const canSend = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) =>
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.nativeEvent.isComposing;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await sendMessage();
  };

  return (
    <section
      className="supmate-composer"
      aria-label="Message composer"
      aria-busy={isSending}
    >
      <style>{composerStyles}</style>

      <form onSubmit={handleSubmit}>
        <div className="supmate-composer__main">
          <div className="relative min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              maxLength={MAX_MESSAGE_LENGTH}
              className="supmate-composer__textarea"
              placeholder={
                isSending
                  ? "Transmitting message..."
                  : "Write a message..."
              }
              aria-label="Write a message"
              aria-describedby="supmate-composer-status"
              value={messageToSend}
              disabled={isSending}
              onChange={(event) => {
                setMessageToSend(event.target.value);
                resizeTextarea();
              }}
              onKeyDown={async (event) => {
                if (canSend(event)) {
                  event.preventDefault();
                  await sendMessage();
                }
              }}
            />

            {messageToSend.length > 0 && (
              <span
                className="supmate-composer__counter"
                aria-live="polite"
              >
                {remainingCharacters}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={`supmate-composer__send ${hasText ? "supmate-composer__send--ready" : ""
              }`}
            disabled={!hasText || isSending}
            aria-label={
              isSending ? "Sending message" : "Send message"
            }
            title={isSending ? "Sending..." : "Send message (Enter)"}
          >
            {isSending ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            ) : (
              <AssetIcon name="send" size={17} active />
            )}
          </button>
        </div>

        <div
          id="supmate-composer-status"
          className="supmate-composer__status"
        >
          <GasTicker className="gas-ticker--inline" />

          <span className="supmate-composer__hint">
            {isSending
              ? "TRANSMITTING..."
              : "ENTER TO SEND · SHIFT + ENTER FOR NEW LINE"}
          </span>
        </div>
      </form>

      {showEncryptionNote && (
        <div className="supmate-composer__note">
          <span className="supmate-composer__secure" />
          End-to-end encryption through DeSo access groups when available.
          Plaintext delivery requires explicit opt-in.
        </div>
      )}
    </section>
  );
};
