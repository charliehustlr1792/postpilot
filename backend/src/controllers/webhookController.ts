import { Request, Response } from 'express';
import { Webhook } from 'svix';
import prisma from '../lib/db';

// Minimal shape of the Clerk user webhook payload we care about.
interface ClerkUserEvent {
    type: string;
    data: {
        id: string;
        email_addresses?: { id: string; email_address: string }[];
        primary_email_address_id?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        image_url?: string | null;
    };
}

// Handles Clerk user lifecycle webhooks and keeps the local User table in sync.
// The route mounts this with a RAW body parser — svix verifies the exact bytes.
export const handleClerkWebhook = async (req: Request, res: Response) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
        console.error('CLERK_WEBHOOK_SECRET is not set');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    const svixId = req.header('svix-id');
    const svixTimestamp = req.header('svix-timestamp');
    const svixSignature = req.header('svix-signature');
    if (!svixId || !svixTimestamp || !svixSignature) {
        return res.status(400).json({ error: 'Missing svix headers' });
    }

    let evt: ClerkUserEvent;
    try {
        const wh = new Webhook(secret);
        evt = wh.verify(req.body, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        }) as ClerkUserEvent;
    } catch (err) {
        console.error('Clerk webhook verification failed:', err);
        return res.status(400).json({ error: 'Invalid signature' });
    }

    try {
        switch (evt.type) {
            case 'user.created':
            case 'user.updated': {
                const { id: clerkId, email_addresses, primary_email_address_id } = evt.data;

                const email =
                    email_addresses?.find((e) => e.id === primary_email_address_id)?.email_address ??
                    email_addresses?.[0]?.email_address;

                if (!email) {
                    return res.status(400).json({ error: 'No email address on user' });
                }

                const firstName = evt.data.first_name ?? null;
                const lastName = evt.data.last_name ?? null;
                const avatar = evt.data.image_url ?? null;

                // Upsert so the handler is idempotent (Clerk retries on failure).
                await prisma.user.upsert({
                    where: { clerkId },
                    create: { clerkId, email, firstName, lastName, avatar },
                    update: { email, firstName, lastName, avatar },
                });
                break;
            }

            case 'user.deleted': {
                const clerkId = evt.data.id;
                if (clerkId) {
                    // deleteMany avoids throwing if the user was never synced.
                    await prisma.user.deleteMany({ where: { clerkId } });
                }
                break;
            }

            default:
                // Ignore event types we don't handle.
                break;
        }

        return res.status(200).json({ received: true });
    } catch (err) {
        console.error('Error handling Clerk webhook event:', err);
        return res.status(500).json({ error: 'Error processing webhook' });
    }
};
