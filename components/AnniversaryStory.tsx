"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { story } from "@/data/story";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

function FloatingSymbols() {
  const items = useMemo(
    () => [
      ["✈️", "10%", "12%", "0s"],
      ["♡", "82%", "18%", "1.6s"],
      ["∞", "15%", "72%", "2.2s"],
      ["✦", "78%", "78%", "0.8s"],
      ["♡", "52%", "48%", "3s"],
    ],
    []
  );

  return (
    <div className="floating-symbols" aria-hidden="true">
      {items.map(([symbol, left, top, delay], index) => (
        <span key={index} style={{ left, top, animationDelay: delay }}>
          {symbol}
        </span>
      ))}
    </div>
  );
}

function SecretHeart() {
  const [taps, setTaps] = useState(0);
  const [open, setOpen] = useState(false);

  function handleTap() {
    const next = taps + 1;
    setTaps(next);
    if (next >= 4) setOpen(true);
  }

  return (
    <>
      <button className="secret-heart" onClick={handleTap} aria-label="Секрет">
        ♡
      </button>
      {open && (
        <div className="secret-note" role="status">
          <button aria-label="Закрыть" onClick={() => setOpen(false)}>×</button>
          <p>{story.secret}</p>
        </div>
      )}
    </>
  );
}

function Proposal() {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [noStage, setNoStage] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function moveNo() {
    const area = areaRef.current;
    if (!area) return;
    const maxX = Math.max(60, area.clientWidth * 0.52);
    const maxY = 130;
    const x = (Math.random() - 0.5) * maxX;
    const y = (Math.random() - 0.5) * maxY;
    setPos({ x, y });
    setNoStage((s) => Math.min(s + 1, story.proposal.noStages.length - 1));
  }

  if (accepted) {
    return (
      <section className="finale-screen">
        <div className="heart-burst" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => <span key={i}>❤</span>)}
        </div>
        <div className="flying-plane" aria-hidden="true">✈️</div>
        <Reveal className="date-card-wrap">
          <div className="date-card">
            <span className="date-card-kicker">Денис ❤️ Маша</span>
            <h2>{story.dateCard.title}</h2>
            <div className="date-pill">{story.dateCard.date}</div>
            <p>{story.dateCard.text}</p>
            <p className="driver">{story.dateCard.driver}</p>
            <p className="signoff">{story.dateCard.signoff}</p>
            <div className="final-symbols">❤️ &nbsp; ♾️ &nbsp; ✈️</div>
          </div>
        </Reveal>
      </section>
    );
  }

  const noHidden = noStage >= story.proposal.noStages.length - 1;

  return (
    <section className="proposal-screen" ref={areaRef}>
      <Reveal>
        <p className="proposal-preface">{story.proposal.preface}</p>
        <h2>{story.proposal.question}</h2>
        <div className="proposal-buttons">
          <button
            className="yes-button"
            style={{ transform: `scale(${1 + noStage * 0.08})` }}
            onClick={() => setAccepted(true)}
          >
            {story.proposal.yes}
          </button>
          {!noHidden && (
            <button
              className="no-button"
              onPointerEnter={moveNo}
              onPointerDown={(e) => {
                e.preventDefault();
                moveNo();
              }}
              onClick={(e) => {
                e.preventDefault();
                moveNo();
              }}
              style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
            >
              {story.proposal.noStages[noStage]}
            </button>
          )}
        </div>
        {noHidden && <p className="only-option">Ну вот. Теперь всё правильно 🤍</p>}
      </Reveal>
    </section>
  );
}

export default function AnniversaryStory() {
  const [started, setStarted] = useState(false);

  return (
    <main>
      <section className="hero">
        <FloatingSymbols />
        <div className="hero-content">
          <div className="mini-route">{story.intro.eyebrow}</div>
          <div className="plane-orbit" aria-hidden="true"><span>✈️</span></div>
          <p className="hero-date">{story.dates.met}</p>
          <h1>{story.intro.title}</h1>
          <p className="hero-text">{story.intro.text}</p>
          <button className="start-button" onClick={() => {
            setStarted(true);
            document.getElementById("story")?.scrollIntoView({ behavior: "smooth" });
          }}>
            Начать нашу историю
            <span>↓</span>
          </button>
        </div>
      </section>

      <section id="story" className={`story-section ${started ? "started" : ""}`}>
        {story.chapters.map((chapter, index) => (
          <article className="chapter" key={chapter.title}>
            <Reveal className="chapter-inner">
              <span className="chapter-index">0{index + 1}</span>
              <div className="chapter-symbol">{chapter.symbol}</div>
              <p className="chapter-kicker">{chapter.kicker}</p>
              <h2>{chapter.title}</h2>
              <p className="chapter-text">{chapter.text}</p>
              {index < story.chapters.length - 1 && <div className="thread" aria-hidden="true" />}
            </Reveal>
          </article>
        ))}
      </section>

      <section className="reflection-section">
        <Reveal>
          <p className="tiny">21.08.2023 → ♾️</p>
          <h2>{story.reflection.title}</h2>
          <div className="reflection-lines">
            {story.reflection.lines.map((line, index) => (
              <span key={line} style={{ animationDelay: `${index * 120}ms` }}>{line}</span>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="world-section">
        <Reveal>
          <div className="world-symbols">❤️ &nbsp; ♾️ &nbsp; ✈️</div>
          <h2>{story.world.title}</h2>
          <p className="world-copy">{story.world.text}</p>
          <div className="route-line">
            {story.world.route.map((place, index) => (
              <div className="route-stop" key={place}>
                <span className="dot" />
                <span>{place}</span>
                {index < story.world.route.length - 1 && <i>→</i>}
              </div>
            ))}
          </div>
        </Reveal>
        <SecretHeart />
      </section>

      <Proposal />
    </main>
  );
}
