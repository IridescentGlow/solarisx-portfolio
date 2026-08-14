import { useRef, useState } from "react";

// Server-side validation in api/contact.mjs is the real gate — these mirror
// it only so the visitor gets feedback before a round trip.
const LIMITS = { name: 100, email: 254, messageMin: 10, messageMax: 2000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldErrors = (name, email, message) => {
  const errors = {};
  if (!name.trim()) errors.name = "Name is required.";
  else if (name.length > LIMITS.name) errors.name = "Name is too long.";

  if (!email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  if (!message.trim()) errors.message = "Message is required.";
  else if (message.trim().length < LIMITS.messageMin) {
    errors.message = `Message should be at least ${LIMITS.messageMin} characters.`;
  } else if (message.length > LIMITS.messageMax) {
    errors.message = "Message is too long.";
  }
  return errors;
};

const inputClasses =
  "w-full bg-surface-1 border rounded-sm px-4 py-3 text-body text-ink " +
  "placeholder:text-text-tertiary transition-colors duration-150 ease-precise " +
  "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-accent";

const Field = ({ id, label, error, as = "input", ...props }) => {
  const Tag = as;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-label uppercase tracking-[0.12em] text-text-tertiary"
      >
        {label}
      </label>
      <Tag
        id={id}
        className={`${inputClasses} ${
          error ? "border-state-error" : "border-border focus:border-accent"
        }`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-body-sm text-state-error">
          {error}
        </p>
      )}
    </div>
  );
};

const ContactForm = () => {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [serverError, setServerError] = useState("");
  const mountedAt = useRef(Date.now());

  const onChange = (field) => (e) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;

    const { name, email, message } = values;
    const nextErrors = fieldErrors(name, email, message);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("loading");
    setServerError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          company: "",
          startedAt: mountedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setStatus("error");
        setServerError(
          data.error || "Something went wrong. Please try again."
        );
        return;
      }

      setStatus("success");
      setValues({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
      setServerError(
        "Couldn't reach the server. Check your connection and try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="social-link">
        <h2>Message</h2>
        <div className="w-full h-px my-2 bg-ink/30" />
        <p
          role="status"
          className="text-body text-text-secondary normal-case tracking-normal"
        >
          Message sent — thanks for reaching out. I read every message and
          reply from {" "}
          <span className="lowercase">contactphazotron@gmail.com</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="social-link">
      <h2>Message</h2>
      <div className="w-full h-px my-2 bg-ink/30" />
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-6 normal-case tracking-normal"
      >
        <p className="text-body-sm text-text-tertiary">
          Have a project, a role, or an idea worth talking through? Send a
          few details — I read every message myself.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            id="contact-name"
            label="Name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={onChange("name")}
            error={errors.name}
            maxLength={LIMITS.name}
          />
          <Field
            id="contact-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={onChange("email")}
            error={errors.email}
            maxLength={LIMITS.email}
          />
        </div>

        <Field
          id="contact-message"
          label="Message"
          as="textarea"
          rows={5}
          value={values.message}
          onChange={onChange("message")}
          error={errors.message}
          maxLength={LIMITS.messageMax}
        />

        {/* Honeypot — hidden from sighted and screen-reader users, never
            tab-reachable. A filled value tells api/contact.mjs to silently
            drop the submission. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          value=""
          onChange={() => {}}
        />

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 px-8 py-3 text-body-sm uppercase tracking-[0.12em] rounded-sm bg-accent text-bg-base transition-colors duration-150 ease-precise hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {status === "loading" ? "Sending…" : "Send message"}
          </button>
          {status === "error" && (
            <p role="alert" className="text-body-sm text-state-error">
              {serverError}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
