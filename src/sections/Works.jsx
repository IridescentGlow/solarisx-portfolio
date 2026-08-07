import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useNavigate } from "react-router-dom";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { projects } from "../constants";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { EASE, DURATION } from "../lib/motion";
import { isVideo } from "../lib/media";

const Works = () => {
  const navigate = useNavigate();
  const overlayRefs = useRef([]);
  const burstRefs = useRef([]);
  const previewRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(null);
  const text = `Selected work — what it was,
    what I shaped,
    and what it became.`;

  const mouse = useRef({ x: 0, y: 0 });
  const moveX = useRef(null);
  const moveY = useRef(null);

  useGSAP(() => {
    moveX.current = gsap.quickTo(previewRef.current, "x", {
      duration: 1.5,
      ease: "power3.out",
    });
    moveY.current = gsap.quickTo(previewRef.current, "y", {
      duration: 2,
      ease: "power3.out",
    });

    gsap.from("#project", {
      y: 100,
      opacity: 0,
      delay: 0.5,
      duration: DURATION.reveal,
      stagger: 0.3,
      ease: EASE.cinematic,
      scrollTrigger: {
        trigger: "#project",
      },
    });
  }, []);

  const handleMouseEnter = (index) => {
    if (window.innerWidth < 768) return;
    setCurrentIndex(index);

    const el = overlayRefs.current[index];
    if (!el) return;

    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      {
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
      },
      {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
        duration: 0.15,
        ease: "power2.out",
      }
    );

    gsap.to(previewRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (index) => {
    if (window.innerWidth < 768) return;
    setCurrentIndex(null);

    const el = overlayRefs.current[index];
    if (!el) return;

    gsap.killTweensOf(el);
    gsap.to(el, {
      clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
      duration: 0.2,
      ease: "power2.in",
    });

    gsap.to(previewRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;
    mouse.current.x = e.clientX + 24;
    mouse.current.y = e.clientY + 24;
    moveX.current(mouse.current.x);
    moveY.current(mouse.current.y);
  };

  // A modified click (ctrl/cmd/shift/middle-click) is a request for native
  // behavior — e.g. "open in a new tab" — and must be left alone.
  const isModifiedClick = (e) =>
    e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

  // Root cause (confirmed against react-router's source): Link's own click
  // handler runs ours first, then — since nothing prevented it — synchronously
  // calls preventDefault()+navigate() in the same event. React's route swap
  // (internal) or the new tab opening (external) both happen before the
  // browser gets a chance to paint a single frame, so the burst — though
  // genuinely created and started — is never actually seen.
  //
  // Fix: spawn and start the burst first, then delay the actual navigation
  // just long enough to guarantee a paint before it happens. 150ms is enough
  // to see it and short enough to still read as instant (per the debug
  // follow-up; the animation itself is unchanged).
  const NAVIGATION_DELAY_MS = 150;

  // Cinematic timing for the burst itself. Kept well clear of the 150ms
  // navigation delay above: the deceleration curve is heavily front-loaded,
  // so by 150ms the flash has already landed and the expansion is well
  // underway, even for the internal-navigation case where the page unmounts
  // before the full 0.65s has played out.
  const BURST_FLASH_DURATION = 0.12;
  const BURST_DURATION = 0.8;

  const handleRowClick = (e, index, project) => {
    const container = burstRefs.current[index];
    if (container) {
      const rect = container.getBoundingClientRect();
      const burst = document.createElement("span");
      burst.className = "click-burst";
      container.appendChild(burst);

      gsap.set(burst, {
        left: e.clientX - rect.left,
        top: e.clientY - rect.top,
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 0,
      });

      const tl = gsap.timeline({ onComplete: () => burst.remove() });
      // 1. Initial bright flash — opacity snaps up quickly so the click
      //    registers immediately, while the expansion is already beginning.
      tl.to(burst, {
        opacity: 0.85,
        duration: BURST_FLASH_DURATION,
        ease: "power1.out",
      });
      // 2. Smooth outward expansion — the site's own weighted-deceleration
      //    curve (fast start, long gentle tail), so growth never looks like
      //    a sudden pop.
      tl.to(
        burst,
        { scale: 16, duration: BURST_DURATION, ease: EASE.cinematic },
        0
      );
      // 3. Soft fade, picking up once the flash has landed and sharing the
      //    same curve so it tapers off rather than cutting out abruptly.
      tl.to(
        burst,
        {
          opacity: 0,
          duration: BURST_DURATION - BURST_FLASH_DURATION,
          ease: EASE.cinematic,
        },
        BURST_FLASH_DURATION
      );
    }

    if (isModifiedClick(e)) return;

    e.preventDefault();
    // Internal case studies now navigate in the SAME tab (client-side, via
    // react-router's navigate()) so the burst is seen on the page it was
    // clicked from, then the route changes underneath it. ScrollToTop
    // (mounted in App.jsx) resets scroll position on every route change, so
    // this doesn't reintroduce the earlier "opens halfway down" bug.
    // External links still open in a new tab — unrelated browsing context,
    // nothing to scroll-reset or navigate() there.
    window.setTimeout(() => {
      if (project.caseStudy) {
        navigate(`/projects/${project.slug}`);
      } else if (project.liveHref) {
        window.open(project.liveHref, "_blank", "noopener,noreferrer");
      }
    }, NAVIGATION_DELAY_MS);
  };

  return (
    <section id="work" className="flex flex-col min-h-screen">
      <AnimatedHeaderSection
        subTitle={"Evidence before claims"}
        title={"Works"}
        text={text}
        textColor={"text-white"}
        withScrollTrigger={true}
      />
      <div
        className="relative flex flex-col font-light"
        onMouseMove={handleMouseMove}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            id="project"
            className="relative flex flex-col gap-1 py-5 cursor-pointer group md:gap-0"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            {/* overlay */}
            <div
              ref={(el) => {
                overlayRefs.current[index] = el;
              }}
              className="absolute inset-0 hidden md:block duration-200 bg-[var(--color-surface-2)] -z-10 clip-path"
            />

            {/* click-feedback layer — its own overflow-hidden box, not the
                row's, so the burst stays "clipped to the project row"
                without clipping the trophy's intentional escape above it. */}
            <div
              ref={(el) => {
                burstRefs.current[index] = el;
              }}
              aria-hidden="true"
              className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            />

            {/* award treatment — MediHelp only. Hover-revealed and
                pointer-events-none, so it never shifts layout or affects
                other rows; hidden entirely at rest, unlike the featured
                row's persistent gold divider, so it stays subordinate. */}
            {project.id === 3 && (
              <div
                aria-hidden="true"
                className="absolute right-8 md:right-14 top-1/2 -translate-y-[60%] z-10 hidden md:block pointer-events-none opacity-0 scale-90 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:animate-trophy-glow"
              >
                <Icon
                  icon="mdi:trophy"
                  className="size-[72px] md:size-[104px] text-[var(--color-accent)]"
                />
                {/* first-place mark — small, outlined, deliberately quieter
                    than the trophy itself */}
                <span className="absolute -bottom-1 -right-2 rounded-full border border-[var(--color-accent)] bg-[var(--color-bg-base)] px-1.5 py-0.5 text-[9px] md:text-[10px] font-semibold leading-none tracking-tight text-[var(--color-accent)]">
                  1st
                </span>
              </div>
            )}

            {/* title — internal /projects/:slug once a project has a
                caseStudy (PROJECT_PAGE_SYSTEM.md §3); external liveHref
                otherwise. Data-driven: future projects switch automatically
                the moment their caseStudy is populated, no code change here.
                z-[1] keeps the text above the click-burst layer (z-0). */}
            {(() => {
              const titleClassName =
                "relative z-[1] flex items-start justify-between gap-6 px-10 text-white transition-all duration-500 md:group-hover:px-12 md:group-hover:text-white";
              const titleContent = (
                <>
                  <h2 className="lg:text-[32px] text-[26px] leading-none">
                    {project.name}
                  </h2>
                  <div className="flex items-center gap-4 text-xs tracking-wider uppercase shrink-0 text-[var(--color-text-tertiary)]">
                    <span className="hidden sm:inline">{project.role}</span>
                    <span className="hidden sm:inline">{project.year}</span>
                    <Icon
                      icon="lucide:arrow-up-right"
                      className="text-white md:size-6 size-5"
                    />
                  </div>
                </>
              );

              return project.caseStudy ? (
                <Link
                  to={`/projects/${project.slug}`}
                  onClick={(e) => handleRowClick(e, index, project)}
                  className={titleClassName}
                >
                  {titleContent}
                </Link>
              ) : (
                <a
                  href={project.liveHref || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleRowClick(e, index, project)}
                  className={titleClassName}
                >
                  {titleContent}
                </a>
              );
            })()}
            {/* outcome */}
            <p className="max-w-3xl px-10 mt-2 mb-3 text-sm transition-all duration-500 md:text-base text-[var(--color-text-secondary)] md:group-hover:px-12">
              {project.outcome}
            </p>
            {/* divider — accent under the featured (lead) row */}
            <div
              className={`w-full h-0.5 ${
                project.featured
                  ? "bg-[var(--color-accent)]"
                  : "bg-[var(--color-border)]"
              }`}
            />
            {/* stack */}
            <div className="flex px-10 text-xs leading-loose uppercase transtion-all duration-500 md:text-sm gap-x-5 md:group-hover:px-12">
              {project.stack.map((tech) => (
                <p
                  key={tech}
                  className="text-white transition-colors duration-500 md:group-hover:text-white"
                >
                  {tech}
                </p>
              ))}
            </div>
            {/* mobile preview image */}
            <div className="relative flex items-center justify-center px-10 md:hidden h-[400px]">
              <img
                src={project.bgImage}
                alt={`${project.name}-bg-image`}
                className="object-cover w-full h-full rounded-md brightness-50"
              />
              {isVideo(project.image) ? (
                <video
                  src={project.image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={`${project.name} preview`}
                  className="absolute bg-center px-14 rounded-xl"
                />
              ) : (
                <img
                  src={project.image}
                  alt={`${project.name}-image`}
                  className="absolute bg-center px-14 rounded-xl"
                />
              )}
            </div>
          </div>
        ))}
        {/* desktop Flaoting preview image */}
        <div
          ref={previewRef}
          className="fixed -top-2/6 left-0 z-50 overflow-hidden border-8 border-[var(--color-border)] pointer-events-none w-[960px] md:block hidden opacity-0"
        >
          {currentIndex !== null &&
            (isVideo(projects[currentIndex].image) ? (
              // key remounts the element on hover change; swapping src alone
              // does not reliably restart playback.
              <video
                key={projects[currentIndex].image}
                src={projects[currentIndex].image}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${projects[currentIndex].name} preview`}
                className="object-cover w-full h-full"
              />
            ) : (
              <img
                key={projects[currentIndex].image}
                src={projects[currentIndex].image}
                alt="preview"
                className="object-cover w-full h-full"
              />
            ))}
        </div>
      </div>
    </section>
  );
};

export default Works;
