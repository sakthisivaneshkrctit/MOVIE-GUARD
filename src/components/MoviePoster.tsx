import React, { useState } from 'react';
import { POSTER_ART } from '../data/posterArt';

interface MoviePosterProps {
  title: string;
  posterUrl: string;
  className?: string;
  alt?: string;
}

export const MoviePoster: React.FC<MoviePosterProps> = ({
  title,
  posterUrl,
  className = 'w-full h-full object-cover',
  alt,
}) => {
  const [hasError, setHasError] = useState(false);

  // Match the title to the vector poster artwork
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');

  let vectorArt: string | null = null;
  if (normalizedTitle.includes('coolie')) {
    vectorArt = POSTER_ART.coolie;
  } else if (normalizedTitle.includes('jananayan') || normalizedTitle.includes('jananayagan')) {
    vectorArt = POSTER_ART.janaNayagan;
  } else if (normalizedTitle.includes('goodbadugly')) {
    vectorArt = POSTER_ART.goodBadUgly;
  } else if (normalizedTitle.includes('jailer')) {
    vectorArt = POSTER_ART.jailer;
  } else if (normalizedTitle.includes('karuppu')) {
    vectorArt = POSTER_ART.karuppu;
  } else if (normalizedTitle.includes('dude')) {
    vectorArt = POSTER_ART.dude;
  }

  // If posterUrl is already a vector artwork or data URI, display it
  const displaySrc = (!hasError && posterUrl) ? posterUrl : (vectorArt || posterUrl);

  return (
    <img
      src={displaySrc}
      alt={alt || title}
      className={className}
      onError={() => {
        if (!hasError && vectorArt) {
          setHasError(true);
        }
      }}
      loading="lazy"
    />
  );
};
