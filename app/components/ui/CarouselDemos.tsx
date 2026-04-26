"use client";
import React from "react";

const videos = [
  { src: "/images/pages/demo2.mp4", poster: "" },
  { src: "/images/pages/demo.mp4", poster: "" },
  { src: "https://media.w3.org/2010/05/sintel/trailer.mp4", poster: "https://images.unsplash.com/photo-1535016120720-40c7467d5283?w=800" },
  { src: "https://www.w3schools.com/html/mov_bbb.mp4", poster: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800" },
  { src: "https://media.w3.org/2010/05/sintel/trailer.mp4", poster: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800" },
  { src: "https://www.w3schools.com/html/mov_bbb.mp4", poster: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800" },
  { src: "https://media.w3.org/2010/05/sintel/trailer.mp4", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800" },
  { src: "https://www.w3schools.com/html/mov_bbb.mp4", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800" },
];

const images = [
  { src: "/images/pages/lovable.avif", alt: "Lovable" },
  { src: "/images/pages/vegetative.avif", alt: "Vegetative" },
  { src: "/images/pages/crafter.avif", alt: "Crafter" },
  { src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", alt: "City" },
  { src: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800", alt: "Architecture" },
  { src: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800", alt: "Building" },
  { src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800", alt: "Mountain" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800", alt: "Nature" },
  { src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800", alt: "Landscape" },
  { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800", alt: "Forest" },
  { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800", alt: "Trees" },
  { src: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800", alt: "Woods" },
];

export function CarouselDemos() {
  return (
    <section className="w-full relative">
      <style>{`
        .scene-3d {
          width: 100%;
          height: 70vh; 
          min-height: 800px;
          display: grid;
          overflow: hidden;
          perspective: 70em;
          font-size: clamp(12px, 1.2vw, 25px); 
          mask: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
          -webkit-mask: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
        }
        .a3d-container {
          grid-area: 1/1;
          place-self: center;
          transform-style: preserve-3d;
          animation: ry 40s linear infinite;
          display: grid;
        }
        @keyframes ry {
          to { transform: rotateY(1turn); }
        }
        .row-videos {
          translate: 0 -7.5em; 
        }
        .row-videos .card-3d {
          --w: 32em;
          aspect-ratio: 16/9;
        }
        .row-images {
          translate: 0 12em;
          animation-direction: reverse;
          animation-duration: 50s;
        }
        .row-images .card-3d {
          --w: 28em;
          aspect-ratio: 16/9;
        }
        .card-3d {
          --ba: calc(1turn / var(--n));
          grid-area: 1/1;
          width: var(--w);
          object-fit: cover;
          border-radius: 1rem;
          backface-visibility: hidden;
          box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.9);
          transform: rotateY(calc(var(--i) * var(--ba))) 
                     translateZ(calc(-1 * (0.5 * var(--w) + 1.5em) / Math.tan(0.5 * var(--ba))));
          transform: rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * (0.5 * var(--w) + 1.5em) / tan(0.5 * var(--ba))));
        }
        @media (prefers-reduced-motion: reduce) {
          .a3d-container { animation-duration: 120s; }
        }
      `}</style>

      <div className="scene-3d">
        <div className="a3d-container row-videos" style={{ "--n": videos.length } as React.CSSProperties}>
          {videos.map((vid, index) => (
            <video
              key={`video-${index}`}
              className="card-3d max-w-none bg-zinc-900 border border-white/10"
              style={{ "--i": index } as React.CSSProperties}
              autoPlay
              loop
              muted
              playsInline
              src={vid.src}
              poster={vid.poster}
            />
          ))}
        </div>

        <div className="a3d-container row-images" style={{ "--n": images.length } as React.CSSProperties}>
          {images.map((img, index) => (
            <img
              key={`img-${index}`}
              className="card-3d max-w-none bg-zinc-900 border border-white/10"
              style={{ "--i": index } as React.CSSProperties}
              src={img.src}
              alt={img.alt}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}