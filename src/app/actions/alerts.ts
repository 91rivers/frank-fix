'use server';

import { supabase } from '@/lib/supabase';

export async function createAlert(formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const mateEmail = formData.get('mateEmail') as string | null;
        const targetDate = formData.get('targetDate') as string;
        const amount = Number(formData.get('amount') as string);
        const baseCurrency = formData.get('baseCurrency') as string;

        if (!email || !targetDate || !amount || !baseCurrency) {
            return { success: false, error: 'Missing required fields' };
        }

        const { error } = await supabase.from('exchange_alerts').insert([
            {
                email,
                mate_email: mateEmail || null,
                target_date: targetDate,
                amount,
                base_currency: baseCurrency,
                status: 'pending'
            }
        ]);

        if (error) {
            console.error('Error inserting alert:', error);
            return { success: false, error: 'Failed to save alert to database. Please try again later.' };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error in createAlert:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
