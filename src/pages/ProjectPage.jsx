import { Link, useParams } from "react-router-dom";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { projects } from "../constants";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { AnimatedTextLines } from "../components/AnimatedTextLines";
import { isVideo } from "../lib/media";
import { EASE, DURATION } from "../lib/motion";

// PROJECT_PAGE_SYSTEM.md §4's depth layer. This pass builds the two
// required-for-a-page-to-exist sections — Overview and Media — plus the
// terminal Links section, using only what already exists in
// constants/index.js. Challenge/Approach/Craft/Result/Credits are narrative
// sections with no real content yet (§3: "a page must never invent a
// metric, client, outcome, or award to fill a section"), so they're
// omitted entirely rather than padded with placeholders — consistent with
// §1's restraint principle and §4's "every section is optional."
// Repeated five times below (Challenge/Approach/Craft/Result/Credits) — a
// local, unexported helper rather than a new component file:
// PROJECT_PAGE_SYSTEM.md §5's reuse table doesn't call for one, and nothing
// outside this page needs it (LAW 3's "extract only after repetition
// appears" — it has, but only within this one file).
//
// Heading uses --text-h2, not AnimatedHeaderSection: that component's
// banner-text-responsive display scale (68px–152px) is this page's one big
// title, already used once above for Overview. Repeating it five more times
// down one page would compete with that title rather than support it —
// HIERARCHY_SYSTEM.md §1 is hierarchy through contrast, not repetition.
const CaseStudySection = ({ heading, children }) => (
  <section className="px-10 mt-16 md:mt-24">
    <h2 className="text-white text-h2">{heading}</h2>
    <div className="mt-6">{children}</div>
  </section>
);

const ProjectPage = () => {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);
  const metadataRef = useRef(null);
  const mediaRef = useRef(null);

  // The header (AnimatedHeaderSection) has its own built-in entrance. Below
  // it, metadata/media were rendering statically with no reveal at all —
  // reusing the site's existing curve/duration vocabulary here rather than
  // inventing a new one (§7: "the existing curves and durations... no new
  // easing curve is introduced"). Fires on mount, not on scroll: this is a
  // freshly-opened page, the same situation as Hero, not content scrolled
  // into view — a small delay lets it follow the header rather than
  // competing with it.
  useGSAP(() => {
    if (!metadataRef.current || !mediaRef.current) return;
    const tl = gsap.timeline({ delay: 0.6 });
    tl.from(metadataRef.current, {
      y: 40,
      opacity: 0,
      duration: DURATION.reveal,
      ease: EASE.cinematic,
    });
    tl.from(
      mediaRef.current,
      { y: 40, opacity: 0, duration: DURATION.reveal, ease: EASE.cinematic },
      "<+0.2"
    );
  }, [project]);
  // caseStudy is `{}` (truthy, no keys) once a project's row starts routing
  // here (Works.jsx §3 data-driven check) but before any section content is
  // written — check for actual content, not mere truthiness, so this stays
  // accurate instead of silently going quiet the moment the row switches over.
  const hasCaseStudyContent =
    project && project.caseStudy && Object.keys(project.caseStudy).length > 0;

  if (!project) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-10 text-center text-white bg-[var(--color-bg-base)]">
        <p className="text-sm tracking-widest uppercase text-[var(--color-text-tertiary)]">
          404
        </p>
        <h1 className="text-3xl font-light">Project not found</h1>
        <Link
          to="/"
          className="text-sm uppercase tracking-widest text-[var(--color-accent)] transition-colors hover:text-white"
        >
          Back to Works
        </Link>
      </main>
    );
  }

  // project.name follows a "Product - Qualifier" convention today (e.g.
  // "MediHelp - Award winning Solution"). Splitting it lets the big title
  // stay clean and puts the qualifier in the header's short line instead of
  // forcing the full outcome paragraph through that uppercase display slot —
  // both halves are still the project's own existing name, just in two
  // differently-weighted places rather than one oversized block.
  const [titleMain, titleQualifier] = project.name.split(" - ");

  return (
    <main className="min-h-screen text-white bg-[var(--color-bg-base)]">
      {/* §2: the origin tab is never lost (new-tab rule), so this is only
          for visitors who arrive directly — optional, not primary nav. */}
      <div className="px-10 pt-10">
        <Link
          to="/"
          className="inline-block text-sm uppercase tracking-widest text-[var(--color-text-tertiary)] transition-colors hover:text-white"
        >
          ← Back to Works
        </Link>
      </div>

      {/* Overview — required section. Fires on mount (withScrollTrigger
          false): the page opens already at the top with this in view, same
          situation as Hero on the homepage, not a "scroll into view" case. */}
      <AnimatedHeaderSection
        subTitle="Case Study"
        title={titleMain}
        text={titleQualifier || ""}
        textColor="text-white"
        withScrollTrigger={false}
        // The qualifier ("Award Winning Solution") is a highlighted
        // achievement, not routine header copy — see the gold-shimmer-text
        // utility in index.css for why this is the one place it's used.
        textClassName={titleQualifier ? "gold-shimmer-text" : ""}
      />

      {/* Metadata — role/year sit opposite the stack on desktop, stack
          beneath on mobile (§8's explicit rule). */}
      <div
        ref={metadataRef}
        className="flex flex-col gap-4 px-10 mt-6 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex flex-wrap gap-4 text-xs tracking-wider uppercase text-[var(--color-text-tertiary)]">
          <span>{project.role}</span>
          <span>{project.year}</span>
        </div>
        <div className="flex flex-wrap uppercase gap-x-5 text-xs leading-loose tracking-wider">
          {project.stack.map((tech) => (
            <p key={tech} className="text-[var(--color-text-secondary)]">
              {tech}
            </p>
          ))}
        </div>
      </div>

      {/* The full outcome, at actual reading size — §8 designates
          --text-body-lg for case-study long-form, not the header's display
          type. AnimatedTextLines per §5's own component table ("staggered
          paragraph reveal"); a single unbroken string still gets the fade,
          just without a multi-line stagger since there's only one line. */}
      <AnimatedTextLines
        text={project.outcome}
        className="max-w-[65ch] px-10 mt-10 text-body-lg text-[var(--color-text-secondary)]"
      />

      {/* Media — required section, the visual centrepiece (§1, §6). Framed
          rather than true edge-to-viewport bleed: this clip's own background
          is a light near-white, so an unframed full-bleed treatment would
          fight the page's dark theme instead of sitting inside it. */}
      <div ref={mediaRef} className="px-10 mt-16 md:mt-24">
        <div className="max-w-5xl mx-auto overflow-hidden border-8 rounded-lg border-[var(--color-border)]">
          {isVideo(project.image) ? (
            <video
              src={project.image}
              poster={project.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={`${project.name} preview`}
              className="object-cover w-full aspect-video"
            />
          ) : (
            <img
              src={project.image}
              alt={`${project.name} preview`}
              className="object-cover w-full aspect-video"
            />
          )}
        </div>
      </div>

      {/* §2 The Problem */}
      {project.caseStudy?.challenge && (
        <CaseStudySection heading="Challenge">
          <AnimatedTextLines
            text={project.caseStudy.challenge.text}
            className="max-w-[65ch] text-body-lg text-[var(--color-text-secondary)]"
          />
        </CaseStudySection>
      )}

      {/* §3 Research/Discovery + §4 Design Process, with §7 Challenges
          nested inside (no separate §4 slot exists for it — obstacles
          navigated are part of the thinking this section is defined to
          hold). */}
      {project.caseStudy?.approach && (
        <CaseStudySection heading="Approach">
          <AnimatedTextLines
            text={project.caseStudy.approach.text}
            className="max-w-[65ch] text-body-lg text-[var(--color-text-secondary)]"
          />
          {project.caseStudy.approach.challenges && (
            <div className="mt-10">
              <h3 className="text-white text-h3">Challenges</h3>
              <AnimatedTextLines
                text={project.caseStudy.approach.challenges}
                className="max-w-[65ch] mt-4 text-body-lg text-[var(--color-text-secondary)]"
              />
            </div>
          )}
        </CaseStudySection>
      )}

      {/* §5 Development + §6 My Role, plus the gallery — the visual
          centrepiece (§1). Uniform grid, not a lead-plus-set layout: these
          screenshots are evidence presented as a set, not a sequence with
          one dominant item (COMPOSITION_PRINCIPLES.md §2's "grid symmetry
          signals a set"). No lightbox/carousel/zoom — a plain grid passes
          PROJECT_PAGE_SYSTEM.md §6 without needing one.

          Quality note, left rather than hidden (this milestone's explicit
          instruction): features.webp and who-we-are.webp contain unedited
          template placeholder copy unrelated to MediHelp; find-doctor.webp
          and symptom-checker.webp show a Windows-activation watermark from
          the capture environment; the "Sign Up" tile's source file is named
          login.webp even though it shows the sign-up form — captioned by
          actual content here, not by filename. None of this is cropped,
          edited, or hidden in the images themselves.

          Breakpoint: md, not sm — the metadata row above is this page's
          only other responsive split and uses md:flex-row. Grid columns
          switching a tier earlier (at sm, 640px) would put a genuine
          tablet-width visitor in a state PROJECT_PAGE_SYSTEM.md §8 doesn't
          define: multi-column media next to still-single-column text.
          Verified visually at 700px (sm–md gap) before settling on md. */}
      {project.caseStudy?.craft && (
        <CaseStudySection heading="Craft">
          {project.caseStudy.craft.development && (
            <AnimatedTextLines
              text={project.caseStudy.craft.development}
              className="max-w-[65ch] text-body-lg text-[var(--color-text-secondary)]"
            />
          )}
          {project.caseStudy.craft.myRole && (
            <div className="mt-10">
              <h3 className="text-white text-h3">My Role</h3>
              <AnimatedTextLines
                text={project.caseStudy.craft.myRole}
                className="max-w-[65ch] mt-4 text-body-lg text-[var(--color-text-secondary)]"
              />
            </div>
          )}
          {project.caseStudy.craft.gallery?.length > 0 && (
            <div className="grid grid-cols-1 gap-4 mt-12 md:grid-cols-2 lg:grid-cols-3">
              {project.caseStudy.craft.gallery.map((item) => (
                <figure
                  key={item.src}
                  className="overflow-hidden transition-colors border-2 rounded-lg border-[var(--color-border)] hover:border-[var(--color-accent)]"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="object-cover w-full aspect-video"
                  />
                  <figcaption className="px-4 py-3 text-xs tracking-wider uppercase text-[var(--color-text-tertiary)]">
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </CaseStudySection>
      )}

      {/* §9 Final Outcome + §8 Award, nested here per §9's own "(see §8)"
          cross-reference rather than inventing an 8th top-level section
          PROJECT_PAGE_SYSTEM.md §4 doesn't define. */}
      {project.caseStudy?.result && (
        <CaseStudySection heading="Result">
          <AnimatedTextLines
            text={project.caseStudy.result.text}
            className="max-w-[65ch] text-body-lg text-[var(--color-text-secondary)]"
          />
          {project.caseStudy.result.award && (
            <div className="mt-10">
              <h3 className="text-white text-h3">Award</h3>
              <AnimatedTextLines
                text={project.caseStudy.result.award.text}
                className="max-w-[65ch] mt-4 text-body-lg text-[var(--color-text-secondary)]"
              />
              <div className="grid max-w-3xl grid-cols-1 gap-4 mt-6 md:grid-cols-2">
                <div className="overflow-hidden border-2 rounded-lg border-[var(--color-border)]">
                  <img
                    src={project.caseStudy.result.award.certificate}
                    alt="AASTU Tech Fest 2025 Hackathon — First Place Winner's Prize certificate, awarded to MediHelp Plus"
                    loading="lazy"
                    className="object-cover w-full aspect-video"
                  />
                </div>
                <div className="overflow-hidden border-2 rounded-lg border-[var(--color-border)]">
                  <img
                    src={project.caseStudy.result.award.ceremony}
                    alt="MediHelp team at the AASTU Tech Fest 2025 award ceremony"
                    loading="lazy"
                    className="object-cover w-full aspect-video"
                  />
                </div>
              </div>
            </div>
          )}
        </CaseStudySection>
      )}

      {/* §5's team structure. Individual teammates beyond the creator's own
          role are never named in the case study — not invented here. */}
      {project.caseStudy?.credits && (
        <CaseStudySection heading="Credits">
          <AnimatedTextLines
            text={project.caseStudy.credits.text}
            className="max-w-[65ch] text-body-lg text-[var(--color-text-secondary)]"
          />
        </CaseStudySection>
      )}

      {/* This branch just says so rather than inventing depth content. */}
      {!hasCaseStudyContent && (
        <p className="max-w-5xl px-10 mx-auto mt-8 text-sm italic text-[var(--color-text-tertiary)]">
          Full case study not yet published.
        </p>
      )}

      {/* Links — terminal position, fixed by §4: links leave, they don't
          lead, so nothing follows this section. */}
      <div className="flex gap-8 px-10 py-16 mt-16 text-sm tracking-widest uppercase md:py-24">
        {project.liveHref && (
          <a
            href={project.liveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[var(--color-accent)] transition-colors hover:text-white"
          >
            {/* MediHelp's own brand favicon (distinct mark from logo.png —
                see the case study's Media section) — a small, functional
                use: confirms which product the link leads to, the same job
                a browser tab favicon does. */}
            {project.caseStudy?.favicon && (
              <img
                src={project.caseStudy.favicon}
                alt=""
                aria-hidden="true"
                className="size-4"
              />
            )}
            Live ↗
          </a>
        )}
        {project.repoHref && (
          <a
            href={project.repoHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] transition-colors hover:text-white"
          >
            Code ↗
          </a>
        )}
      </div>
    </main>
  );
};

export default ProjectPage;
