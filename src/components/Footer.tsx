import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-description">
          <h3 className="footer-tagline">AI Meets AAC. Speak Naturally</h3>
          <p className="footer-text">
            Verbali is pioneering the next generation of AI-powered Augmentative
            and Alternative Communication (AAC) tools, making communication more
            natural and accessible than ever before. Our Flagship app Ma-Talk AI
            is available on the App Store and is a full featured contextually
            aware AAC app that allows you to communicate with your loved ones.
          </p>
          <p className="footer-quote">
            "Because the most meaningful conversation is a natural one"
          </p>
        </div>
        <div className="footer-links">
          <a
            href="https://verbali.io"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Verbali.io
          </a>
          <a
            href="https://apps.apple.com/us/app/ma-talk-ai/id6747360381"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link app-store-link"
          >
            <img
              src="/assets/black.svg"
              alt="Download on the App Store"
              className="app-store-badge"
            />
          </a>
        </div>
        <div className="footer-copyright">
          <p>© Verbali</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
