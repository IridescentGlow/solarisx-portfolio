import { Link, useParams } from "react-router-dom";
import { projects } from "../constants";

// Functional foundation for docs/design/PROJECT_PAGE_SYSTEM.md's
// /projects/:slug depth layer: route resolution, data lookup, and an
// invalid-slug fallback. Deliberately plain markup — the visual design (§4
// section structure, media handling, motion) is a separate pass, and per §7
// a route change authors no transition, so no motion system is pulled in
// here.
const ProjectPage = () => {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);
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

  return (
    <main className="min-h-screen px-10 py-24 text-white bg-[var(--color-bg-base)]">
      <Link
        to="/"
        className="inline-block mb-12 text-sm uppercase tracking-widest text-[var(--color-text-tertiary)] transition-colors hover:text-white"
      >
        ← Back to Works
      </Link>

      <h1 className="text-4xl font-light md:text-5xl">{project.name}</h1>

      <div className="flex flex-wrap gap-4 mt-4 text-xs tracking-wider uppercase text-[var(--color-text-tertiary)]">
        <span>{project.role}</span>
        <span>{project.year}</span>
      </div>

      <p className="max-w-3xl mt-8 text-base text-[var(--color-text-secondary)]">
        {project.outcome}
      </p>

      <div className="flex flex-wrap mt-8 text-xs leading-loose tracking-wider uppercase gap-x-5">
        {project.stack.map((tech) => (
          <p key={tech}>{tech}</p>
        ))}
      </div>

      <div className="flex gap-6 mt-8 text-sm tracking-widest uppercase">
        {project.liveHref && (
          <a
            href={project.liveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] transition-colors hover:text-white"
          >
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

      {/* This branch just says so rather than inventing depth content. */}
      {!hasCaseStudyContent && (
        <p className="mt-16 text-sm italic text-[var(--color-text-tertiary)]">
          Full case study not yet published.
        </p>
      )}
    </main>
  );
};

export default ProjectPage;
