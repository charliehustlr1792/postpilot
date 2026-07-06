import { Resend } from 'resend';

// Email is best-effort: if RESEND_API_KEY isn't set we skip sending (the invite
// record is still created) so the feature works before credentials are added.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend allows sending from onboarding@resend.dev in test mode without a
// verified domain; override with EMAIL_FROM once a domain is set up.
const FROM = process.env.EMAIL_FROM || 'PostPilot <onboarding@resend.dev>';

interface TeamInviteEmail {
    to: string;
    role: string;
    inviterName: string;
}

// Sends a team invite email. Returns whether an email was actually sent.
export async function sendTeamInviteEmail({ to, role, inviterName }: TeamInviteEmail): Promise<boolean> {
    if (!resend) {
        console.warn(`RESEND_API_KEY not set — skipping invite email to ${to}`);
        return false;
    }

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();

    await resend.emails.send({
        from: FROM,
        to,
        subject: `${inviterName} invited you to their team on PostPilot`,
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #181817;">
              <h2 style="color: #FF6E00;">You've been invited to PostPilot</h2>
              <p><strong>${inviterName}</strong> has invited you to join their workspace as a <strong>${roleLabel}</strong>.</p>
              <p>Create your account to get started:</p>
              <p>
                <a href="${appUrl}/sign-up"
                   style="display: inline-block; background: #FF6E00; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600;">
                  Accept invitation
                </a>
              </p>
              <p style="color: #4D4946; font-size: 13px;">If you weren't expecting this, you can ignore this email.</p>
            </div>
        `,
    });

    return true;
}
