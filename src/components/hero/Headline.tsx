/**
 * The hero headline.
 *
 * Rendered as one `<h1>` whose accessible name comes from `aria-label`, so screen
 * readers announce "Welcome Itz Fizz" as a single phrase. The individual letter
 * spans exist only for the per-letter stagger, hence `aria-hidden` on the words.
 */
const HEADLINE_TEXT = "WELCOME ITZ FIZZ";
const HEADLINE_WORDS = HEADLINE_TEXT.split(" ");

type HeadlineProps = {
  /** Applied to the `<h1>` so the section can reference it via aria-labelledby. */
  id?: string;
};

export function Headline({ id }: HeadlineProps) {
  return (
    <h1
      id={id}
      aria-label="Welcome Itz Fizz"
      data-headline
      className="flex flex-wrap items-center justify-center gap-x-[0.55em] gap-y-[0.14em] text-center text-[clamp(1.3rem,5.2vw,4.25rem)] leading-none font-semibold tracking-[0.28em] text-white will-change-transform"
    >
      {HEADLINE_WORDS.map((word, wordIndex) => (
        <span
          key={wordIndex}
          aria-hidden="true"
          data-word
          // Pull back the trailing letter-spacing so word gaps stay optically even.
          className="-mr-[0.28em] inline-flex"
        >
          {Array.from(word).map((letter, letterIndex) => (
            <span
              key={letterIndex}
              data-letter
              // Only these layers animate, so only these get a compositor hint.
              className="inline-block will-change-transform"
            >
              {letter}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
