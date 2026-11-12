
import { FC, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { AssetIcon } from "./ui/asset-icon";

export const MessagingConversationButton: FC<{
  onClick: () => void | Promise<void>;
}> = ({ onClick }) => {
  const [isSending, setIsSending] = useState(false);

  const handleLoadInbox = async () => {
    if (isSending) return;

    setIsSending(true);

    try {
      await onClick();
    } catch (error) {
      console.error("Unable to load on-chain inbox:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="supmate-inbox-gateway">
      <style>{`
        .supmate-inbox-gateway {
          --gateway-cyan: #9befff;
          position: relative;
          isolation: isolate;
          display: flex;
          width: min(100%, 570px);
          flex-direction: column;
          align-items: center;
          margin: auto;
          padding: clamp(25px, 5vw, 48px);
          overflow: hidden;
          color: #f8fafc;
          text-align: center;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 26px;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.075), transparent 48%),
            linear-gradient(145deg, #111419 0%, #080a0d 48%, #050608 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.19),
            inset 0 -1px 0 rgba(255,255,255,.035),
            0 30px 85px rgba(0,0,0,.55);
        }

        .supmate-inbox-gateway::before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 1px;
          pointer-events: none;
          border-radius: 25px;
          background:
            linear-gradient(125deg, rgba(255,255,255,.045), transparent 25%),
            radial-gradient(ellipse at 95% 100%, rgba(34,211,238,.055), transparent 38%);
        }

        .supmate-gateway-reflection {
          position: absolute;
          z-index: -1;
          top: -100%;
          left: -45%;
          width: 50%;
          height: 300%;
          pointer-events: none;
          transform: rotate(25deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.035),
            rgba(255,255,255,.075),
            transparent
          );
          animation: supmate-gateway-shine 11s ease-in-out infinite;
        }

        .supmate-gateway-topline {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 34px;
          color: #929ba6;
          font: 9px "JetBrains Mono", monospace;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .supmate-gateway-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border: 1px solid rgba(163,230,53,.19);
          border-radius: 6px;
          color: #bef264;
          background: rgba(163,230,53,.045);
        }

        .supmate-gateway-status::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a3e635;
          box-shadow: 0 0 10px rgba(163,230,53,.7);
        }

        .supmate-gateway-art {
          position: relative;
          display: grid;
          width: 112px;
          height: 112px;
          margin-bottom: 30px;
          place-items: center;
          border: 1px solid rgba(255,255,255,.22);
          border-radius: 32px;
          color: #c9f8ff;
          background:
            linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.015)),
            #10161c;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.35),
            inset 0 -12px 30px rgba(34,211,238,.035),
            0 15px 45px rgba(0,0,0,.5),
            0 0 45px rgba(34,211,238,.075);
          transform: rotate(-4deg);
          animation: supmate-gateway-float 5s ease-in-out infinite;
        }

        .supmate-gateway-art::before {
          content: "";
          position: absolute;
          inset: 7px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 25px;
          pointer-events: none;
        }

        .supmate-gateway-art::after {
          content: "";
          position: absolute;
          top: 12px;
          right: 13px;
          width: 27px;
          height: 27px;
          border-top: 2px solid rgba(255,255,255,.6);
          border-right: 2px solid rgba(255,255,255,.6);
          border-radius: 0 8px 0 0;
        }

        .supmate-gateway-art-icon {
          filter: drop-shadow(0 0 15px rgba(103,232,249,.35));
          transform: rotate(4deg);
        }

        .supmate-gateway-spark {
          position: absolute;
          display: grid;
          width: 29px;
          height: 29px;
          place-items: center;
          border: 2px solid #050608;
          border-radius: 8px;
          color: #08090b;
          background: #a5f3fc;
          box-shadow: 3px 3px 0 #000;
          font: 1000 10px "JetBrains Mono", monospace;
          transform: rotate(11deg);
        }

        .supmate-gateway-spark--one {
          top: -10px;
          right: -13px;
        }

        .supmate-gateway-spark--two {
          bottom: -7px;
          left: -12px;
          width: 19px;
          height: 19px;
          border-radius: 50%;
          color: #fff;
          background: #a855f7;
          font-size: 12px;
          transform: rotate(-12deg);
        }

        .supmate-gateway-heading {
          margin: 0;
          color: #fff;
          font: 850 clamp(22px, 4vw, 30px)/1.2 "Plus Jakarta Sans", sans-serif;
          letter-spacing: -.045em;
        }

        .supmate-gateway-description {
          max-width: 390px;
          margin: 13px 0 25px;
          color: #9299a4;
          font: 13px/1.8 "Plus Jakarta Sans", sans-serif;
        }

        .supmate-gateway-button {
          position: relative;
          display: inline-flex;
          min-height: 49px;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 0 24px;
          overflow: hidden;
          border: 2px solid #030405;
          border-radius: 12px 12px 12px 4px;
          color: #030608;
          background: linear-gradient(115deg, #d8fbff, #80eaff 52%, #a5f3fc);
          box-shadow:
            4px 4px 0 #000,
            inset 0 1px 0 rgba(255,255,255,.85),
            0 0 24px rgba(34,211,238,.15);
          font: 900 11px "JetBrains Mono", monospace;
          letter-spacing: .08em;
          cursor: pointer;
          transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
        }

        .supmate-gateway-button::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,.6), transparent 75%);
          transform: translateX(-120%);
          transition: transform .45s ease;
        }

        .supmate-gateway-button:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow:
            6px 6px 0 #000,
            0 0 32px rgba(34,211,238,.23);
          filter: brightness(1.08);
        }

        .supmate-gateway-button:hover:not(:disabled)::before {
          transform: translateX(120%);
        }

        .supmate-gateway-button:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0 #000;
        }

        .supmate-gateway-button:disabled {
          cursor: wait;
          opacity: .75;
        }

        .supmate-gateway-button:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 5px;
        }

        .supmate-gateway-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 29px;
          color: #737c87;
          font: 8px "JetBrains Mono", monospace;
          letter-spacing: .12em;
        }

        .supmate-gateway-footer span:first-child {
          color: #a5f3fc;
        }

        .supmate-gateway-separator {
          color: #3f4650;
        }

        @keyframes supmate-gateway-shine {
          0%, 70%, 100% { left: -65%; opacity: 0; }
          78% { opacity: .8; }
          95% { left: 140%; opacity: .25; }
        }

        @keyframes supmate-gateway-float {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-6px) rotate(-1deg); }
        }

        @media (max-width: 480px) {
          .supmate-inbox-gateway {
            padding: 25px 19px;
            border-radius: 20px;
          }

          .supmate-gateway-topline {
            margin-bottom: 27px;
            font-size: 8px;
          }

          .supmate-gateway-art {
            width: 94px;
            height: 94px;
            border-radius: 27px;
          }

          .supmate-gateway-description {
            font-size: 12px;
          }

          .supmate-gateway-button {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .supmate-gateway-reflection,
          .supmate-gateway-art {
            animation: none;
          }

          .supmate-gateway-button {
            transition: none;
          }
        }
      `}</style>

      <div className="supmate-gateway-reflection" />

      <div className="supmate-gateway-topline">
        <span>SUPMATE / MESSAGING</span>

        <span className="supmate-gateway-status">
          KEYS VERIFIED
        </span>
      </div>

      <div className="supmate-gateway-art">
        <div className="supmate-gateway-art-icon">
          <AssetIcon name="chatLogo" size={39} tone="none" active />
        </div>

        <span className="supmate-gateway-spark supmate-gateway-spark--one">
          NEW
        </span>

        <span className="supmate-gateway-spark supmate-gateway-spark--two">
          ✦
        </span>
      </div>

      <h2 className="supmate-gateway-heading">
        Your inbox is waiting.
      </h2>

      <p className="supmate-gateway-description">
        Your encryption keys are ready. Load your decentralized
        message streams and start connecting privately on the DeSo
        network.
      </p>

      <button
        type="button"
        className="supmate-gateway-button"
        onClick={handleLoadInbox}
        disabled={isSending}
        aria-busy={isSending}
      >
        {isSending ? (
          <>
            <ClipLoader color="#030608" loading size={16} />
            CONNECTING TO NETWORK...
          </>
        ) : (
          <>
            LOAD ON-CHAIN INBOX
            <span aria-hidden="true">↗</span>
          </>
        )}
      </button>

      <div className="supmate-gateway-footer">
        <span>● PRIVATE BY DESIGN</span>
        <span className="supmate-gateway-separator">/</span>
        <span>DESO NETWORK</span>
        <span className="supmate-gateway-separator">/</span>
        <span>END-TO-END ENCRYPTION</span>
      </div>
    </section>
  );
};
