import React from "react";

/**
 * GermanText component
 * Wraps German target language words, sentences, or phrases in <bdi dir="ltr">
 * with unicode-bidi: isolate so they are never incorrectly reordered or flipped
 * when rendered inside an Arabic / RTL layout.
 */
export function GermanText({ children, className = "", as: Component = "span", ...rest }) {
  if (children === null || children === undefined) return null;

  return (
    <Component
      dir="ltr"
      className={`[unicode-bidi:isolate] text-left ${className}`}
      {...rest}
    >
      <bdi dir="ltr">{children}</bdi>
    </Component>
  );
}

export default GermanText;
