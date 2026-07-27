import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "./lightbox-theme.css";

interface ProjectLightboxProps {
  slides: { src: string; alt?: string }[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

/** Same glyphs as ProjectModal's own prev/next arrows and Modal's own close X. */
function NavIcon({ d }: { d: string }) {
  return (
    <svg width="11" height="19" viewBox="0 0 9 16" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Fullscreen zoom/pan layer over ProjectModal's gallery image — lazy-loaded
 * (see ProjectModal's dynamic import) so the library and its CSS never load
 * until a visitor actually clicks the main image.
 */
export default function ProjectLightbox({ slides, index, open, onClose, onIndexChange }: ProjectLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={slides}
      index={index}
      plugins={[Zoom]}
      on={{ view: ({ index: i }) => onIndexChange(i) }}
      zoom={{
        maxZoomPixelRatio: 2,
        scrollToZoom: true,
        doubleClickMaxStops: 2,
      }}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      animation={{
        fade: 300,
        swipe: 300,
        easing: {
          fade: "cubic-bezier(0.22, 1, 0.36, 1)",
          swipe: "cubic-bezier(0.22, 1, 0.36, 1)",
          navigation: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      }}
      styles={{ root: { "--yarl__portal_zindex": 100 } }}
      labels={{ Previous: "Previous image", Next: "Next image", Close: "Close lightbox" }}
      render={{
        iconPrev: () => <NavIcon d="M8 1L1 8l7 7" />,
        iconNext: () => <NavIcon d="M1 1l7 7-7 7" />,
        iconClose: CloseIcon,
      }}
    />
  );
}
