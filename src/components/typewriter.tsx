"use client";

import { useEffect, useState } from "react";

// Types each word, pauses, deletes it, then moves on to the next one in a loop.
// Give it a `key` that changes with the word list to restart from the first word.
export function Typewriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    const done = !deleting && text === word;
    const cleared = deleting && text === "";

    const delay = done ? 1600 : deleting ? 40 : 80;
    const timer = setTimeout(() => {
      if (done) return setDeleting(true);
      if (cleared) {
        setDeleting(false);
        return setIndex((i) => i + 1);
      }
      setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(timer);
  }, [text, deleting, index, words]);

  return (
    <span aria-label={words.join(", ")}>
      <span aria-hidden="true">{text}</span>
      <span aria-hidden="true" className="ml-0.5 inline-block w-[0.6ch] animate-pulse bg-accent">
        &nbsp;
      </span>
    </span>
  );
}
