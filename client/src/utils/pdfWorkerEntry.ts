/**
 * Loaded AS the pdf.js worker itself (see PdfPageSelector's
 * GlobalWorkerOptions.workerSrc), instead of pointing straight at
 * pdfjs-dist's own pdf.worker.min.mjs.
 *
 * pdf.worker.min.mjs (pdfjs-dist 6.x) calls several very recently
 * standardized JS engine methods that older browsers don't have yet. Each
 * one throws a crash matching the pattern "<x> is not a function" the
 * moment pdf.js's code path that uses it runs:
 *   - Uint8Array.prototype.toHex() unconditionally, for every document, in
 *     the fingerprints getter (see the first polyfill below).
 *   - Map.prototype.getOrInsertComputed() from many call sites, all on
 *     genuine `new Map()` instances (confirmed directly in the installed
 *     package's source — e.g. `class CipherTransform{#Xt=new Map...}`,
 *     `class FontFinder{constructor(e){this.fonts=new Map...}}` — not a
 *     custom pdfjs-internal collection class with its own unrelated
 *     method of the same name). Real-world-confirmed: an actual uploaded
 *     PDF ("Presentation.pdf") failed to preview on every page with
 *     exactly this error. The specific call site is `addPdfFont`, which
 *     builds its fallback font from a literal "PdfJS-Fallback-PdfJS-XFA"
 *     — i.e. this is XFA (Adobe's XML Forms Architecture) font handling,
 *     not a generic embedded-font path. That lines up with two other
 *     synthetic multi-page PDFs (a plain text license doc, and a Chromium
 *     print-to-PDF export with embedded subset fonts, gradients, and
 *     blend-mode transparency) never hitting this code path at all, with
 *     or without the method present — neither contains XFA content.
 * Which of the two crashes first, and for which files, depends on both the
 * browser and the PDF's own content. A Worker has its own separate JS realm
 * from the main thread, so polyfilling only on the page would never reach
 * pdf.js running in here — this file exists purely to install these
 * polyfills into the worker's own global scope before pdf.worker.min.mjs's
 * own code runs.
 */
type Uint8ArrayWithToHex = Uint8Array & { toHex?: () => string };

const u8proto = Uint8Array.prototype as Uint8ArrayWithToHex;
if (typeof u8proto.toHex !== "function") {
  u8proto.toHex = function toHex(this: Uint8Array): string {
    let hex = "";
    for (let i = 0; i < this.length; i++) {
      hex += this[i].toString(16).padStart(2, "0");
    }
    return hex;
  };
}

/**
 * Map/WeakMap.prototype.getOrInsertComputed(key, callbackfn): if the map has
 * an entry for `key`, return its value; otherwise call `callbackfn(key)`,
 * store the result under `key`, and return it. Matches the TC39 proposal's
 * behavior exactly (the callback receives the key, even though every call
 * site in pdf.worker.min.mjs happens to use a zero-argument factory that
 * ignores it — e.g. () => [], () => new Map()).
 */
type GetOrInsertComputed<K, V> = { getOrInsertComputed?: (key: K, callbackfn: (key: K) => V) => V };

function getOrInsertComputedPolyfill<K, V>(
  this: Map<K, V> | WeakMap<K & object, V>,
  key: K,
  callbackfn: (key: K) => V,
): V {
  // `has`/`get`/`set` are shared across Map and WeakMap with identical
  // semantics for this purpose, so one implementation covers both.
  const map = this as unknown as Map<K, V>;
  if (map.has(key)) return map.get(key) as V;
  const value = callbackfn(key);
  map.set(key, value);
  return value;
}

const mapProto = Map.prototype as unknown as GetOrInsertComputed<unknown, unknown>;
if (typeof mapProto.getOrInsertComputed !== "function") {
  mapProto.getOrInsertComputed = getOrInsertComputedPolyfill;
}
const weakMapProto = WeakMap.prototype as unknown as GetOrInsertComputed<object, unknown>;
if (typeof weakMapProto.getOrInsertComputed !== "function") {
  weakMapProto.getOrInsertComputed = getOrInsertComputedPolyfill;
}

import "pdfjs-dist/build/pdf.worker.min.mjs";
