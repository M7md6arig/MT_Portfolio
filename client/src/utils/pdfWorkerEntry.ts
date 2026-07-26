/**
 * Loaded AS the pdf.js worker itself (see PdfPageSelector's
 * GlobalWorkerOptions.workerSrc), instead of pointing straight at
 * pdfjs-dist's own pdf.worker.min.mjs.
 *
 * pdf.worker.min.mjs (pdfjs-dist 6.x) calls the native
 * Uint8Array.prototype.toHex() while computing a document's "fingerprint" —
 * a TC39 Uint8Array-to/from-hex method that only recently landed in browser
 * engines. Any browser whose JS engine predates it throws "a.toHex is not a
 * function" the instant ANY PDF is opened (the fingerprint is computed
 * unconditionally for every document, so this isn't specific to one file's
 * content). A Worker has its own separate JS realm from the main thread, so
 * polyfilling only on the page would never reach pdf.js running in here —
 * this file exists purely to install the polyfill into the worker's own
 * global scope before pdf.worker.min.mjs's own code runs.
 */
type Uint8ArrayWithToHex = Uint8Array & { toHex?: () => string };

const proto = Uint8Array.prototype as Uint8ArrayWithToHex;
if (typeof proto.toHex !== "function") {
  proto.toHex = function toHex(this: Uint8Array): string {
    let hex = "";
    for (let i = 0; i < this.length; i++) {
      hex += this[i].toString(16).padStart(2, "0");
    }
    return hex;
  };
}

import "pdfjs-dist/build/pdf.worker.min.mjs";
