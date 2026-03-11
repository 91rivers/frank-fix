import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sourceCurrency = searchParams.get('sourceCurrency');
    const targetCurrency = searchParams.get('targetCurrency');
    const sendAmount = searchParams.get('sendAmount');

    if (!sourceCurrency || !targetCurrency || !sendAmount) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://api.transferwise.com/v3/comparisons/?sourceCurrency=${sourceCurrency}&targetCurrency=${targetCurrency}&sendAmount=${sendAmount}`,
            {
                // Basic headers are sometimes helpful for public APIs
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'FrankFix/1.0',
                },
                // Optional: cache data for a short time (e.g., 60 seconds) to avoid immediate re-fetching
                // next: { revalidate: 60 } 
            }
        );

        if (!response.ok) {
            console.error(`Wise API error: ${response.status} ${response.statusText}`);
            return NextResponse.json({ error: 'Failed to fetch data from Wise' }, { status: response.status });
        }

        const data = await response.json();

        if (!data || !data.providers) {
            return NextResponse.json({ error: 'Invalid response format from Wise' }, { status: 500 });
        }

        const wiseProvider = data.providers.find(
            (p: any) => p.alias === 'wise' || p.name === 'Wise' || p.alias === 'transferwise'
        );

        if (!wiseProvider || !wiseProvider.quotes || wiseProvider.quotes.length === 0) {
            return NextResponse.json({ error: 'Wise quote not found in response' }, { status: 404 });
        }

        // Return the first quote
        return NextResponse.json(wiseProvider.quotes[0]);

    } catch (error) {
        console.error('Error fetching Wise API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
