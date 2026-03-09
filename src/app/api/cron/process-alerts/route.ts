import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchFrankfurterRate } from '@/lib/rates';
import { Resend } from 'resend';
import RateAlertEmail from '@/emails/RateAlertEmail';
import { render } from '@react-email/render';
import React from 'react';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Admin Supabase Client to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    try {
        // 1. Verify Vercel Cron Secret (Security)
        const authHeader = request.headers.get('authorization');
        if (
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch today's rate
        const rateData = await fetchFrankfurterRate('EUR', 'CHF');
        if (!rateData || !rateData.rate) {
            console.error('CRON: Failed to fetch the daily exchange rate.');
            return NextResponse.json({ error: 'Rate fetch failed' }, { status: 500 });
        }

        const currentRate = rateData.rate;
        const todayStr = new Date().toISOString().split('T')[0];

        // 3. Find all pending alerts for today
        const { data: alerts, error: fetchError } = await supabaseAdmin
            .from('exchange_alerts')
            .select('*')
            .eq('target_date', todayStr)
            .eq('status', 'pending');

        if (fetchError) {
            console.error('CRON: Error fetching alerts:', fetchError);
            return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
        }

        if (!alerts || alerts.length === 0) {
            return NextResponse.json({ message: 'No pending alerts for today.' });
        }

        console.log(`CRON: Found ${alerts.length} pending alerts to process.`);

        const sentAlertIds: string[] = [];

        // 4. Process each alert
        for (const alert of alerts) {
            const { id, email, mate_email, amount, base_currency } = alert;

            // Render the email React component into an HTML string
            const emailReactElement = React.createElement(RateAlertEmail, {
                rate: currentRate,
                amount: Number(amount),
                baseCurrency: base_currency as 'EUR' | 'CHF',
                date: todayStr
            });
            const htmlString = await render(emailReactElement);

            const recipients = [email];
            if (mate_email) {
                recipients.push(mate_email);
            }

            try {
                // Send the email with Resend
                const { error: sendError } = await resend.emails.send({
                    from: 'Frank Fix <alerts@frank.91rivers.com>', // Verified domain
                    to: recipients,
                    subject: 'Your daily Frank Rate is here!',
                    html: htmlString,
                });

                if (sendError) {
                    console.error(`CRON: Error sending email to ${email}:`, sendError);
                    continue; // Skip updating status if email failed
                }

                sentAlertIds.push(id);
            } catch (err) {
                console.error(`CRON: Unexpected error processing alert ${id}:`, err);
            }
        }

        // 5. Update status of successfully sent alerts to 'sent'
        if (sentAlertIds.length > 0) {
            const { error: updateError } = await supabaseAdmin
                .from('exchange_alerts')
                .update({ status: 'sent' })
                .in('id', sentAlertIds);

            if (updateError) {
                console.error('CRON: Error updating sent status:', updateError);
            }
        }

        return NextResponse.json({
            message: `Processed ${sentAlertIds.length}/${alerts.length} alerts successfully.`,
            rateUsed: currentRate
        });

    } catch (error) {
        console.error('CRON: Critical error in process-alerts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
