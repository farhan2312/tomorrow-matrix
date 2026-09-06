import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Tomorrow Matrix" },
      {
        name: "description",
        content:
          "How Tomorrow Matrix collects, uses, and protects your data, including account, gameplay, and multiplayer information.",
      },
    ],
  }),
  component: PrivacyPage,
});

// Update this whenever the policy content changes.
const LAST_UPDATED = "September 6, 2026";
// TODO: replace with a real monitored contact address before public launch.
const CONTACT_EMAIL = "privacy@example.com";

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[image:var(--gradient-terra)] text-white">
            <Globe2 className="h-4 w-4" />
          </div>
          <span className="font-display text-base font-semibold">Tomorrow Matrix</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </nav>

      <article className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 grid gap-8 text-sm leading-relaxed text-foreground/90">
          <section className="grid gap-2">
            <p>
              This Privacy Policy explains how Tomorrow Matrix ("we", "us", the "Service") collects,
              uses, and safeguards your information when you use our web application. Tomorrow Matrix
              is an educational climate-strategy game. We aim to collect as little personal data as
              possible and to be clear about what we do collect and why. By using the Service, you
              agree to the practices described below.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="font-display text-xl font-semibold">1. Information we collect</h2>
            <p>We collect the following categories of information:</p>
            <ul className="ml-5 list-disc grid gap-1.5">
              <li>
                <strong>Account information.</strong> If you create an account, we collect your email
                address and a display name. If you sign in with Google, we receive your name, email
                address, and profile picture from Google in accordance with your Google account
                settings. We do not receive your Google password.
              </li>
              <li>
                <strong>Authentication data.</strong> We store the credentials and session tokens
                needed to keep you signed in. Passwords, where used, are hashed and never stored in
                plain text by our authentication provider.
              </li>
              <li>
                <strong>Gameplay data.</strong> Your in-game progress, chosen role, decisions,
                Climate Action Points, journal entries, and similar game state, so your progress can
                be saved and restored.
              </li>
              <li>
                <strong>Multiplayer data.</strong> When you create or join a multiplayer session, we
                store the session code, your chosen display name, your selected role, and the events
                and votes you contribute during that session so other players in the same session can
                see them.
              </li>
              <li>
                <strong>Guest data.</strong> If you play as a guest without an account, your progress
                is stored locally in your browser (local storage) and is not sent to our servers as an
                account record.
              </li>
              <li>
                <strong>Technical data.</strong> Basic technical information such as your browser type
                and IP address may be processed by our hosting and infrastructure providers to deliver
                and secure the Service.
              </li>
            </ul>
          </section>

          <section className="grid gap-2">
            <h2 className="font-display text-xl font-semibold">2. How we use your information</h2>
            <ul className="ml-5 list-disc grid gap-1.5">
              <li>To create and manage your account and authenticate you.</li>
              <li>To save, sync, and restore your gameplay progress across devices and sessions.</li>
              <li>To operate real-time multiplayer sessions and share relevant state with players in your session.</li>
              <li>To maintain the security, integrity, and reliability of the Service.</li>
              <li>To respond to your requests and provide support.</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal information, and we do not use it for
              third-party advertising.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="font-display text-xl font-semibold">3. Service providers</h2>
            <p>
              We rely on the following third-party providers to run the Service. Your data is processed
              by them only to provide functionality to us:
            </p>
            <ul className="ml-5 list-disc grid gap-1.5">
              <li>
                <strong>Supabase</strong> — database, authentication, and real-time infrastructure
                that stores your account and gameplay data.
              </li>
              <li>
                <strong>Vercel</strong> — application hosting and content delivery.
              </li>
              <li>
                <strong>Google</strong> — optional "Sign in with Google" authentication, if you choose
                to use it.
              </li>
            </ul>
          </section>

          <section className="grid gap-2">
            <h2 className="font-display text-xl font-semibold">4. Cookies and local storage</h2>
            <p>
              We use cookies and browser local storage for essential purposes only: to keep you signed
              in, to remember your preferences (such as audio settings), and to store guest progress on
              your device. We do not use advertising or cross-site tracking cookies.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="font-display text-xl font-semibold">5. Data retention</h2>
            <p>
              We retain account and gameplay data for as long as your account is active. Multiplayer
              session records are retained to support ongoing and recent sessions and may be removed
              periodically. Guest progress stored in your browser remains until you clear your browser
              storage. You may request deletion of your account and associated data at any time.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="font-display text-xl font-semibold">6. Your rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, export, or delete
              your personal data, and to withdraw consent. To exercise these rights, contact us using
              the details below. You can also delete most guest data yourself by clearing your browser's
              local storage.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="font-display text-xl font-semibold">7. Children's privacy</h2>
            <p>
              Tomorrow Matrix may be used in educational settings. We do not knowingly collect more
              personal information than is necessary to provide the Service. If you believe a child has
              provided us personal data without appropriate consent, please contact us and we will take
              reasonable steps to delete it.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="font-display text-xl font-semibold">8. Security</h2>
            <p>
              We take reasonable technical and organizational measures to protect your data, including
              encrypted connections and access controls at the database level. No method of transmission
              or storage is completely secure, however, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="font-display text-xl font-semibold">9. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the "Last
              updated" date above. Your continued use of the Service after changes take effect
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="font-display text-xl font-semibold">10. Contact us</h2>
            <p>
              If you have questions about this Privacy Policy or how your data is handled, contact us at{" "}
              <a className="text-[color:var(--terra-deep)] hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="text-[color:var(--terra-deep)] hover:underline">
            Return home
          </Link>
        </div>
      </article>
    </main>
  );
}
