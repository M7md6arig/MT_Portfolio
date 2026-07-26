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
 *   - Map.prototype.getOrInsertComputed() from many call sites — font
 *     handling (this.fonts.getOrInsertComputed(...) in getPdfFont), struct
 *     tree parsing, annotations, XFA processing, cipher resolution, and
 *     more (see the second polyfill). This one is real-world-confirmed:
 *     the exact "getOrInsertComputed is not a function" crash was hit by
 *     an actual uploaded PDF ("Presentation.pdf") that failed to preview
 *     on every page. Not every embedded-font PDF hits it, though — a
 *     synthetic multi-page test PDF (Chromium print-to-PDF, embedded
 *     subset fonts, gradients, blend-mode transparency) rendered every
 *     page fine even with this method forcibly removed, so the exact
 *     triggering call site depends on the file's specific structure
 *     (most likely something the simple test file didn't have, e.g. a
 *     struct tree/accessibility tags, annotations, or XFA content).
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
